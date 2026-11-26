<?php
/**
 * Demo content for the Rectangle tutorial videos (course/videos): a fictional nature-walk
 * organisation ("De Heidestappers"). LOCAL database of the base install only. Content only: no project config changes.
 * It also fills the base install's own pages (home hero + rows, contact, cookie / privacy / accessibility pages, 404, search
 * results, overviews) and adds news, events, knowledge base tips and team photos. cleanup.php (run.sh --cleanup) removes the
 * rest of the base install's dummy content first.
 *
 * Idempotent: everything is found by slug / title / filename and only created when missing. Run it with
 *   bash course/demo/run.sh            (copies this file + images to storage/runtime/ and runs it)
 * or, after copying:  ddev exec php storage/runtime/demo-content.php [options]
 *
 * Options:
 *   --refresh            write the demo field values again on the entries this script owns (back to the base state)
 *   --state=<video>      put one entry in the state a video starts from, e.g. --state=3.1 (3.1, 3.4, default, 6.4, 4 = Kempen + Ardennen for part 4, 12 = Wandelen met de hond for part 12: see the end of the script)
 *
 * Images are read from storage/runtime/demo-images/ (run.sh copies course/demo/images there).
 */

require '/var/www/html/bootstrap.php';
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

use craft\elements\Asset;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\Db;
use craft\helpers\StringHelper;

const NL = 1;
const IMG_DIR = '/var/www/html/storage/runtime/demo-images';
const BACKUP = '/var/www/html/storage/runtime/demo-backup.json';

$opts = getopt('', ['refresh', 'state:']);
$REFRESH = isset($opts['refresh']);
$STATE = $opts['state'] ?? null;

$log = function(string $msg) { echo $msg . PHP_EOL; };
$fail = function(string $msg) { fwrite(STDERR, "✗ $msg" . PHP_EOL); };

$elements = Craft::$app->getElements();
$admin = User::find()->admin(true)->status(null)->orderBy('id')->one();
try { Craft::$app->getUser()->setIdentity($admin); } catch (\Throwable) {}

// ============================================================================
// Assets
// ============================================================================

$volume = Craft::$app->getVolumes()->getVolumeByHandle('publicFiles');
$folder = fn(string $path) => trim($path, '/') === '' ? Craft::$app->getAssets()->getRootFolderByVolumeId($volume->id)
    : Craft::$app->getAssets()->ensureFolderByFullPathAndVolume(trim($path, '/') . '/', $volume);

/** Imports (or finds) an asset; $meta: title, alt, caption, copyright, focal ([x, y]). Meta is only written on create or --refresh. */
$asset = function(string $folderPath, string $file, array $meta = []) use ($folder, $elements, $REFRESH, $fail): ?int {
    $f = $folder($folderPath);
    $a = Asset::find()->folderId($f->id)->filename($file)->one();
    $isNew = !$a;
    if ($isNew) {
        $src = IMG_DIR . '/' . $file;
        if (!is_file($src)) { $fail("Image file missing: $src"); return null; }
        $tmp = Craft::$app->getPath()->getTempPath() . '/demo-' . StringHelper::randomString(8) . '-' . $file;
        copy($src, $tmp);
        $a = new Asset();
        $a->tempFilePath = $tmp;
        $a->filename = $file;
        $a->newFolderId = $f->id;
        $a->volumeId = $f->volumeId;
        $a->setScenario(Asset::SCENARIO_CREATE);
    }
    if ($isNew || $REFRESH) {
        if (isset($meta['title'])) $a->title = $meta['title'];
        $a->alt = $meta['alt'] ?? null;
        $a->setFieldValue('imageCaption', $meta['caption'] ?? null);
        $a->setFieldValue('imageCopyright', $meta['copyright'] ?? null);
        if (isset($meta['focal'])) $a->setFocalPoint(['x' => $meta['focal'][0], 'y' => $meta['focal'][1]]);
        if (!$elements->saveElement($a)) { $fail("Asset $file: " . implode(' ', $a->getFirstErrors())); return null; }
    }
    return $a->id;
};

$A = [];
// Wandelroutes: the route photos, the map, the photos for the focal point / editing / alt text videos
foreach ([
    'IMG_4031.jpg' => ['title' => 'IMG_4031'],              // 5.3 renames it and leaves alt empty (decorative)
    'kaart-heideroute.png' => ['title' => 'Kaart heideroute'], // 5.3 types the alt text in the take
    'heideroute.jpg' => [], 'heide-close-up.jpg' => [], 'heide-delen.jpg' => [], 'heidelandschap.jpg' => [],
    'heide-staand.jpg' => [], 'gids-aan-de-vijver.jpg' => [], 'vlonder.jpg' => [], 'bospad.jpg' => [],
    'beekroute.jpg' => [], 'bosroute.jpg' => [], 'vijver-lus.jpg' => [],
] as $file => $meta) { $A[$file] = $asset('Wandelroutes', $file, $meta); }
// A walking day (gallery: informative, so alt text), plus mood photos (decorative: no alt)
$galleryAlt = [
    'wandeldag-1.jpg' => 'Een groep wandelaars op een bospad vol herfstbladeren',
    'wandeldag-2.jpg' => 'Vier wandelaars met rugzak op een breed pad tussen hoge bomen',
    'wandeldag-3.jpg' => 'Wandelaars steken een grasvlakte over naar de bosrand',
    'wandeldag-4.jpg' => 'De groep volgt de gids op een verhard pad door het bos',
    'wandeldag-5.jpg' => 'Drie deelnemers praten onderweg met elkaar',
    'wandeldag-6.jpg' => 'Groepsfoto van de deelnemers aan het einde van de wandeling',
];
foreach ($galleryAlt as $file => $alt) { $A[$file] = $asset('Wandeldag', $file, ['alt' => $alt]); }
foreach (['wandelaars.jpg', 'kempen.jpg', 'ardennen.jpg'] as $file) { $A[$file] = $asset('Wandeldag', $file); }
$A['dijle-pad.jpg'] = $asset('Nieuws', 'dijle-pad.jpg');
$A['ochtendwandeling.jpg'] = $asset('Agenda', 'ochtendwandeling.jpg');
$A['wandelkaart-heideroute.pdf'] = $asset('Documenten', 'wandelkaart-heideroute.pdf', ['title' => 'Wandelkaart Heideroute']);
$A['routekaart-beekvallei.pdf'] = $asset('Documenten', 'routekaart-beekvallei.pdf', ['title' => 'Routekaart Beekvallei']);
// Team portraits: seen from behind, decorative (the name is next to them), focal point on the person
foreach (['team-femke.jpg' => [0.42, 0.4], 'team-joris.jpg' => [0.47, 0.55], 'team-ilse.jpg' => [0.5, 0.42], 'team-stijn.jpg' => [0.45, 0.5]] as $file => $fp) {
    $A[$file] = $asset('Team', $file, ['focal' => $fp]);
}
// Site pages: header images (decorative, no alt) and a few images in image columns (informative, with alt)
foreach ([
    'heide-wandelaars.jpg' => ['focal' => [0.55, 0.35]], 'heidepad.jpg' => ['focal' => [0.45, 0.6]], 'bosweg-wandelaar.jpg' => ['focal' => [0.5, 0.6]],
    'wegwijzer.jpg' => ['focal' => [0.42, 0.45]], 'vlonder-bos.jpg' => [], 'riet.jpg' => [], 'heide-bloei.jpg' => [], 'gouden-bos.jpg' => [],
    'mistig-bos.jpg' => [], 'bospad-zon.jpg' => ['focal' => [0.5, 0.7]], 'boshyacinten.jpg' => [], 'rijp.jpg' => [],
    'vrijwilligers.jpg' => ['alt' => 'Vijf vrijwilligers met volle vuilniszakken na een opruimactie in het bos', 'focal' => [0.5, 0.45]],
] as $file => $meta) { $A[$file] = $asset('Algemeen', $file, $meta); }
// News and events: loose in the root folder (video 5.1 sorts them into folders). Card images: decorative.
foreach ([
    'herfstbos.jpg' => [], 'groepswandeling.jpg' => ['focal' => [0.5, 0.55]], 'gezin-in-het-bos.jpg' => ['focal' => [0.6, 0.5]],
    'paaltje.jpg' => ['focal' => [0.52, 0.62]], 'opruimactie.jpg' => ['focal' => [0.68, 0.45]], 'vogels-zonsopgang.jpg' => [],
    'zwanen.jpg' => ['focal' => [0.75, 0.5]], 'winterbos.jpg' => [], 'kaart-en-kompas.jpg' => ['focal' => [0.55, 0.45]],
    'hond-op-de-heide.jpg' => ['focal' => [0.32, 0.55]], 'verrekijker.jpg' => ['focal' => [0.68, 0.4]], 'uitzicht-bos.jpg' => ['focal' => [0.47, 0.5]],
    'moeras-vlonder.jpg' => ['focal' => [0.6, 0.6]],
] as $file => $meta) { $A[$file] = $asset('', $file, $meta); }
// Logos only show the name as an image: informative, so the name is the alt text
$A['logo-heidevrienden.png'] = $asset('Partners', 'logo-heidevrienden.png', ['title' => 'Logo Heidevrienden', 'alt' => 'Heidevrienden']);
$A['logo-bezoekerscentrum-de-ven.png'] = $asset('Partners', 'logo-bezoekerscentrum-de-ven.png', ['title' => 'Logo Bezoekerscentrum De Ven', 'alt' => 'Bezoekerscentrum De Ven']);
$A['logo-bakkerij-het-graan.png'] = $asset('Partners', 'logo-bakkerij-het-graan.png', ['title' => 'Logo Bakkerij Het Graan', 'alt' => 'Bakkerij Het Graan']);
$log('✓ Assets: ' . count(array_filter($A)) . ' of ' . count($A));

// ============================================================================
// Helpers: entries, links, rows and columns
// ============================================================================

/** Finds an entry by section + slug (any status, also disabled for the site), or creates it. Returns [entry, isNew]. */
$findOrCreate = function(string $section, string $slug, string $title, array $attrs = []) use ($elements, $admin, $fail): array {
    $e = Entry::find()->section($section)->slug($slug)->siteId(NL)->status(null)->one();
    if ($e) return [$e, false];
    $s = Craft::$app->getEntries()->getSectionByHandle($section);
    $e = new Entry();
    $e->sectionId = $s->id;
    $e->typeId = $s->getEntryTypes()[0]->id;
    $e->siteId = NL;
    $e->slug = $slug;
    if ($title !== '') $e->title = $title;
    if ($admin && $s->type !== 'single') $e->setAuthorIds([$admin->id]);
    if (!empty($attrs['parent'])) $e->setParentId($attrs['parent']->id);
    // Dutch content: only on the NL site, unless the video needs the other languages
    if (empty($attrs['allSites'])) $e->setEnabledForSite([1 => true, 2 => false, 3 => false]);
    foreach ($attrs['fields'] ?? [] as $h => $v) $e->setFieldValue($h, $v);
    if (!$elements->saveElement($e)) { $fail("$section/$slug: " . json_encode($e->getErrors())); return [null, false]; }
    return [$e, true];
};

$save = function(Entry $e, array $fields, array $attrs = []) use ($elements, $fail): bool {
    foreach ($attrs as $k => $v) $e->$k = $v;
    $e->setFieldValues($fields);
    if (!$elements->saveElement($e)) { $fail("{$e->title}: " . json_encode($e->getErrors())); return false; }
    return true;
};

$ref = fn(?Entry $e) => $e ? "{entry:{$e->id}@" . NL . ":url}" : '#';
$aref = fn(?int $id) => "{asset:$id@" . NL . ":url}";

/** A Link field value. $to: Entry, ['asset' => id], or a URL / mailto: / tel: string. */
$link = function($to, ?string $label = null, bool $blank = false, ?string $anchor = null) use ($ref, $aref): ?array {
    if ($to instanceof Entry) $v = ['type' => 'entry', 'value' => $ref($to)];
    elseif (is_array($to) && isset($to['asset'])) $v = ['type' => 'asset', 'value' => $aref($to['asset'])];
    elseif (is_string($to)) $v = ['type' => 'url', 'value' => $to];
    else return null;
    return array_filter($v + ['label' => $label, 'target' => $blank ? '_blank' : null, 'urlSuffix' => $anchor ? '#' . $anchor : null]);
};

/** The "ctas" (Links) Matrix: list of [to, label, style, blank, anchor]. */
$ctas = function(array $items) use ($link): array {
    $out = [];
    foreach ($items as $i => $it) {
        [$to, $label, $style] = $it + [null, null, 'btn btn--primary'];
        $out['new' . ($i + 1)] = ['type' => 'cta', 'enabled' => true, 'fields' => [
            'linkField' => $link($to, $label, $it[3] ?? false, $it[4] ?? null), 'linkStyle' => $style,
        ]];
    }
    return $out;
};

$row = function(string $layout, array $cells, array $fields = []): array {
    $c = [];
    foreach (array_values($cells) as $i => $cell) $c['new' . ($i + 1)] = $cell + ['enabled' => true];
    return ['type' => 'gridRow', 'enabled' => true, 'fields' => ['gridLayout' => $layout, 'gridCells' => $c] + $fields];
};
$rows = function(array $list): array { $o = []; foreach (array_values($list) as $i => $r) $o['new' . ($i + 1)] = $r; return $o; };

$text = fn(?string $title, string $html, array $links = [], bool $showTitle = true) => ['type' => 'cellText', 'fields' => array_filter([
    'blockTitle' => $title, 'showTitle' => $showTitle, 'text' => $html, 'ctas' => $links ? $ctas($links) : null,
], fn($v) => $v !== null)];
$image = fn(?int $id, bool $popup = false) => ['type' => 'cellImage', 'fields' => ['image' => array_filter([$id]), 'showLargerVersionInPopup' => $popup]];
$gallery = fn(array $ids, string $width = '1/3', string $type = 'grid') => ['type' => 'cellImageGallery', 'fields' => [
    'images' => array_values(array_filter($ids)), 'imageGalleryType' => $type, 'imageWidth' => $width, 'imagePosition' => 'center', 'showLargerVersionInPopup' => true,
]];
$quote = fn(string $q, string $name, ?string $role = null) => ['type' => 'cellQuote', 'fields' => array_filter(['text' => $q, 'authorName' => $name, 'authorRole' => $role])];
$video = fn(string $url, ?int $placeholder, ?string $caption = null) => ['type' => 'cellVideo', 'fields' => array_filter([
    'video' => ['type' => 'url', 'value' => $url], 'placeholderImage' => array_filter([$placeholder]), 'videoCaption' => $caption,
])];
$table = fn(string $html, ?string $caption = null) => ['type' => 'cellTable', 'fields' => array_filter(['table' => $html, 'tableCaption' => $caption, 'mobileTable' => 'cards'])];
$faq = fn(string $title, array $qa) => ['type' => 'cellFaq', 'fields' => ['blockTitle' => $title, 'showTitle' => true, 'faqBlock' => (function() use ($qa) {
    $o = []; $i = 0;
    foreach ($qa as $q => $a) $o['new' . (++$i)] = ['type' => 'titleText', 'enabled' => true, 'fields' => ['blockTitle' => $q, 'text' => "<p>$a</p>"]];
    return $o;
})()]];
$numbers = fn(string $title, array $items) => ['type' => 'cellNumbers', 'fields' => ['blockTitle' => $title, 'showTitle' => true, 'numbers' => (function() use ($items) {
    $o = []; $i = 0;
    foreach ($items as [$n, $label]) $o['new' . (++$i)] = ['type' => 'numberItem', 'enabled' => true, 'fields' => ['number' => $n, 'numberLabel' => $label]];
    return $o;
})()]];
$overview = fn(string $title, array $entries, array $extra = []) => ['type' => 'cellOverview', 'fields' => $extra + [
    'blockTitle' => $title, 'showTitle' => true, 'overviewOptions' => 'entries', 'entries' => array_map(fn($e) => $e->id, array_filter($entries)),
    'overviewType' => 'grid', 'cardLayout' => 'stacked', 'highlightFirst' => false, 'dynamicFill' => false,
]];
$cta = fn(string $title, string $html, array $links, ?int $img) => ['type' => 'cellCallToAction', 'fields' => [
    'blockTitle' => $title, 'showTitle' => true, 'text' => $html, 'ctas' => $ctas($links), 'image' => array_filter([$img]),
]];
$person = fn(?Entry $p) => ['type' => 'cellPerson', 'fields' => ['person' => array_filter([$p?->id])]];
$form = fn(?int $formId) => ['type' => 'cellForm', 'fields' => ['form' => array_filter([$formId])]];
$team = fn(string $title, array $members = [], string $cols = '4') => ['type' => 'cellTeam', 'fields' => [
    'blockTitle' => $title, 'showTitle' => true, 'teamColumns' => $cols, 'teamMembers' => array_map(fn($e) => $e->id, $members),
]];
$partnersCell = fn(string $title, string $type = 'grid') => ['type' => 'cellPartners', 'fields' => ['blockTitle' => $title, 'showTitle' => true, 'partnersType' => $type, 'partners' => []]];

$P = []; // pages by key
$page = function(string $key, string $title, string $slug, array $attrs = []) use (&$P, $findOrCreate): ?Entry {
    [$e, $isNew] = $findOrCreate('pages', $slug, $title, $attrs);
    $P[$key] = $e;
    $GLOBALS['NEW'][$key] = $isNew;
    return $e;
};
$GLOBALS['NEW'] = [];
$isNew = fn(string $key) => $GLOBALS['NEW'][$key] ?? false;
// --state=4: write "Wandelen in de Kempen" and "Wandelen in de Ardennen" again (the start of the part 4 videos)
$fill = fn(string $key) => ($GLOBALS['NEW'][$key] ?? false) || $REFRESH || ($STATE === '4' && in_array($key, ['kempen', 'ardennen'], true)) || (in_array($STATE, ['12', '12b'], true) && $key === 'hond');

// ============================================================================
// Categories, team, partners
// ============================================================================

$C = [];
foreach (['Natuurbeheer', 'Routes', 'Activiteiten'] as $t) { [$C[$t]] = $findOrCreate('newsCategories', StringHelper::toKebabCase($t), $t); }
[$C['Begeleide wandeling']] = $findOrCreate('calendarCategories', 'begeleide-wandeling', 'Begeleide wandeling');
$log('✓ Categories: news Natuurbeheer, Routes, Activiteiten; calendar Begeleide wandeling');

$T = [];
foreach ([
    ['femke-dewandelaer', 'Femke', 'Dewandelaer', 'Natuurgids Heideroute', 'team-femke.jpg', '016 00 00 01'],
    ['joris-heideveld', 'Joris', 'Heideveld', 'Gids gezinswandelingen', 'team-joris.jpg', '016 00 00 02'],
    ['ilse-vanderbeek', 'Ilse', 'Vanderbeek', 'Coördinator vrijwilligers', 'team-ilse.jpg', '016 00 00 03'],
    ['stijn-boschmans', 'Stijn', 'Boschmans', 'Gids natuurbeheer', 'team-stijn.jpg', '016 00 00 04'],
] as [$slug, $first, $last, $job, $photo, $phone]) {
    [$e, $new] = $findOrCreate('team', $slug, '');
    $oldPhoto = $e?->photo->one();
    if ($e && ($new || $REFRESH || ($oldPhoto && str_starts_with($oldPhoto->filename, 'gids-')))) $save($e, ['firstName' => $first, 'lastName' => $last, 'jobTitle' => $job,
        'photo' => array_filter([$A[$photo]]), 'email' => strtolower($first) . '@example.com', 'phoneNumber' => $phone]);
    $T[] = $e;
}
$log('✓ Team: ' . implode(', ', array_map(fn($e) => $e?->title, $T)));
// The old portraits (gids-1..4.jpg) showed recognisable faces: remove them once nothing uses them
foreach (Asset::find()->volumeId($volume->id)->filename(['gids-1.jpg', 'gids-2.jpg', 'gids-3.jpg', 'gids-4.jpg'])->all() as $old) {
    $used = (new craft\db\Query())->from('{{%relations}} r')->innerJoin('{{%elements}} e', '[[e.id]] = [[r.sourceId]]')
        ->where(['r.targetId' => $old->id, 'e.revisionId' => null, 'e.draftId' => null, 'e.dateDeleted' => null])->exists();
    if (!$used) $elements->deleteElement($old, true);
}

$PA = [];
foreach ([
    ['heidevrienden', 'Heidevrienden', 'logo-heidevrienden.png'],
    ['bezoekerscentrum-de-ven', 'Bezoekerscentrum De Ven', 'logo-bezoekerscentrum-de-ven.png'],
    ['bakkerij-het-graan', 'Bakkerij Het Graan', 'logo-bakkerij-het-graan.png'],
] as [$slug, $title, $logo]) {
    [$e, $new] = $findOrCreate('partners', $slug, $title);
    if ($e && ($new || $REFRESH)) $save($e, ['logo' => array_filter([$A[$logo]]), 'website' => ['type' => 'url', 'value' => 'https://www.example.com/']]);
    $PA[] = $e;
}
$log('✓ Partners: ' . implode(', ', array_map(fn($e) => $e?->title, $PA)));

$contactForm = verbb\formie\elements\Form::find()->handle('contact_NL')->one();
$formId = $contactForm?->id;

// ============================================================================
// Pages: first the shells (so links between them resolve), then the content
// ============================================================================

$overOns = Entry::find()->section('pages')->slug('over-ons')->siteId(NL)->status(null)->one(); // existing page, not changed

$page('wandelroutes', 'Wandelroutes', 'wandelroutes');
$page('heideroute', 'Heideroute', 'heideroute', ['parent' => $P['wandelroutes']]);
$page('beek', 'Route langs de beek', 'route-langs-de-beek', ['parent' => $P['wandelroutes']]);
$page('vijver', 'Vijverroute', 'vijverroute', ['parent' => $P['wandelroutes']]);
// The disabled copy "Wandelroutes" (wandelroutes-2) is made and removed by the 02-05 take itself
if ($overOns) $page('onsTeam', 'Ons team', 'ons-team', ['parent' => $overOns]);
$page('praktisch', 'Praktische info', 'praktische-info');
$page('kinderwandelingen', 'Kinderwandelingen', 'kinderwandelingen');
$page('metKinderen', 'Wandelen met kinderen', 'wandelen-met-kinderen');
$page('zomer', 'Zomerwandeling', 'zomerwandeling');
$page('kempen', 'Wandelen in de Kempen', 'wandelen-in-de-kempen');
$page('ardennen', 'Wandelen in de Ardennen', 'wandelen-in-de-ardennen');
$page('inschrijven', 'Inschrijven herfstwandeling', 'inschrijven-herfstwandeling');
$page('najaar', 'Najaarswandeling 2026', 'najaarswandeling-2026');
$page('lente', 'Lentewandeling 2027', 'lentewandeling-2027');
$page('winter', 'Winterwandeling 2025', 'winterwandeling-2025');
$page('wintertips', 'Winterse wandeltips', 'winterse-wandeltips');
$page('gezin', 'Gezinswandelingen', 'gezinswandelingen');
$page('vacatures', 'Vacatures', 'vacatures');
$page('hond', 'Wandelen met de hond', 'wandelen-met-de-hond', ['allSites' => true]);
$page('testAfbeelding', 'Fotowandeling op de heide', 'fotowandeling-op-de-heide');

$newsOverview = Entry::find()->section('newsOverview')->siteId(NL)->one();
$agenda = Entry::find()->section('calendarOverview')->siteId(NL)->one();

$intro = fn(string $s) => "<p>$s</p>";

// --- Routes ------------------------------------------------------------------
if ($fill('wandelroutes')) $save($P['wandelroutes'], [
    'headerImage' => [$A['heidelandschap.jpg']],
    'intro' => $intro('Ontdek onze bewegwijzerde wandelroutes: van korte lussen voor het hele gezin tot een volle dag stappen door heide en bos.'),
    'contentBuilder' => $rows([
        $row('full', [$overview('Onze routes', [$P['heideroute'], $P['beek'], $P['vijver']])]),
        $row('halves', [
            $text('Met kinderen op stap', '<p>Op zoek naar een kortere wandeling met veel te ontdekken? Onze kinderwandelingen zijn hooguit vijf kilometer lang en hebben onderweg speelplekken.</p>',
                [[$P['kinderwandelingen'], 'Bekijk de kinderwandelingen', 'btn btn--primary btn--ext']]),
            $image($A['wandelaars.jpg']),
        ]),
    ]),
]);

$heiderouteRows = function(bool $withPraktisch, bool $withOnderweg) use ($row, $text, $image, $A, $rows) {
    $r = [$row('full', [$text('De route', '<p>Je start aan het bezoekerscentrum en volgt de paarse paaltjes. Het eerste stuk loopt over een zandpad door de open heide, met links een uitkijkpunt over de vennen.</p><p>Na drie kilometer kom je aan de vijver. Daar loop je over het vlonderpad langs de oever en ga je terug door het dennenbos. De wandelkaart toont de volledige lus met alle rustbanken.</p>')])];
    if ($withPraktisch) $r[] = $row('full', [$text('Praktisch', '<p>Parkeren kan gratis aan het bezoekerscentrum. Het pad is niet geschikt voor rolstoelen; met een buggy met grote wielen lukt het wel. Honden zijn welkom aan de leiband.</p>')]);
    if ($withOnderweg) $r[] = $row('halves', [$text('Onderweg', '<p>Eind augustus kleurt de heide paars. Neem je tijd aan het uitkijkpunt: met wat geluk zie je er een boomvalk jagen.</p>'), $image($A['heide-close-up.jpg'])]);
    return $rows($r);
};
$heiderouteHistory = function() use (&$P, $save, $heiderouteRows, $intro, $A) {
    // Three saves = three revisions (a second apart, Craft skips a revision within the same second); the last one
    // removes the row "Praktisch" (video 6.4 restores it)
    $base = ['headerImage' => [$A['heideroute.jpg']], 'intro' => $intro('Een lus van acht kilometer door paarse heide, langs de vijver en terug door het dennenbos. Onderweg kom je langs een uitkijkpunt, een vlonderpad en een rustbank met zicht op de vennen. Ideaal voor een rustige namiddag, en op zijn mooist eind augustus wanneer de heide bloeit.'),
        'overviewTitle' => null, 'overviewDescription' => null, 'overviewImage' => [], 'searchWords' => null];
    sleep(1); $save($P['heideroute'], $base + ['contentBuilder' => $heiderouteRows(true, false)]);
    sleep(1); $save($P['heideroute'], ['contentBuilder' => $heiderouteRows(true, true)]);
    sleep(1); $save($P['heideroute'], ['contentBuilder' => $heiderouteRows(false, true)]);
};
if ($fill('heideroute')) $heiderouteHistory();
if ($fill('beek')) $save($P['beek'], [
    'headerImage' => [$A['beekroute.jpg']],
    'intro' => $intro('Zes kilometer langs de kronkelende beek, over vlonders en bruggetjes door het broekbos.'),
    'contentBuilder' => $rows([$row('halves', [
        $text('Langs het water', '<p>De route volgt de beek stroomopwaarts tot aan de oude watermolen. Na een regenachtige week kan het pad drassig zijn: laarzen zijn dan geen overbodige luxe.</p>',
            [[['asset' => $A['routekaart-beekvallei.pdf']], 'Download de routekaart', 'btn btn--ghost', true]]),
        $image($A['bosroute.jpg']),
    ])]),
]);
if ($fill('vijver')) $save($P['vijver'], [
    'headerImage' => [$A['vijver-lus.jpg']],
    'intro' => $intro('Een korte lus van drie kilometer rond de grote vijver, met een kijkhut voor vogelaars.'),
    'overviewImage' => [$A['gids-aan-de-vijver.jpg']], // video 5.4: the square card cuts the guide off
    'contentBuilder' => $rows([$row('full', [$text('Rond de vijver', '<p>Het pad is vlak en verhard, dus ook geschikt voor buggy\'s en rolstoelen. In de kijkhut hangen zoekkaarten met de vogels die je hier het vaakst ziet.</p>')])]),
]);
// --- Over ons > Ons team -----------------------------------------------------
if (!empty($P['onsTeam']) && $fill('onsTeam')) $save($P['onsTeam'], [
    'intro' => $intro('Onze gidsen zijn vrijwilligers die hun streek door en door kennen.'),
    'contentBuilder' => $rows([$row('full', [$team('Onze gidsen', array_filter($T))])]),
]);

// --- Praktische info: three text columns with anchors (video 3.5) -----------
if ($fill('praktisch')) $save($P['praktisch'], [
    'intro' => $intro('Alles wat je moet weten voor je vertrekt: waar je parkeert, hoe je er met de trein of bus geraakt en hoe toegankelijk de routes zijn.'),
    'contentBuilder' => $rows([
        $row('full', [$text('Parkeren', '<p>Aan het bezoekerscentrum is een gratis parking met veertig plaatsen, waarvan twee voor mensen met een beperking. Op zondag is die parking vaak vol voor tien uur.</p>')]),
        $row('full', [$text('Openbaar vervoer', '<p>Bus 35 stopt aan de halte Heikant, op vijf minuten wandelen van de start. Vanaf het station is het twintig minuten met de bus.</p>')]),
        $row('full', [$text('Toegankelijkheid', '<p>De Vijverroute is vlak en verhard, en geschikt voor rolstoelen en buggy\'s. De andere routes lopen over zand- en bospaden.</p>')]),
    ]),
]);

// --- Kinderwandelingen: the text column "Voor je vertrekt" (part 3) ---------
// Default = the start of 3.2/3.3/3.5/3.6: three paragraphs without headings, a button to the disabled page
// "Zomerwandeling" and a link to an external page that doesn't exist (example.com answers 404). --state=3.1 / 3.4: see below.
$kinderText = [
    // default (3.2, 3.3, 3.5 and every other video): no broken links, so no red "kapotte links" notice outside 3.6
    'default' => [
        '<p>Trek stevige schoenen aan, want na een regenbui zijn de paden zeker modderig. Aan het bezoekerscentrum vind je genoeg parkeerplaatsen.</p>'
        . '<p>Neem water, een regenjas en een kleine snack mee. Onderweg zijn er geen winkels, wel twee rustbanken met een picknicktafel.</p>'
        . '<p>Bekijk vooraf ook de wandelkaart van de gemeente, met alle speelplekken langs de route.</p>',
        fn() => [[$P['praktisch'], 'Praktische info', 'btn btn--primary']],
    ],
    // 3.6 only: a button to the disabled page Zomerwandeling and a dead external link
    '3.6' => [
        '<p>Trek stevige schoenen aan, want na een regenbui zijn de paden zeker modderig. Aan het bezoekerscentrum vind je genoeg parkeerplaatsen.</p>'
        . '<p>Neem water, een regenjas en een kleine snack mee. Onderweg zijn er geen winkels, wel twee rustbanken met een picknicktafel.</p>'
        . '<p>Bekijk vooraf ook de <a href="https://www.example.com/wandelkaart-beekvallei">wandelkaart van de gemeente</a>, met alle speelplekken langs de route.</p>',
        fn() => [[$P['zomer'], 'Ga mee op de zomerwandeling', 'btn btn--primary']],
    ],
    '3.1' => [
        '<p>Trek stevige schoenen aan, want na een regenbui zijn de paden zeker modderig.</p><p>Water</p><p>Regenjas</p><p>Een kleine snack</p>'
        . '<p>Kies een route op de kaart</p><p>Parkeer aan het bezoekerscentrum</p><p>Volg de groene paaltjes</p>'
        . '<p>Rust uit aan de vijver</p><p>Zoek de uitkijktoren</p><p>Wandel terug door het bos</p><p>Onderweg</p><p>Op elke route staan zoekkaarten voor kinderen.</p>',
        fn() => [],
    ],
    '3.4' => [
        '<p>Trek stevige schoenen aan, want na een regenbui zijn de paden zeker modderig. Wil je weten waar je kan parkeren? <a href="' . $ref($P['praktisch']) . '">Klik hier.</a></p>'
        . '<p>Neem water, een regenjas en een kleine snack mee. Onderweg zijn er geen winkels, wel twee rustbanken met een picknicktafel.</p>',
        fn() => [[$P['praktisch'], 'Meer info', 'btn btn--primary']],
    ],
];
$kinderRows = function(string $state) use ($kinderText, $row, $text, $rows) {
    [$html, $links] = $kinderText[$state];
    return $rows([$row('full', [$text('Voor je vertrekt', $html, $links())])]);
};
if ($fill('kinderwandelingen')) $save($P['kinderwandelingen'], [
    'headerImage' => [$A['bospad.jpg']],
    'intro' => $intro('Korte wandelingen van hooguit vijf kilometer, met speelplekken en zoekkaarten onderweg.'),
    'contentBuilder' => $kinderRows('default'),
]);

// --- Wandelen met kinderen (part 2: header + one row of text and image) -----
if ($fill('metKinderen')) $save($P['metKinderen'], [
    'headerImage' => [$A['bospad.jpg']],
    'intro' => $intro('Korte, <strong>veilige</strong> wandelingen met veel te ontdekken voor kleine benen.'),
    'contentBuilder' => $rows([$row('halves', [
        $text('Op stap met het hele gezin', '<p>Onze gezinsroutes zijn kort, goed bewegwijzerd en hebben altijd een plek om te picknicken.</p>'),
        $image($A['wandeldag-3.jpg']),
    ])]),
]);
if ($fill('zomer')) $save($P['zomer'], ['intro' => $intro('De zomerwandeling van vorig jaar. Deze pagina staat uit.')], ['enabled' => false]);

// --- Wandelen in de Kempen: the content builder demo page (part 4) ----------
$quoteText = 'In het bos hoor je pas hoe stil het kan zijn. Na een uur wandelen ben ik helemaal tot rust gekomen.';
if ($fill('kempen')) $save($P['kempen'], [
    'headerImage' => [$A['kempen.jpg']],
    'intro' => $intro('Heide, vennen en dennenbossen: de Kempen zijn gemaakt om te wandelen. Hier vind je onze routes en activiteiten in de streek.'),
    'contentBuilder' => $rows([
        $row('full', [$text('Onze routes', '<p>In de Kempen hebben we drie bewegwijzerde routes, van drie tot acht kilometer. Ze starten allemaal aan het bezoekerscentrum.</p>')]),
        $row('full', [$text(null, '<p>Elke route heeft een eigen kleur. Volg de paaltjes en je komt vanzelf terug aan de start.</p>')]),
        $row('halves', [$text('Wandelen door de heide', '<p>Eind augustus kleurt de heide paars. Dan is het de mooiste tijd om de Heideroute te lopen.</p>'), $image($A['heide-staand.jpg'])]),
        $row('halves', [$image($A['bospad.jpg']), $text('Het bos in', '<p>Na de heide duik je het dennenbos in. Het pad is zacht en vlak, en in de zomer lekker koel.</p>', [[$P['wandelroutes'], 'Bekijk alle wandelroutes', 'btn btn--primary']])]),
        $row('thirds', [
            $text('Heide', '<p>Open vlaktes met struikheide, brem en jeneverbes.</p>'),
            $text('Vennen', '<p>Ondiepe plassen waar libellen en kikkers leven.</p>'),
            $text('Bossen', '<p>Dennen en eiken die de wandelaar schaduw geven.</p>'),
        ]),
        $row('halves', [$text('Wat deelnemers zeggen', '<p>Elk jaar wandelen honderden mensen met onze gidsen mee.</p>'), $quote($quoteText, 'Een deelnemer', 'Wandelaar sinds vorig jaar')]),
        $row('halves', [$text('Een dag op stap', '<p>Zo zag onze laatste wandeldag eruit: een groep van twintig, drie gidsen en mooi herfstweer.</p>'), $gallery([$A['wandeldag-1.jpg'], $A['wandeldag-2.jpg'], $A['wandeldag-3.jpg']], '1/3')]),
        $row('full', [$numbers('Onze vereniging in cijfers', [['42', 'wandelroutes'], ['18', 'gidsen'], ['3500', 'wandelaars per jaar']])]),
        $row('full', [$overview('Ontdek onze routes', [$P['heideroute'], $P['beek'], $P['vijver']])]),
        $row('halves', [$text('Bekijk de film', '<p>Onze vrijwilligers filmden een dag op stap met de gidsen.</p>'), $video('https://www.youtube.com/watch?v=aqz-KE-bpKQ', $A['heideroute.jpg'], 'Een dag op stap met onze gidsen')]),
        $row('full', [$table('<figure class="table"><table><thead><tr><th>Route</th><th>Afstand</th><th>Moeilijkheid</th></tr></thead><tbody><tr><td>Heideroute</td><td>8 km</td><td>Gemiddeld</td></tr><tr><td>Route langs de beek</td><td>6 km</td><td>Makkelijk</td></tr><tr><td>Vijverroute</td><td>3 km</td><td>Makkelijk</td></tr></tbody></table></figure>', 'Onze routes in de Kempen')]),
        $row('halves', [$text('Vragen over een wandeling?', '<p>Stuur ons een bericht. We antwoorden binnen twee werkdagen.</p>'), $form($formId)]),
        $row('halves', [$text('Vragen over de route?', '<p>Femke kent de Heideroute als geen ander. Neem gerust contact met haar op.</p>'), $person($T[0] ?? null)]),
        $row('full', [$faq('Praktisch voor je wandeling', [
            'Mag mijn hond mee?' => 'Ja, aan de leiband. In de vogelzone aan de vijver zijn honden niet toegelaten.',
            'Moet ik vooraf inschrijven?' => 'Voor de routes niet. Voor een begeleide wandeling wel, via de agenda.',
            'Zijn er toiletten?' => 'Ja, in het bezoekerscentrum aan de start.',
        ])]),
        $row('full', [$cta('Wandel mee in de herfst', '<p>Op 22 november trekken we met drie gidsen de Kempen in.</p>', [[$P['inschrijven'], 'Schrijf je in voor de herfstwandeling', 'btn btn--primary']], $A['wandelaars.jpg'])]),
    ]),
]);
if ($fill('ardennen')) $save($P['ardennen'], [
    'headerImage' => [$A['ardennen.jpg']],
    'intro' => $intro('Steile hellingen, rivieren en uitgestrekte bossen: wandelen in de Ardennen is een ander verhaal.'),
    'contentBuilder' => $rows([
        $row('halves', [$text('Stevig stappen', '<p>De routes in de Ardennen zijn langer en hebben meer hoogtemeters. Reken op vier tot vijf uur.</p>'), $image($A['ardennen.jpg'])]),
        $row('full', [$text('Overnachten', '<p>Wil je twee dagen wandelen? In het dorp zijn een jeugdherberg en twee gastenkamers.</p>')]),
    ]),
]);
if ($fill('inschrijven')) $save($P['inschrijven'], [
    'intro' => $intro('Schrijf je in voor de herfstwandeling van zondag 22 november.'),
    'contentBuilder' => $rows([$row('halves', [$text('Praktisch', '<p>We vertrekken om 10 uur aan het bezoekerscentrum en zijn terug rond 13 uur. Deelnemen is gratis.</p>'), $form($formId)])]),
]);

// --- Statuses (video 6.1) ---------------------------------------------------
if ($fill('najaar')) $save($P['najaar'], ['intro' => $intro('Op zondag 22 november wandelen we met de hele vereniging door de herfstkleuren.'),
    'contentBuilder' => $rows([$row('full', [$text('Programma', '<p>Start om 10 uur aan het bezoekerscentrum, met soep en koffie na afloop.</p>')])])]);
if ($fill('lente')) $save($P['lente'], ['intro' => $intro('De eerste wandeling van het nieuwe seizoen.')], ['postDate' => new DateTime('2027-03-01 09:00:00')]); // pending
if ($fill('winter')) $save($P['winter'], ['intro' => $intro('De winterwandeling van vorig jaar.')], ['postDate' => new DateTime('2025-11-15 09:00:00'), 'expiryDate' => new DateTime('2026-03-01 00:00:00')]); // expired
// A text with an H4 and no H3 above it. Saved from the console, so Headings Checker doesn't block it (it only checks
// publishing in the control panel); in the CP, "Bewaren" fails with "Kon invoer niet opslaan." and "1 fout gevonden … Maak er een H3 van." (video 6.1, scene 8).
if ($fill('wintertips')) $save($P['wintertips'], ['intro' => $intro('Ook in de winter is het fijn wandelen, als je goed voorbereid vertrekt.'),
    'contentBuilder' => $rows([$row('full', [$text('Goed voorbereid op pad', '<p>In de winter is het vroeg donker en zijn de paden glad.</p><h4>Kleding</h4><p>Draag laagjes en waterdichte schoenen met een goed profiel.</p>')])])]);

// --- Menus, translating, misc ----------------------------------------------
if ($fill('gezin')) $save($P['gezin'], ['intro' => $intro('Wandelroutes die kort genoeg zijn voor kleine benen.'), 'headerImage' => [$A['wandeldag-3.jpg']]]);
if ($fill('vacatures')) $save($P['vacatures'], ['intro' => $intro('Word gids of vrijwilliger bij onze vereniging.'),
    'contentBuilder' => $rows([$row('full', [$text('Gidsen gezocht', '<p>Ken je de streek en vertel je graag? We zoeken nieuwe gidsen voor het voorjaar.</p>')])])]);
if ($fill('testAfbeelding')) $save($P['testAfbeelding'], ['intro' => $intro('Wandel mee met onze natuurfotografen en leer de heide door je lens zien.'),
    'contentBuilder' => $rows([$row('halves', [$text('Heide bij zonsopgang', '<p>Bij zonsopgang hangt er vaak nevel boven de heide. Wie vroeg vertrekt, ziet het landschap langzaam kleur krijgen.</p>'), $image($A['IMG_4031.jpg'])])])]);

// Wandelen met de hond (part 12): on all sites, FR and EN still with the Dutch text; the last row only on NL
if ($fill('hond')) {
    $h = $P['hond'];
    $hondRows = [
        $row('full', [$text('Honden welkom', '<p>Op al onze routes is je hond welkom, zolang hij aan de leiband blijft.</p>')]),
        $row('halves', [$text('Neem water mee', '<p>Onderweg is er weinig water voor honden. Een drinkbakje in je rugzak is geen overbodige luxe.</p>'), $image($A['bospad.jpg'])]),
    ];
    $common = ['headerImage' => [$A['bosroute.jpg']], 'intro' => $intro('Wandelen met je hond: waar het mag, en waar je hem beter aan de leiband houdt.')];
    foreach ([2, 3] as $siteId) {
        $s = Entry::find()->id($h->id)->siteId($siteId)->status(null)->one();
        if ($s) $save($s, $common + ['contentBuilder' => $rows($hondRows)], ['title' => 'Wandelen met de hond', 'slug' => 'wandelen-met-de-hond', 'enabledForSite' => true]);
    }
    $nl = Entry::find()->id($h->id)->siteId(NL)->status(null)->one();
    $save($nl, $common + ['contentBuilder' => $rows(array_merge($hondRows, [
        $row('full', [$text('Waar mag je hond los lopen?', '<p>In de hondenzone naast de parking mag je hond vrij rondlopen. Op de routes zelf blijft hij aan de leiband.</p>')]),
    ]))]);
}
// --state=12b (video 12.2): FR as video 12.1 leaves it: French title, slug, intro and first row; the second row removed
if ($STATE === '12b') {
    $fr = Entry::find()->id($P['hond']->id)->siteId(2)->status(null)->one();
    $save($fr, ['intro' => $intro('Promener ton chien : où il peut courir, et où il reste en laisse.'),
        'contentBuilder' => $rows([$row('full', [$text('Chiens bienvenus', '<p>Ton chien est le bienvenu sur toutes nos promenades, en laisse.</p>')])])],
        ['title' => 'Promener son chien', 'slug' => 'promener-son-chien']);
}
// ============================================================================
// The base install's own pages, in the organisation's voice. Filled when they still hold the base install's content
// (no header image / English title / lorem), or with --refresh.
// ============================================================================

$single = fn(string $section) => Entry::find()->section($section)->siteId(NL)->status(null)->one();
$noHeader = fn(?Entry $e) => $e && $e->getFieldLayout()->getFieldByHandle('headerImage') && !$e->headerImage->exists();
$light = ['backgroundColor' => 'section--light'];
/** Overview column that fills itself with the newest news / events. */
$overviewDyn = fn(string $title, string $option, ?Entry $to, string $label) => ['type' => 'cellOverview', 'fields' => [
    'blockTitle' => $title, 'showTitle' => true, 'overviewOptions' => $option, 'overviewType' => 'grid', 'cardLayout' => 'stacked',
    'highlightFirst' => false, 'dynamicFill' => true, 'linkField' => $link($to, $label), 'linkPosition' => 'below',
]];

// --- Over ons and its children ----------------------------------------------
if ($overOns) {
    $page('geschiedenis', 'Onze geschiedenis', 'onze-geschiedenis', ['parent' => $overOns]);
    $page('partnersPage', 'Onze partners', 'onze-partners', ['parent' => $overOns]);
    if ($noHeader($overOns) || $REFRESH) $save($overOns, [
        'headerImage' => [$A['heidepad.jpg']],
        'intro' => $intro('De Heidestappers zijn een vereniging van vrijwilligers. Sinds 1987 zetten we wandelroutes uit, gidsen we wandelingen en helpen we de heide en de beekvalleien in onze streek mee onderhouden.'),
        'contentBuilder' => $rows([
            $row('halves', [
                $text('Wie we zijn', '<p>Wat begon met een handvol natuurliefhebbers en één bewegwijzerde lus, is vandaag een vereniging met achttien gidsen en meer dan driehonderd leden.</p><p>We geloven dat wie de natuur leert kennen, er ook beter voor zorgt. Daarom zijn onze wandelingen gratis en toegankelijk voor iedereen, van jonge gezinnen tot ervaren stappers.</p>'),
                $image($A['vrijwilligers.jpg']),
            ]),
            $row('full', [$numbers('De Heidestappers in cijfers', [['1987', 'opgericht'], ['18', 'gidsen'], ['42', 'kilometer bewegwijzerde paden'], ['3500', 'wandelaars per jaar']])], $light),
            $row('full', [$overview('Meer over ons', [$P['onsTeam'] ?? null, $P['geschiedenis'], $P['partnersPage']])]),
            $row('full', [$cta('Wandel je graag mee als gids?', '<p>We zoeken vrijwilligers die graag vertellen over de natuur. Je krijgt een opleiding en loopt eerst mee met een ervaren gids.</p>',
                [[$P['vacatures'], 'Bekijk de vacatures', 'btn btn--primary']], $A['bosweg-wandelaar.jpg'])]),
        ]),
    ]);
    if ($fill('geschiedenis')) $save($P['geschiedenis'], [
        'intro' => $intro('Van één bewegwijzerde lus in 1987 tot een netwerk van routes door heide, bos en beekvalleien.'),
        'contentBuilder' => $rows([
            $row('full', [$text('Hoe het begon', '<p>In het voorjaar van 1987 zetten vijf buren uit Heikant de eerste route uit: een lus van zes kilometer rond de vennen, gemarkeerd met paarse paaltjes die ze zelf schilderden. Een jaar later wandelden er elke zondag tientallen mensen mee.</p>')]),
            $row('halves', [
                $text('Groeien met de streek', '<p>In de jaren negentig kwamen de Route langs de beek en de Vijverroute erbij. Samen met de gemeente legden we het vlonderpad aan, zodat de beekvallei ook na een natte winter toegankelijk bleef.</p><p>Sinds 2010 werken we samen met Bezoekerscentrum De Ven, waar al onze routes vertrekken.</p>'),
                $image($A['heidelandschap.jpg']),
            ]),
            $row('full', [$quote('Toen we begonnen, wisten we niet of er iemand zou meewandelen. Nu ken ik de helft van het dorp van op de heide.', 'Een van de oprichters', 'Gids sinds 1987')], $light),
        ]),
    ]);
    if ($fill('partnersPage')) $save($P['partnersPage'], [
        'intro' => $intro('Zonder onze partners geen bewegwijzerde routes, geen bezoekerscentrum als vertrekpunt en geen soep na de winterwandeling.'),
        'contentBuilder' => $rows([
            $row('full', [$text('Samen voor de natuur', '<p>We werken samen met organisaties uit de streek die net als wij willen dat iedereen van de natuur kan genieten. Wil je ook partner worden? Neem gerust contact met ons op.</p>')]),
            $row('full', [$partnersCell('Onze partners')]),
        ]),
    ]);
}

// --- Home: hero + rows -------------------------------------------------------
$home = $single('home');
$contactPage = $single('contact');
if ($home && (($home->hero?->heading ?? null) !== 'Stap mee door heide en bos' || $REFRESH)) {
    $save($home, [
        'hero' => ['fields' => [
            'heading' => 'Stap mee door heide en bos',
            'image' => [$A['heide-wandelaars.jpg']],
            'intro' => '<p>Bewegwijzerde wandelroutes en gratis begeleide wandelingen met onze gidsen, het hele jaar door.</p>',
            'ctas' => $ctas([[$P['wandelroutes'], 'Ontdek onze wandelroutes', 'btn btn--primary'], [$agenda, 'Bekijk de agenda', 'btn btn--secondary']]),
        ]],
        'contentBuilder' => $rows([
            $row('halves', [
                $text('Welkom bij De Heidestappers', '<p>Paarse heide, stille vennen en koele dennenbossen: onze streek is gemaakt om te wandelen. Kies een route en volg de paaltjes, of ga mee met een van onze gidsen.</p><p>Al onze routes starten aan Bezoekerscentrum De Ven, waar je gratis parkeert.</p>',
                    [[$P['praktisch'], 'Praktische info', 'btn btn--ghost btn--ext']]),
                $image($A['wandelaars.jpg']),
            ]),
            $row('full', [$overview('Onze wandelroutes', [$P['heideroute'], $P['beek'], $P['vijver']])], $light),
            $row('full', [$overviewDyn('Binnenkort in de agenda', 'calendar', $agenda, 'Bekijk de volledige agenda')]),
            $row('full', [$overviewDyn('Laatste nieuws', 'news', $newsOverview, 'Al het nieuws')], $light),
            $row('full', [$cta('Word gids of vrijwilliger', '<p>Vertel je graag over de natuur, of steek je liever de handen uit de mouwen bij een natuurwerkdag? We zoeken versterking.</p>',
                [[$P['vacatures'], 'Bekijk de vacatures', 'btn btn--primary']], $A['bosweg-wandelaar.jpg'])]),
        ]),
    ]);
}

// --- Contact: intro, the form Contact_NL, a row with practical info ----------
$contactIntro = 'Een vraag over een route, een begeleide wandeling voor je school of vereniging, of wil je vrijwilliger worden? Laat het ons weten. We antwoorden binnen twee werkdagen.';
if ($contactPage && (strip_tags((string)$contactPage->intro) !== $contactIntro || $REFRESH)) $save($contactPage, [
    'intro' => $intro($contactIntro),
    'form' => array_filter([$formId]),
    'contentBuilder' => $rows([$row('full', [$text('Langskomen', '<p>Het secretariaat van De Heidestappers zit in Bezoekerscentrum De Ven. Je bent welkom van woensdag tot zondag, van 10 tot 17 uur. In juli en augustus zijn we elke dag open.</p>')])]),
], ['title' => 'Contact']);

// --- Legal pages: Dutch titles, realistic example texts (video 13.2) --------
$legal = [
    'cookiePolicy' => ['Cookiebeleid', 'heide-bloei.jpg', 'Op deze pagina lees je welke cookies onze website gebruikt en waarom.', [
        $row('full', [$text('Wat zijn cookies?', '<p>Cookies zijn kleine tekstbestanden die een website op je computer of telefoon bewaart. Sommige zijn nodig om de site te laten werken, andere helpen ons te begrijpen hoe bezoekers de site gebruiken.</p>')]),
        $row('full', [$table('<figure class="table"><table><thead><tr><th>Cookie</th><th>Doel</th><th>Bewaartermijn</th></tr></thead><tbody><tr><td>CraftSessionId</td><td>Noodzakelijk: onthoudt je sessie, bijvoorbeeld als je een formulier invult</td><td>Tot je de browser sluit</td></tr><tr><td>CRAFT_CSRF_TOKEN</td><td>Noodzakelijk: beveiligt de formulieren</td><td>Tot je de browser sluit</td></tr><tr><td>_ga</td><td>Statistieken: telt anonieme bezoeken (alleen met je toestemming)</td><td>2 jaar</td></tr></tbody></table></figure>', 'De cookies op deze website')]),
        $row('full', [$text('Je keuze aanpassen', '<p>Bij je eerste bezoek kies je zelf welke cookies je toelaat. Je kan die keuze altijd aanpassen met de knop voor de cookie-instellingen onderaan elke pagina, of de cookies wissen in de instellingen van je browser.</p>')]),
    ]],
    'privacyPolicy' => ['Privacybeleid', 'riet.jpg', 'De Heidestappers gaan zorgvuldig om met je persoonsgegevens. Hier lees je welke gegevens we bewaren, waarom en hoe lang.', [
        $row('full', [$text('Wie zijn wij?', '<p>De Heidestappers vzw, Boslaan 1, 3000 Leuven, is verantwoordelijk voor de verwerking van je gegevens. Vragen over privacy stuur je naar <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>')]),
        $row('full', [$text('Formulieren', '<p>Vul je het contactformulier of een inschrijvingsformulier in, dan bewaren we je naam, je e-mailadres en je bericht. We gebruiken die gegevens alleen om je vraag te beantwoorden of je inschrijving te regelen, en geven ze nooit door aan derden.</p><p>Berichten via het contactformulier bewaren we twaalf maanden. Inschrijvingen voor een wandeling wissen we drie maanden na de activiteit.</p>')]),
        $row('full', [$text('Nieuwsbrief', '<p>Schrijf je je in voor onze nieuwsbrief, dan bewaren we je e-mailadres tot je je uitschrijft. Onderaan elke nieuwsbrief staat een link om je uit te schrijven.</p>')]),
        $row('full', [$text('Je rechten', '<p>Je mag altijd vragen welke gegevens we van je hebben, ze laten verbeteren of laten wissen. Stuur daarvoor een e-mail naar <a href="mailto:privacy@example.com">privacy@example.com</a>. Ben je niet tevreden met ons antwoord, dan kan je een klacht indienen bij de Gegevensbeschermingsautoriteit.</p>')]),
    ]],
    'accessibilityStatement' => ['Toegankelijkheidsverklaring', 'vlonder-bos.jpg', 'We willen dat iedereen onze website kan gebruiken, ook met een schermlezer, alleen met het toetsenbord of met een vergroting.', [
        $row('full', [$text('Onze aanpak', '<p>Deze website is gebouwd volgens de richtlijnen WCAG 2.1 op niveau AA. We testen nieuwe pagina\'s met het toetsenbord en een schermlezer, en kijken de site elk jaar opnieuw na. Deze verklaring werd opgesteld op 1 oktober 2026.</p>')]),
        $row('full', [$text('Wat nog niet toegankelijk is', '<ul><li>Sommige oudere wandelkaarten zijn PDF\'s die niet toegankelijk gemaakt zijn. We vervangen ze stap voor stap.</li><li>De video\'s van onze wandeldagen hebben nog geen ondertitels.</li><li>De ingesloten kaart op de contactpagina is niet volledig met het toetsenbord te bedienen. Het adres staat er ook als tekst naast.</li></ul>')]),
        $row('full', [$text('Iets niet bruikbaar?', '<p>Kan je iets op deze website niet lezen of gebruiken? Laat het ons weten via <a href="mailto:info@example.com">info@example.com</a> of op 016 98 76 54. We bezorgen je de informatie dan op een andere manier, en antwoorden binnen tien werkdagen.</p>')], $light),
    ]],
];
foreach ($legal as $section => [$title, $img, $lead, $legalRows]) {
    $e = $single($section);
    if ($e && ($e->title !== $title || $REFRESH)) $save($e, ['headerImage' => [$A[$img]], 'intro' => $intro($lead), 'contentBuilder' => $rows($legalRows)], ['title' => $title]);
}

// --- 404 and search results --------------------------------------------------
$notFound = $single('pageNotFound');
if ($notFound && ($notFound->title !== 'Pagina niet gevonden' || $REFRESH)) $save($notFound, [
    'headerImage' => [$A['mistig-bos.jpg']],
    'intro' => $intro('Oei, hier loopt het pad dood. De pagina die je zoekt bestaat niet (meer), of het adres is verkeerd getypt.'),
    'contentBuilder' => $rows([$row('full', [$text('Terug op weg', '<p>Misschien vind je hier wat je zocht:</p>', [
        [$home, 'Naar de homepage', 'btn btn--primary'], [$P['wandelroutes'], 'Onze wandelroutes', 'btn btn--ghost'], [$agenda, 'De agenda', 'btn btn--ghost'],
    ])])]),
], ['title' => 'Pagina niet gevonden']);
$search = $single('searchResults');
if ($search && ($search->title !== 'Zoekresultaten' || $REFRESH)) $save($search, [
    'contentBuilder' => $rows([$row('full', [$text('Niets gevonden?', '<p>Probeer een ander of korter zoekwoord, zoals "heide" of "kinderen". Of kijk meteen bij onze wandelroutes en in de agenda.</p>', [
        [$P['wandelroutes'], 'Bekijk de wandelroutes', 'btn btn--primary'], [$agenda, 'Bekijk de agenda', 'btn btn--ghost'],
    ])])]),
], ['title' => 'Zoekresultaten']);

// --- Overviews and the thank-you page ----------------------------------------
$kennisbank = $single('knowledgeBaseOverview');
foreach ([
    [$newsOverview, 'uitzicht-bos.jpg', 'Nieuws over onze routes, de natuur in de streek en wat onze vrijwilligers zoal doen.'],
    [$agenda, 'groepswandeling.jpg', 'Wandel mee met een van onze gidsen. Deelnemen is gratis, inschrijven hoeft alleen als het erbij staat.'],
    [$kennisbank, 'kaart-en-kompas.jpg', 'Tips om je wandeling voor te bereiden en meer te zien onderweg.'],
] as [$e, $img, $lead]) {
    if ($e && ($noHeader($e) || $REFRESH)) $save($e, ['headerImage' => [$A[$img]], 'intro' => $intro($lead)]);
}
$bedankt = Entry::find()->section('pages')->slug('bedankt')->siteId(NL)->status(null)->one(); // redirect of the contact form
if ($noHeader($bedankt)) $save($bedankt, ['headerImage' => [$A['bosweg-wandelaar.jpg']]]);

// --- Every page a header image ------------------------------------------------
foreach ([
    'onsTeam' => 'bospad-zon.jpg', 'geschiedenis' => 'gouden-bos.jpg', 'partnersPage' => 'moeras-vlonder.jpg', 'praktisch' => 'wegwijzer.jpg',
    'inschrijven' => 'wandelaars.jpg', 'najaar' => 'herfstbos.jpg', 'lente' => 'boshyacinten.jpg', 'winter' => 'winterbos.jpg',
    'wintertips' => 'rijp.jpg', 'vacatures' => 'vrijwilligers.jpg', 'zomer' => 'heide-close-up.jpg', 'testAfbeelding' => 'heidelandschap.jpg',
] as $key => $img) {
    if ($noHeader($P[$key] ?? null)) $save($P[$key], ['headerImage' => [$A[$img]]]);
}

$log('✓ Pages: ' . implode(', ', array_map(fn($k) => $P[$k]?->title . ($GLOBALS['NEW'][$k] ? ' (new)' : ''), array_keys($P))));

// Oude zomerwandeling: in the trash (video 6.4)
$trashed = Entry::find()->section('pages')->slug('oude-zomerwandeling')->siteId(NL)->status(null)->trashed(true)->one();
if (!$trashed) {
    [$old] = $findOrCreate('pages', 'oude-zomerwandeling', 'Oude zomerwandeling', ['fields' => ['intro' => $intro('Testpagina van een oude zomerwandeling.')]]);
    if ($old) $elements->deleteElement($old);
    $log('✓ Oude zomerwandeling: in the trash');
}

// --- --state=<video>: put an entry in the state a video starts from --------
// States: 3.1, 3.4 (Kinderwandelingen text), 3.2/3.3/3.5/3.6/default (base text), 6.4 (three new Heideroute revisions)
if ($STATE) {
    switch ($STATE) {
        case '3.1': case '3.4': case '3.6':
            $save($P['kinderwandelingen'], ['contentBuilder' => $kinderRows($STATE)]); break;
        case '6.4': $heiderouteHistory(); break;
        case '4': break; // Kempen + Ardennen: written above through $fill
        case '12': case '12b': break; // Wandelen met de hond on all sites (part 12): written above through $fill
        case '3.2': case '3.3': case '3.5': case 'default':
            $save($P['kinderwandelingen'], ['contentBuilder' => $kinderRows('default')]); break;
        default: $fail("Unknown state $STATE");
    }
    $log("✓ State $STATE applied");
}

// ============================================================================
// News (Dutch) and events
// ============================================================================

$N = [];
// [slug, title, category, image, date, intro, body]
foreach ([
    ['nieuwe-route-langs-de-dijle', 'Nieuwe route langs de Dijle', 'Routes', 'dijle-pad.jpg', '2026-10-28', 'Vanaf deze maand kan je een nieuwe lus van tien kilometer langs de Dijle wandelen.',
        '<p>De Dijleroute vertrekt aan de oude sluis en volgt de rivier stroomafwaarts door natte graslanden en rietvelden. Over een nieuw vlonderpad steek je het moeras over, waarna je via de bosrand terugkeert.</p><p>De route is bewegwijzerd met blauwe paaltjes. Na een natte week raden we laarzen aan.</p>'],
    ['de-heide-staat-in-bloei', 'De heide staat in bloei', 'Natuurbeheer', 'heide-close-up.jpg', '2026-08-24', 'Dit is de week om de Heideroute te lopen: de heide kleurt overal paars.',
        '<p>Na een warme zomer bloeit de struikheide dit jaar vroeg en uitbundig. Vooral rond het uitkijkpunt bij de vennen is het een paarse zee.</p><p>Blijf op de paden: de heide is kwetsbaar en in de bloeitijd broeden er nog late vogels.</p>'],
    ['vrijwilligers-maaien-de-vijveroever', 'Vrijwilligers maaien de vijveroever', 'Natuurbeheer', 'vrijwilligers.jpg', '2026-09-12', 'Twintig vrijwilligers hielpen de oever van de grote vijver open te houden voor zeldzame planten.',
        '<p>Met zeisen en harken maaiden ze een volle zaterdag het riet en de opslag van wilgen langs de oever. Zo krijgen planten als de moeraswespenorchis weer licht.</p><p>De volgende natuurwerkdag is op 29 november langs de beek. Iedereen is welkom, handschoenen en soep zijn voorzien.</p>'],
    ['nieuwe-gidsen-gezocht', 'Nieuwe gidsen gezocht voor het voorjaar', 'Activiteiten', 'wandeldag-5.jpg', '2026-09-30', 'Vertel je graag over de natuur? Volg in het voorjaar onze opleiding tot gids.',
        '<p>De opleiding bestaat uit zes avonden en vier wandelingen met een ervaren gids. Je leert de planten en dieren van de streek kennen, en hoe je een groep veilig en boeiend begeleidt.</p><p>Voorkennis is niet nodig, enthousiasme wel. Schrijf je in via de pagina Vacatures.</p>'],
    ['wandelkaart-heideroute-vernieuwd', 'Wandelkaart Heideroute vernieuwd', 'Routes', 'heideroute.jpg', '2026-07-03', 'De wandelkaart van de Heideroute toont nu ook de rustbanken en de nieuwe parking.',
        '<p>Op de nieuwe kaart staan alle rustbanken, de picknicktafels en het uitkijkpunt. Ook de nieuwe parking aan de Heikant staat erop.</p><p>Je vindt de kaart gratis in het bezoekerscentrum, of als PDF bij de route op onze site.</p>'],
    ['terugblik-op-de-herfstwandeling', 'Terugblik op de herfstwandeling', 'Activiteiten', 'herfstbos.jpg', '2026-10-12', 'Meer dan honderd wandelaars trokken met onze gidsen door de herfstkleuren.',
        '<p>Onder een stralende oktoberzon vertrokken vijf groepen aan het bezoekerscentrum. De gidsen toonden onderweg paddenstoelen, sporen van reeën en de eerste trekvogels.</p><p>Na afloop stond er pompoensoep klaar, gemaakt door Bakkerij Het Graan. Bedankt aan iedereen die meeliep!</p>'],
    ['vlonderpad-beekvallei-hersteld', 'Vlonderpad in de Beekvallei hersteld', 'Routes', 'beekroute.jpg', '2026-06-15', 'Het vlonderpad langs de beek is weer helemaal veilig, met nieuwe planken en leuningen.',
        '<p>Na de stormen van vorige winter waren verschillende planken gebroken. Vrijwilligers en de gemeente vervingen in totaal tweehonderd meter vlonder.</p><p>De Route langs de beek is daardoor weer volledig open, ook voor buggy\'s met grote wielen.</p>'],
    ['vogeltelling-64-soorten', 'Vogeltelling: 64 soorten in één weekend', 'Natuurbeheer', 'verrekijker.jpg', '2026-11-02', 'Tijdens de jaarlijkse vogeltelling zagen onze vrijwilligers 64 soorten, drie meer dan vorig jaar.',
        '<p>Opvallend waren de klapekster op de heide en een groep van veertig kraanvogels die over de vijver trok. Ook de ijsvogel werd weer gezien langs de beek.</p><p>De resultaten gaan naar het regionale natuurpunt, dat ze gebruikt om het beheer van de heide te plannen.</p>'],
    ['nieuwe-paaltjes-op-de-heideroute', 'Nieuwe paaltjes op de Heideroute', 'Routes', 'paaltje.jpg', '2026-10-05', 'De Heideroute heeft nieuwe, beter zichtbare paaltjes gekregen.',
        '<p>De oude paarse paaltjes waren na twintig jaar verweerd en op sommige plaatsen overgroeid. De nieuwe paaltjes zijn van eikenhout en hebben een duidelijke paarse pijl.</p><p>Op de kruispunten staat nu ook een kleine wegwijzer met de afstand tot het bezoekerscentrum.</p>'],
    ['hondenzone-aan-de-heikant', 'Nieuwe hondenzone aan de Heikant', 'Activiteiten', 'hond-op-de-heide.jpg', '2026-09-03', 'Naast de parking aan de Heikant mag je hond voortaan vrij rondlopen.',
        '<p>De omheinde zone is twee hectare groot en heeft een drinkbak en een paar bankjes. Op de wandelroutes zelf blijven honden aan de leiband, om de vogels en het wild niet te storen.</p>'],
    ['zwanen-broeden-aan-de-grote-vijver', 'Zwanen broeden weer aan de grote vijver', 'Natuurbeheer', 'zwanen.jpg', '2026-05-20', 'Voor het eerst in vijf jaar broedt er weer een koppel knobbelzwanen aan de grote vijver.',
        '<p>Het nest ligt in het riet aan de noordkant, goed te zien vanuit de kijkhut. Hou afstand en voeder de zwanen niet: brood is slecht voor hen.</p><p>Met wat geluk zie je in juni de eerste jongen zwemmen.</p>'],
] as [$slug, $title, $cat, $img, $date, $lead, $body]) {
    [$e, $new] = $findOrCreate('news', $slug, $title);
    if ($e && ($new || $REFRESH)) $save($e, [
        'headerImage' => [$A[$img]], 'intro' => $intro($lead), 'newsCategory' => [$C[$cat]->id],
        'contentBuilder' => $rows([$row('full', [$text(null, $body)])]),
    ], ['postDate' => new DateTime("$date 09:00:00")]);
    $N[] = $e;
}
$log('✓ News: ' . count(array_filter($N)));

foreach (['Natuurwerkdag', 'Gezinsactiviteit', 'Cursus'] as $t) { [$C[$t]] = $findOrCreate('calendarCategories', StringHelper::toKebabCase($t), $t); }
// [slug, title, start, end, location, image, category, price, intro, body]
$EV = [
    ['herfstwandeling-in-de-kempen', 'Herfstwandeling in de Kempen', '2026-11-22 10:00', '2026-11-22 13:00', 'Bezoekerscentrum De Ven', 'groepswandeling.jpg', 'Begeleide wandeling', 'Gratis',
        'Drie gidsen nemen je mee door de herfstkleuren van heide en bos. Na afloop is er soep.', '<p>We wandelen acht kilometer in een rustig tempo en stoppen onderweg om te vertellen over paddenstoelen, trekvogels en het beheer van de heide. Trek stevige schoenen aan.</p>'],
    ['opruimactie-langs-de-beek', 'Natuurwerkdag langs de beek', '2026-11-29 09:30', '2026-11-29 15:00', 'Parking aan de oude watermolen', 'opruimactie.jpg', 'Natuurwerkdag', 'Gratis, lunch inbegrepen',
        'Help de oevers van de beek vrij te maken van zwerfvuil en opslag. Iedereen is welkom.', '<p>We werken in kleine groepen met een begeleider. Handschoenen, gereedschap en een warme lunch zijn voorzien. Kom gerust maar een halve dag.</p>'],
    ['wintermorgen-op-de-heide', 'Wintermorgen op de heide', '2026-12-13 08:30', '2026-12-13 11:00', 'Parking Heikant', 'IMG_4031.jpg', 'Begeleide wandeling', 'Gratis',
        'Een vroege wandeling over de heide, als de mist nog boven de vennen hangt.', '<p>Bij zonsopgang is de heide op haar stilst. Met wat geluk zie je reeën of hoor je de eerste vogels. We eindigen met warme chocolademelk in het bezoekerscentrum.</p>'],
    ['kabouterwandeling-voor-gezinnen', 'Kabouterwandeling voor gezinnen', '2026-12-27 14:00', '2026-12-27 16:00', 'Bezoekerscentrum De Ven', 'gezin-in-het-bos.jpg', 'Gezinsactiviteit', '€ 2 per kind',
        'Een korte wandeling met een zoektocht voor kinderen van 4 tot 10 jaar.', '<p>Onderweg zoeken de kinderen kabouterhuisjes en lossen ze raadsels op over de dieren in het bos. De wandeling is drie kilometer en geschikt voor buggy\'s.</p>'],
    ['nieuwjaarswandeling', 'Nieuwjaarswandeling', '2027-01-10 14:00', '2027-01-10 16:30', 'Bezoekerscentrum De Ven', 'winterbos.jpg', 'Begeleide wandeling', 'Gratis',
        'Start het nieuwe jaar met een frisse wandeling en een glas glühwein.', '<p>We wandelen een lus van zes kilometer door het winterse bos. Na afloop klinken we samen op het nieuwe jaar in het bezoekerscentrum.</p>'],
    ['kaartlezen-voor-beginners', 'Kaartlezen voor beginners', '2027-01-24 10:00', '2027-01-24 12:30', 'Bezoekerscentrum De Ven', 'kaart-en-kompas.jpg', 'Cursus', '€ 5, met kaart en kompas',
        'Leer een wandelkaart lezen en de weg vinden met een kompas.', '<p>Eerst oefenen we binnen met de kaart, daarna zoeken we in kleine groepen de weg naar vijf posten in het bos. Kaart en kompas mag je houden.</p>'],
    ['vogels-spotten-aan-de-vijver', 'Vogels spotten aan de vijver', '2027-02-07 09:00', '2027-02-07 11:30', 'Kijkhut aan de grote vijver', 'vogels-zonsopgang.jpg', 'Begeleide wandeling', 'Gratis',
        'Ontdek met een vogelkenner welke wintergasten op en rond de vijver verblijven.', '<p>We starten in de kijkhut en wandelen daarna rond de vijver. Neem een verrekijker mee als je er een hebt; we hebben er ook een paar om uit te lenen.</p>'],
];
foreach ($EV as [$slug, $title, $start, $end, $loc, $img, $cat, $price, $lead, $body]) {
    [$e, $new] = $findOrCreate('calendar', $slug, $title);
    if ($e && ($new || $REFRESH)) $save($e, [
        'headerImage' => [$A[$img]], 'intro' => $intro($lead),
        'eventDates' => ['new1' => ['type' => 'eventDate', 'enabled' => true, 'fields' => ['startDate' => new DateTime($start), 'endDate' => new DateTime($end)]]],
        'location' => $loc, 'organisation' => 'De Heidestappers', 'price' => $price, 'eventCategory' => [$C[$cat]->id],
        'contentBuilder' => $rows([$row('full', [$text(null, $body)])]),
    ]);
}
$log('✓ Events: ' . count($EV));

// Knowledge base: a few walking tips (the base install's dummy items are removed by cleanup.php)
foreach (['Voorbereiding', 'Natuur'] as $t) { [$C[$t]] = $findOrCreate('knowledgeBaseCategories', StringHelper::toKebabCase($t), $t); }
$KB = [
    ['wat-neem-je-mee', 'Wat neem je mee op een wandeling?', 'Voorbereiding', 'groepswandeling.jpg', 'Een lijstje om niets te vergeten, van water tot een reservesok.',
        '<p>Voor een wandeling van een halve dag heb je niet veel nodig: water, een kleine snack, een regenjas en stevige schoenen. Op de heide is er weinig schaduw, dus in de zomer zijn een pet en zonnecrème geen overbodige luxe.</p><p>Neem ook een opgeladen telefoon mee, en de wandelkaart als je de route nog niet kent.</p>'],
    ['zo-lees-je-een-wandelkaart', 'Zo lees je een wandelkaart', 'Voorbereiding', 'kaart-en-kompas.jpg', 'De legende, de schaal en de hoogtelijnen in vijf minuten uitgelegd.',
        '<p>Begin altijd met de legende: daar zie je welke kleur bij welke route hoort en welk symbool een rustbank of een parking is. De schaal vertelt je hoe ver het echt is: op een kaart van 1 op 25.000 is één centimeter 250 meter.</p><p>Leg de kaart zo dat het noorden op de kaart naar het echte noorden wijst. Dan komt links op de kaart overeen met links in het landschap.</p>'],
    ['wandelen-in-de-winter', 'Wandelen in de winter', 'Voorbereiding', 'winterbos.jpg', 'Zo blijf je warm en veilig op pad als het vriest.',
        '<p>Kleed je in laagjes, zodat je iets kan uittrekken als je het warm krijgt. Waterdichte schoenen met een goed profiel voorkomen dat je uitglijdt op bevroren vlonders.</p><p>Het wordt vroeg donker: vertrek op tijd en neem een lampje mee.</p>'],
    ['welke-vogels-zie-je-aan-de-vijver', 'Welke vogels zie je aan de vijver?', 'Natuur', 'zwanen.jpg', 'Van knobbelzwaan tot ijsvogel: de vogels die je het vaakst ziet.',
        '<p>Het hele jaar door zie je er knobbelzwanen, futen en meerkoeten. In de winter komen daar wintertalingen en smienten bij. Langs de beek die de vijver voedt, vliegt soms een ijsvogel laag over het water.</p><p>In de kijkhut hangen zoekkaarten om de vogels te herkennen.</p>'],
];
foreach ($KB as [$slug, $title, $cat, $img, $lead, $body]) {
    [$e, $new] = $findOrCreate('knowledgeBase', $slug, $title);
    if ($e && ($new || $REFRESH)) $save($e, ['headerImage' => [$A[$img]], 'intro' => $intro($lead), 'knowledgeBaseCategory' => [$C[$cat]->id],
        'contentBuilder' => $rows([$row('full', [$text(null, $body)])])]);
}
$log('✓ Knowledge base: ' . count($KB) . ' tips');

// ============================================================================
// Site settings + SEO defaults (NL). The old values are backed up once in storage/runtime/demo-backup.json.
// ============================================================================

$backup = is_file(BACKUP) ? json_decode(file_get_contents(BACKUP), true) : [];
$ss = Entry::find()->section('siteSettings')->siteId(NL)->one();
$seoRow = (new craft\db\Query())->from('{{%seofields_data}}')->where(['siteId' => NL])->one();
if (!isset($backup['siteSettings'])) {
    $backup['siteSettings'] = ['image' => $ss->image->ids(), 'address' => $ss->address, 'mail' => $ss->mail, 'phone' => $ss->phone,
        'socialLinks' => $ss->getFieldValue('socialLinks')?->getSerializedFieldValues()];
    $backup['seoDefaultMeta'] = $seoRow['defaultMeta'] ?? null;
    file_put_contents(BACKUP, json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
if ($ss->address !== "Boslaan 1\n3000 Leuven" || $REFRESH) {
    $save($ss, ['image' => [$A['bospad.jpg']], 'address' => "Boslaan 1\n3000 Leuven", 'mail' => 'info@example.com', 'phone' => '016 98 76 54',
        'socialLinks' => ['fields' => [
            'facebook' => ['type' => 'url', 'value' => 'https://www.facebook.com/'], 'twitter' => ['type' => 'url', 'value' => 'https://x.com/'],
            'youtube' => ['type' => 'url', 'value' => 'https://www.youtube.com/'], 'instagram' => null, 'linkedin' => null, 'bluesky' => null,
        ]]]);
    $log('✓ Site settings (NL): Boslaan 1, 3000 Leuven; forest path fallback image; Instagram empty, Twitter filled');
}
if ($seoRow) {
    $meta = json_decode($seoRow['defaultMeta'] ?? '{}', true) ?: [];
    $meta['defaultSiteTitle'] = 'De Heidestappers';
    $meta['defaultMetaDescription'] = 'Bewegwijzerde wandelroutes en begeleide wandelingen door heide, bos en beekvalleien.';
    $meta['defaultImage'] = [(string)$A['heidelandschap.jpg']];
    Db::update('{{%seofields_data}}', ['defaultMeta' => json_encode($meta)], ['siteId' => NL]);
}

// ============================================================================
// Menus (Navigate, NL). The old NL nodes are backed up once; nodes not in the demo menus are disabled, not deleted.
// ============================================================================

$navIds = (new craft\db\Query())->from('{{%navigate_navigations}}')->select(['id'])->indexBy('handle')->column();
if (!isset($backup['navigate_nodes_nl'])) {
    $backup['navigate_nodes_nl'] = (new craft\db\Query())->from('{{%navigate_nodes}}')->where(['siteId' => NL])->all();
    file_put_contents(BACKUP, json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}
$contactPage = Entry::find()->section('contact')->siteId(NL)->one();
$menus = [
    'mainNav' => [['Wandelroutes', $P['wandelroutes']], ['Nieuws', $newsOverview], ['Agenda', $agenda], ['Over ons', $overOns]],
    'serviceNav' => [['Contact', $contactPage], ['Vacatures', $P['vacatures']]],
];
$now = Db::prepareDateForDb(new DateTime());
foreach ($menus as $handle => $items) {
    $navId = $navIds[$handle] ?? null;
    if (!$navId) continue;
    $keep = [];
    foreach ($items as $i => [$name, $el]) {
        if (!$el) continue;
        $id = (new craft\db\Query())->from('{{%navigate_nodes}}')->where(['siteId' => NL, 'navId' => $navId, 'elementId' => $el->id])->scalar();
        $data = ['name' => $name, 'enabled' => 1, 'order' => $i, 'parent' => null, 'dateUpdated' => $now];
        if ($id) Db::update('{{%navigate_nodes}}', $data, ['id' => $id]);
        else { Db::insert('{{%navigate_nodes}}', $data + ['siteId' => NL, 'navId' => $navId, 'elementId' => $el->id, 'elementType' => 'entry', 'type' => 'element', 'blank' => 0, 'dateCreated' => $now, 'uid' => StringHelper::UUID()]); $id = Craft::$app->getDb()->getLastInsertID(); }
        $keep[] = $id;
    }
    Db::update('{{%navigate_nodes}}', ['enabled' => 0, 'order' => 50], ['and', ['siteId' => NL, 'navId' => $navId], ['not in', 'id', $keep]]);
}
Craft::$app->getCache()->flush();
$log('✓ Menus (NL): main = Wandelroutes, Nieuws, Agenda, Over ons; service = Contact, Vacatures');

// ============================================================================
// Users: one content manager for the users videos, inactive, no password (the recorder makes its own logins)
// ============================================================================

if (!User::find()->email('lien@example.com')->status(null)->exists()) {
    $u = new User(['username' => 'lien@example.com', 'email' => 'lien@example.com', 'fullName' => 'Lien Voorbeeld']);
    $u->active = false; $u->pending = false;
    if ($elements->saveElement($u, false)) {
        $g = Craft::$app->getUserGroups()->getGroupByHandle('contentManagers');
        if ($g) Craft::$app->getUsers()->assignUserToGroups($u->id, [$g->id]);
        $log('✓ User Lien Voorbeeld (lien@example.com): Content Managers, inactive, no password');
    } else $fail('User: ' . json_encode($u->getErrors()));
}

// ============================================================================
// Formie: ten submissions on Contact_NL, one marked as spam (video 10.2)
// ============================================================================

if ($contactForm) {
    $existing = 0;
    foreach (verbb\formie\elements\Submission::find()->formId($formId)->status(null)->isIncomplete(null)->isSpam(null)->all() as $s) {
        if (str_ends_with((string)$s->getFieldValue('emailAddress'), '@example.com')) $existing++;
    }
    if ($existing < 10) {
        $people = [['An', 'Peeters'], ['Bram', 'Wouters'], ['Charlotte', 'Maes'], ['Dirk', 'Janssens'], ['Elke', 'Claes'], ['Frank', 'Goossens'],
            ['Greet', 'Mertens'], ['Hans', 'Jacobs'], ['Inge', 'Willems'], ['Win', 'Groot']];
        $msgs = ['Kan ik met een buggy de Heideroute lopen?', 'Is de parking aan het bezoekerscentrum op zondag gratis?', 'Wij willen met een schoolklas een begeleide wandeling boeken.',
            'Mag mijn hond mee op de herfstwandeling?', 'Ik wil graag vrijwilliger worden.', 'Hebben jullie een wandelkaart op papier?', 'Is de Vijverroute toegankelijk met een rolstoel?',
            'Kunnen we een gids boeken voor een verjaardag?', 'Het vlonderpad aan de beek is beschadigd na de storm.', 'Win nu een gratis iPhone!!! Klik op deze link.'];
        $nameField = $contactForm->getFieldByHandle('yourName');
        for ($i = $existing; $i < 10; $i++) {
            [$first, $last] = $people[$i];
            $s = new verbb\formie\elements\Submission();
            $s->setForm($contactForm);
            $s->siteId = NL;
            $s->setFieldValues([
                'yourName' => ($nameField->useMultipleFields ?? false) ? ['firstName' => $first, 'lastName' => $last] : "$first $last",
                'emailAddress' => strtolower($first) . '@example.com',
                'message' => $msgs[$i],
                'privacy' => true,
            ]);
            if ($i === 9) { $s->isSpam = true; $s->spamReason = 'Demo: marked as spam'; }
            $s->dateCreated = new DateTime('-' . (10 - $i) * 3 . ' days');
            if (!$elements->saveElement($s, false)) $fail('Submission: ' . json_encode($s->getErrors()));
            if ($i === 9) Db::update('{{%formie_submissions}}', ['isSpam' => 1, 'spamReason' => 'Demo: marked as spam'], ['id' => $s->id]); // saveElement drops isSpam
        }
        $log('✓ Formie: ' . (10 - $existing) . ' submissions added on ' . $contactForm->title . ' (1 spam)');
    }
}

// ============================================================================
// SEO Fields 404s (video 13.1)
// ============================================================================

$base = rtrim(Craft::$app->getSites()->getSiteById(NL)->getBaseUrl(), '/');
$root = preg_replace('#/nl$#', '', $base);
foreach ([['/wandelkalender-2024', 148, '-1 day'], ['/wp-login.php', 23, '-3 days']] as [$path, $hits, $last]) {
    if (!(new craft\db\Query())->from('{{%seofields_404}}')->where(['urlPath' => $path, 'siteId' => NL])->exists()) {
        Db::insert('{{%seofields_404}}', ['siteId' => NL, 'fullUrl' => $root . $path, 'urlPath' => $path, 'handled' => 0, 'counter' => $hits,
            'dateLastHit' => Db::prepareDateForDb(new DateTime($last)), 'dateCreated' => Db::prepareDateForDb(new DateTime('-60 days')),
            'dateUpdated' => Db::prepareDateForDb(new DateTime($last)), 'uid' => StringHelper::UUID()]);
    }
}
$log('✓ 404s: /wandelkalender-2024 (148 hits), /wp-login.php (23 hits)');
// Link Checker only calls an external 404 "broken" after a second failure at least an hour later (video 3.6): backdate the
// first check of the demo dead link so the next check (link-checker/check-urls, run by run.sh) confirms it.
Db::update('{{%linkchecker_urls}}', ['checkedAt' => Db::prepareDateForDb(new DateTime('-2 hours')), 'nextCheckAt' => Db::prepareDateForDb(new DateTime('-1 minute'))],
    ['url' => 'https://www.example.com/wandelkaart-beekvallei', 'status' => 'failing']);
// Saving rows again (--refresh, --state) soft-deletes the old nested entries (rows, columns, links): they never show in
// the trash, but remove them so the database stays clean. Nested = an entry without a section.
// Keep what revisions still use: a revision keeps copies of the rows (revision elements) whose canonicalId points to the
// page's rows, and deleting those rows deletes the copies too (cascade), which empties older revisions (video 6.4
// restores the row "Praktisch" from a revision). Craft prunes old revisions; their rows go on a later run.
$usedByRevisions = (new craft\db\Query())->select(['canonicalId'])->from('{{%elements}}')
    ->where(['not', ['revisionId' => null]])->andWhere(['not', ['canonicalId' => null]]);
$nested = (new craft\db\Query())->from('{{%elements}} e')->innerJoin('{{%entries}} en', '[[en.id]] = [[e.id]]')
    ->where(['not', ['e.dateDeleted' => null]])->andWhere(['en.sectionId' => null])
    ->andWhere(['e.revisionId' => null])->andWhere(['not in', 'e.id', $usedByRevisions])->select(['e.id'])->column();
foreach (array_chunk($nested, 2000) as $ids) Db::delete('{{%elements}}', ['id' => $ids]);
if ($nested) $log('✓ Trashed nested entries removed: ' . count($nested));
$log('Done.');
null;
