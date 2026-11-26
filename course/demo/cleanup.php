<?php
/**
 * Cleans the LOCAL database of the base install for the tutorial videos: removes everything that isn't part of the demo
 * organisation (De Heidestappers). Content only: never project config, users or Formie forms.
 *
 * Idempotent. Run it with
 *   bash course/demo/run.sh --cleanup     (removes the showcase, runs this script, then demo-content.php)
 * or, after copying:  ddev exec php storage/runtime/cleanup.php [--dry-run]
 *
 * What it removes (hard delete):
 *   - dummy content (slug dummy-*) in news, calendar, knowledge base, team, partners and their category sections;
 *   - the lorem news categories (all except Natuurbeheer, Routes, Activiteiten);
 *   - leftover pages (old "Over ons" children, test pages);
 *   - unpublished drafts;
 *   - the assets in the root folder, Demo/ and Events/ that the demo doesn't use (demo-content.php imports its own);
 *   - disabled menu nodes and nodes whose element is gone;
 *   - everything in the trash, except users (never deleted) and "Oude zomerwandeling" (video 6.4).
 * The content builder showcase (slug gridbuilder) is removed by run.sh with `craft statik/contentbuilder-cleanup`.
 */

require '/var/www/html/bootstrap.php';
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

use craft\db\Query;
use craft\db\Table;
use craft\elements\Asset;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\Db;

$DRY = in_array('--dry-run', $argv, true);
$elements = Craft::$app->getElements();
$log = function(string $msg) { echo $msg . PHP_EOL; };
$admin = User::find()->admin(true)->status(null)->orderBy('id')->one();
try { Craft::$app->getUser()->setIdentity($admin); } catch (\Throwable) {}

/** Hard-deletes entries, deepest first (structures stay valid). Returns the titles. */
$remove = function(array $entries) use ($elements, $DRY): array {
    usort($entries, fn($a, $b) => ($b->level ?? 0) <=> ($a->level ?? 0));
    $titles = [];
    foreach ($entries as $e) {
        $titles[] = $e->title ?: $e->slug;
        if (!$DRY) $elements->deleteElement($e, true);
    }
    return $titles;
};
$all = fn(string $section) => Entry::find()->section($section)->site('*')->unique()->status(null);

// ============================================================================
// Dummy content and lorem categories
// ============================================================================

foreach (['news', 'calendar', 'knowledgeBase', 'team', 'partners', 'newsCategories', 'calendarCategories', 'knowledgeBaseCategories'] as $section) {
    $n = count($remove($all($section)->slug('dummy-*')->all()));
    if ($n) $log("✓ $section: $n dummy entries removed");
}
$keepNewsCats = ['natuurbeheer', 'routes', 'activiteiten'];
$lorem = $remove($all('newsCategories')->slug(array_merge(['not'], $keepNewsCats))->all());
if ($lorem) $log('✓ News categories removed: ' . implode(', ', $lorem));

// ============================================================================
// Leftover pages (any site). The demo pages, "Bedankt" (redirect of the contact form) and "Content rows demo"
// (the making-screencasts skill's example) stay.
// ============================================================================

$overOns = Entry::find()->section('pages')->slug('over-ons')->site('*')->unique()->status(null)->one();
$leftovers = $all('pages')->slug(['onze-contentbuilder', 'geschiedenis', 'translate-test', 'trinity', 'guidde-demo', 'grid-test', 'page-with-sidebar'])->all();
if ($overOns) $leftovers = array_merge($leftovers, Entry::find()->section('pages')->descendantOf($overOns)->slug('team')->site('*')->unique()->status(null)->all());
$t = $remove($leftovers);
if ($t) $log('✓ Pages removed: ' . implode(', ', $t));

// ============================================================================
// Unpublished drafts (new entries that were never saved)
// ============================================================================

$drafts = Entry::find()->drafts()->draftOf(false)->site('*')->unique()->status(null)->all();
foreach ($drafts as $d) if (!$DRY) $elements->deleteElement($d, true);
if ($drafts) $log('✓ Unpublished drafts removed: ' . count($drafts));

// ============================================================================
// Assets: the root folder, Demo/ and Events/ held the base install's office photos. Keep only the demo files.
// ============================================================================

$volume = Craft::$app->getVolumes()->getVolumeByHandle('publicFiles');
$root = Craft::$app->getAssets()->getRootFolderByVolumeId($volume->id);
$demoRootFiles = ['herfstbos.jpg', 'groepswandeling.jpg', 'gezin-in-het-bos.jpg', 'paaltje.jpg', 'opruimactie.jpg', 'vogels-zonsopgang.jpg',
    'zwanen.jpg', 'winterbos.jpg', 'kaart-en-kompas.jpg', 'hond-op-de-heide.jpg', 'verrekijker.jpg', 'uitzicht-bos.jpg', 'moeras-vlonder.jpg'];
$gone = [];
foreach (Asset::find()->folderId($root->id)->all() as $a) {
    if (in_array($a->filename, $demoRootFiles, true)) continue;
    $gone[] = $a->filename;
    if (!$DRY) $elements->deleteElement($a, true);
}
foreach (['Demo/', 'Events/'] as $path) {
    $f = Craft::$app->getAssets()->findFolder(['volumeId' => $volume->id, 'path' => $path]);
    if (!$f) continue;
    foreach (Asset::find()->folderId($f->id)->all() as $a) $gone[] = "$path{$a->filename}";
    if (!$DRY) Craft::$app->getAssets()->deleteFoldersByIds($f->id);
}
if ($gone) $log('✓ Assets removed (' . count($gone) . '): ' . implode(', ', $gone));

// ============================================================================
// Menus: disabled nodes (the old menu) and nodes whose element no longer exists
// ============================================================================

$orphans = (new Query())->from('{{%navigate_nodes}} n')->leftJoin(Table::ELEMENTS . ' e', '[[e.id]] = [[n.elementId]]')
    ->where(['n.type' => 'element'])->andWhere(['or', ['e.id' => null], ['not', ['e.dateDeleted' => null]]])->column();
$disabled = (new Query())->from('{{%navigate_nodes}}')->where(['siteId' => 1, 'enabled' => 0])->select(['id'])->column();
$nodes = array_unique(array_merge($orphans, $disabled));
if ($nodes && !$DRY) Db::delete('{{%navigate_nodes}}', ['id' => $nodes]);
if ($nodes) $log('✓ Menu nodes removed: ' . count($nodes));

// ============================================================================
// Trash: hard-delete all trashed elements except users and "Oude zomerwandeling"
// ============================================================================

$keep = (new Query())->from(Table::ELEMENTS_SITES)->where(['slug' => 'oude-zomerwandeling'])->select(['elementId'])->column();
$cond = ['and', ['not', ['dateDeleted' => null]], ['not', ['type' => User::class]], ['not', ['id' => $keep ?: [0]]]];
$total = (new Query())->from(Table::ELEMENTS)->where($cond)->count();
if ($total && !$DRY) {
    $done = 0;
    while ($ids = (new Query())->from(Table::ELEMENTS)->where($cond)->select(['id'])->limit(2000)->column()) {
        Db::delete(Table::ELEMENTS, ['id' => $ids]);
        $done += count($ids);
        if ($done % 50000 < 2000) $log("  … $done of $total");
    }
}
if ($total) $log("✓ Trash emptied: $total elements (trashed users kept)");

// Revisions and drafts of the deleted entries are gone with them (cascade); search index rows of missing elements too
if (!$DRY) {
    Craft::$app->getDb()->createCommand('DELETE s FROM {{%searchindex}} s LEFT JOIN {{%elements}} e ON e.id = s.elementId WHERE e.id IS NULL')->execute();
    Craft::$app->getCache()->flush();
}
$log($DRY ? 'Dry run: nothing changed.' : 'Cleanup done.');
null;
