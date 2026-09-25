<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\base\FieldInterface;
use craft\console\Controller;
use craft\elements\Asset;
use craft\elements\Entry;
use craft\elements\User;
use craft\fields\Assets as AssetsField;
use craft\fields\Entries as EntriesField;
use craft\fields\Lightswitch;
use craft\fields\Matrix;
use craft\fields\PlainText;
use craft\fields\Url;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use craft\helpers\Json;
use craft\helpers\StringHelper;
use craft\models\EntryType;
use craft\models\Section;
use modules\statik\fields\AnchorLink;
use modules\statik\helpers\ContentbuilderShowcase;
use yii\console\ExitCode;

/**
 * Generates a "contentbuilder" showcase: one page per Content Builder block, holding an instance of
 * that block for every possible combination of its variable fields, all nested under a parent page
 * that links to them.
 *
 * Blocks and their fields are read from Craft at runtime (the contentBuilder Matrix field and its
 * entry types), so adding, removing or changing blocks does not require changes here. The content
 * that gets filled in lives in config/contentbuilder-showcase/content.json (see the
 * `updating-contentbuilder-showcase` Claude skill to refresh it).
 *
 * Which fields vary, and over which values, is decided by ContentbuilderShowcase::dimensionValues()
 * (shared with the _contentBuilder template, which labels each instance). A block gets one instance per item in the cartesian product of those dimensions. Pin a dimension
 * to a single value with `blocks.<handle>.fixed` in content.json to keep the product small.
 *
 * Usage:
 *   ddev craft statik/contentbuilder              Generate or update the showcase pages
 *   ddev craft statik/contentbuilder --dry-run    Only report blocks, dimensions and missing content
 *   ddev craft statik/contentbuilder --block=quote,image
 *
 * Remove the showcase again with `ddev craft statik/contentbuilder-cleanup` (ContentbuilderCleanupController).
 */
class ContentbuilderController extends Controller
{
    private const FIELD_HANDLE = 'contentBuilder';
    private const INTRO_FIELD_HANDLE = 'intro';
    private const CKEDITOR_FIELD_TYPE = 'craft\ckeditor\Field';

    /** Defaults for content.json "richText", the sample content used to show off CKEditor features */
    private const RICH_TEXT_DEFAULTS = [
        'link' => 'https://www.thekindkids.be',
        'bold' => 'bold text',
        'italic' => 'italic text',
        'linkText' => 'a link',
        'headings' => ['A heading', 'A smaller heading', 'An even smaller heading'],
        'listItems' => ['First item', 'Second item', 'Third item'],
        'paragraph' => '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
    ];
    private const LONG_TITLE_DEFAULT = 'An excessively long title that keeps on going to test how this block handles titles wrapping over several lines, including an unbreakable Supercalifragilisticexpialidociouslylongcompoundword';
    /** HTML tag => CKEditor toolbar item that allows it */
    private const RICH_TEXT_FEATURES = [
        'strong' => 'bold', 'b' => 'bold', 'em' => 'italic', 'i' => 'italic', 'a' => 'link',
        'ul' => 'bulletedList', 'ol' => 'numberedList', 'table' => 'insertTable',
    ];

    public $defaultAction = 'generate';

    /** @var string|null Path to the content JSON file (defaults to config/contentbuilder-showcase/content.json) */
    public ?string $content = null;

    /** @var bool Only report what would be generated */
    public bool $dryRun = false;

    /** @var string|null Comma-separated block handles to (re)generate; other block pages are left untouched */
    public ?string $block = null;

    /** @var int Maximum number of instances per block; a block exceeding it is skipped */
    public int $max = 150;

    /** @var bool Re-download images that were already imported */
    public bool $refreshImages = false;

    private array $contentData = [];
    private string $contentDir = '';
    /** @var array<string, int> image key => asset id */
    private array $imageIds = [];
    /** @var int[] */
    private array $showcasePageIds = [];
    /** @var string[] */
    private array $warnings = [];

    public function options($actionID): array
    {
        $options = parent::options($actionID);
        if ($actionID === 'generate') {
            array_push($options, 'content', 'dryRun', 'block', 'max', 'refreshImages');
        }
        return $options;
    }

    // Actions
    // =========================================================================

    public function actionGenerate(): int
    {
        if (!$this->loadContent()) {
            return ExitCode::CONFIG;
        }

        $section = Craft::$app->getEntries()->getSectionByHandle(ContentbuilderShowcase::SECTION_HANDLE);
        $field = Craft::$app->getFields()->getFieldByHandle(self::FIELD_HANDLE);
        if (!$section || !$field instanceof Matrix) {
            $this->stderr('Section "' . ContentbuilderShowcase::SECTION_HANDLE . '" or Matrix field "' . self::FIELD_HANDLE . '" not found.' . PHP_EOL, Console::FG_RED);
            return ExitCode::CONFIG;
        }
        $pageType = $this->getPageEntryType($section);
        if (!$pageType) {
            $this->stderr('No entry type in "' . ContentbuilderShowcase::SECTION_HANDLE . '" has the "' . self::FIELD_HANDLE . '" field.' . PHP_EOL, Console::FG_RED);
            return ExitCode::CONFIG;
        }

        $onlyBlocks = $this->block ? StringHelper::split($this->block) : null;
        $plans = [];
        foreach ($field->getEntryTypes() as $blockType) {
            if ($onlyBlocks && !in_array($blockType->handle, $onlyBlocks, true)) {
                continue;
            }
            if ($this->blockContent($blockType->handle)['skip'] ?? false) {
                $this->stdout("Skipping {$blockType->name} (skip: true in content)" . PHP_EOL, Console::FG_GREY);
                continue;
            }
            $plans[$blockType->handle] = $this->planBlock($blockType);
        }

        $this->printPlan($plans);

        if ($this->dryRun) {
            $this->printWarnings();
            return ExitCode::OK;
        }

        $author = User::find()->admin()->status(null)->one();
        $parent = $this->ensureParentPage($section, $pageType, $author);
        if (!$parent) {
            return ExitCode::UNSPECIFIED_ERROR;
        }

        // Pass 1: make sure every block page exists, so blocks relating to entries can use them.
        $pages = [];
        foreach ($field->getEntryTypes() as $blockType) {
            $pages[$blockType->handle] = $this->findChildPage($parent, $blockType->handle);
        }
        foreach ($plans as $handle => $plan) {
            if (!$pages[$handle] && !$plan['tooLarge']) {
                $pages[$handle] = $this->createPage($section, $pageType, $author, $plan['type']->name, $this->pageSlug($handle), $parent);
            }
        }
        $this->showcasePageIds = array_values(array_filter(array_map(fn(?Entry $page) => $page?->id, $pages)));

        $this->importImages();

        // Pass 2: fill the block pages.
        foreach ($plans as $handle => $plan) {
            if ($plan['tooLarge'] || !$pages[$handle]) {
                continue;
            }
            $this->fillBlockPage($pages[$handle], $plan);
        }

        // Remove pages of blocks that no longer exist (only on a full run).
        if (!$onlyBlocks) {
            $this->removeStalePages($parent, array_keys($pages));
        }

        $this->fillParentPage($parent, $field, array_values(array_filter($pages)));

        $this->printWarnings();
        $this->stdout(PHP_EOL . 'Done! ' . $parent->getUrl() . PHP_EOL, Console::FG_GREEN);

        return ExitCode::OK;
    }

    // Planning: which combinations does a block get?
    // =========================================================================

    private function planBlock(EntryType $blockType): array
    {
        $fixed = $this->blockContent($blockType->handle)['fixed'] ?? [];
        $dimensions = [];
        $placeholders = [];

        foreach ($blockType->getFieldLayout()->getCustomFields() as $field) {
            $values = ContentbuilderShowcase::dimensionValues($field);
            if (array_key_exists($field->handle, $fixed)) {
                $values = [$fixed[$field->handle]];
            }
            if (count($values) > 1) {
                $dimensions[$field->handle] = $values;
            }
            if (!$field instanceof Lightswitch && in_array(true, $values, true) && !$this->hasContent($blockType->handle, $field->handle)) {
                $placeholders[] = $field->handle . ' (' . $field::displayName() . ')';
            }
        }

        $count = array_product(array_map('count', $dimensions)) ?: 1;

        return [
            'type' => $blockType,
            'dimensions' => $dimensions,
            'fixed' => $fixed,
            'placeholders' => $placeholders,
            'count' => $count,
            'tooLarge' => $count > $this->max,
        ];
    }

    private function combinations(array $dimensions): array
    {
        $combinations = [[]];
        foreach ($dimensions as $handle => $values) {
            $next = [];
            foreach ($combinations as $combination) {
                foreach ($values as $value) {
                    $next[] = $combination + [$handle => $value];
                }
            }
            $combinations = $next;
        }
        return $combinations;
    }

    // Filling pages
    // =========================================================================

    private function fillBlockPage(Entry $page, array $plan): void
    {
        /** @var EntryType $blockType */
        $blockType = $plan['type'];
        $fields = $blockType->getFieldLayout()->getCustomFields();
        $combinations = $this->combinations($plan['dimensions']);

        $variants = [];
        $filledIn = [];
        foreach ($combinations as $i => $combination) {
            foreach ($fields as $field) {
                $variant = $combination[$field->handle] ?? $plan['fixed'][$field->handle] ?? ContentbuilderShowcase::dimensionValues($field)[0];
                $variants[$i][$field->handle] = $variant;
                if ($variant === true) {
                    $filledIn[$field->handle][] = $i;
                }
            }
        }

        $blocks = [];
        foreach ($combinations as $i => $combination) {
            $fieldValues = [];
            foreach ($fields as $field) {
                $filled = $filledIn[$field->handle] ?? [];
                // Stress examples, one instance each: the first filled instance shows every rich text feature (see richText()),
                // the second one (or the only one) gets excessively long titles (see longTitle())
                $full = ($filled[0] ?? null) === $i;
                $long = ($filled[1] ?? $filled[0] ?? null) === $i;
                $value = $this->fieldValue($field, $variants[$i][$field->handle], $blockType->handle, $page, $full, $long);
                if ($value !== null) {
                    $fieldValues[$field->handle] = $value;
                }
            }
            $blocks['new' . ($i + 1)] = [
                'type' => $blockType->handle,
                'enabled' => true,
                'fields' => $fieldValues,
            ];
        }

        $varied = array_map(fn($handle) => ContentbuilderShowcase::fieldLabel($this->fieldByHandle($fields, $handle)), array_keys($plan['dimensions']));
        $intro = '<p>' . count($blocks) . ' ' . (count($blocks) === 1 ? 'variation' : 'variations') . ' of the “' . $blockType->name . '” block.'
            . ($varied ? ' Varied: ' . implode(', ', $varied) . '.' : '') . '</p>';

        $this->saveOnAllSites($page, [
            self::FIELD_HANDLE => $blocks,
            self::INTRO_FIELD_HANDLE => $intro,
        ], $blockType->name, count($blocks) . (count($blocks) === 1 ? ' instance' : ' instances'));
    }

    /**
     * The parent page links to every block page: through a block with an Entries field (e.g. "Overview")
     * when there is one, otherwise through a list of links in the first block with a rich text field.
     */
    private function fillParentPage(Entry $parent, Matrix $field, array $pages): void
    {
        $parentContent = $this->contentData['parent'] ?? [];
        $block = null;

        foreach ($field->getEntryTypes() as $blockType) {
            foreach ($blockType->getFieldLayout()->getCustomFields() as $blockField) {
                if ($blockField instanceof EntriesField) {
                    $block = ['type' => $blockType->handle, 'title' => 'Blocks', 'fields' => [$blockField->handle => array_map(fn(Entry $page) => $page->id, $pages)]];
                    break 2;
                }
            }
        }

        if (!$block) {
            foreach ($field->getEntryTypes() as $blockType) {
                foreach ($blockType->getFieldLayout()->getCustomFields() as $blockField) {
                    if ($blockField::class === self::CKEDITOR_FIELD_TYPE) {
                        $links = array_map(fn(Entry $page) => '<li><a href="{entry:' . $page->id . ':url||' . $page->getUrl() . '}">' . htmlspecialchars($page->title) . '</a></li>', $pages);
                        $block = ['type' => $blockType->handle, 'title' => 'Blocks', 'fields' => [$blockField->handle => '<ul>' . implode('', $links) . '</ul>']];
                        break 2;
                    }
                }
            }
        }

        $values = [self::INTRO_FIELD_HANDLE => $parentContent['intro'] ?? null];
        if ($block) {
            $values[self::FIELD_HANDLE] = ['new1' => $block + ['enabled' => true]];
        } else {
            $this->warnings[] = 'No block with an Entries or rich text field found to link the block pages from the parent page.';
        }

        $this->saveOnAllSites($parent, $values, $parent->title, count($pages) . ' block pages linked');
    }

    /**
     * Content Builder content is translated per site, so the same content is written to every site.
     */
    private function saveOnAllSites(Entry $page, array $fieldValues, string $label, string $summary): void
    {
        foreach ($page->getSupportedSites() as $siteInfo) {
            $siteId = is_array($siteInfo) ? $siteInfo['siteId'] : $siteInfo;
            $sitePage = Entry::find()->id($page->id)->siteId($siteId)->status(null)->one();
            if (!$sitePage) {
                continue;
            }
            $sitePage->setFieldValues($fieldValues);
            if (!Craft::$app->getElements()->saveElement($sitePage)) {
                $this->stderr("✗ {$label} ({$sitePage->getSite()->handle}): " . implode(' ', $sitePage->getFirstErrors()) . PHP_EOL, Console::FG_RED);
                return;
            }
        }
        $this->stdout("✓ {$label}: {$summary}" . PHP_EOL, Console::FG_GREEN);
    }

    // Field values
    // =========================================================================

    /**
     * Returns the value to store for a field. `$variant` is a literal option value, or true/false for filled/empty.
     * Content is looked up in content.json: blocks.<block>.fields.<field> → fields.<field> → a fallback per field type.
     * Extend `fallbackValue()` / `normalizeContent()` when blocks get new field types.
     */
    private function fieldValue(FieldInterface $field, mixed $variant, string $blockHandle, Entry $page, bool $full = false, bool $long = false): mixed
    {
        if ($field instanceof Lightswitch) {
            return (bool)$variant;
        }
        if (!is_bool($variant)) {
            return $variant;
        }
        if ($variant === false) {
            return $this->emptyValue($field);
        }
        if ($long && ContentbuilderShowcase::isTitleField($field)) {
            return $this->longTitle();
        }

        $content = $this->contentFor($blockHandle, $field->handle);
        if ($content === null) {
            $value = $this->fallbackValue($field, $page, $full, "{$blockHandle}.{$field->handle}", $long);
            if ($value === null) {
                $this->warnings[] = "No content for {$blockHandle}.{$field->handle} (" . $field::displayName() . ') — add it to content.json.';
            }
            return $value;
        }

        return $this->normalizeContent($field, $content, $page, $blockHandle, $full, $long);
    }

    private function normalizeContent(FieldInterface $field, mixed $content, Entry $page, string $blockHandle, bool $full = false, bool $long = false): mixed
    {
        if ($field::class === self::CKEDITOR_FIELD_TYPE) {
            return $this->richText($field, (string)$content, $full, "{$blockHandle}.{$field->handle}");
        }

        if ($field instanceof AssetsField) {
            $keys = $content === '*' ? array_keys($this->imageIds) : (array)$content;
            $ids = [];
            foreach ($keys as $key) {
                if (isset($this->imageIds[$key])) {
                    $ids[] = $this->imageIds[$key];
                } else {
                    $this->warnings[] = "Image \"{$key}\" used by {$blockHandle}.{$field->handle} is not defined in content.json images.";
                }
            }
            return $field->maxRelations ? array_slice($ids, 0, $field->maxRelations) : $ids;
        }

        if ($field instanceof EntriesField) {
            // "@showcase" = other showcase pages; otherwise a list of entry URIs (on the primary site).
            if ($content === '@showcase') {
                return $this->fallbackValue($field, $page);
            }
            $ids = [];
            foreach ((array)$content as $uri) {
                $entry = Entry::find()->uri($uri)->status(null)->one();
                $entry ? $ids[] = $entry->id : $this->warnings[] = "Entry with URI \"{$uri}\" not found for {$blockHandle}.{$field->handle}.";
            }
            return $ids;
        }

        if ($field::class === 'verbb\hyper\fields\HyperField') {
            return $this->hyperLinks($field, (array)$content, $blockHandle);
        }

        if ($field::class === 'verbb\formie\fields\Forms') {
            $form = \verbb\formie\elements\Form::find()->handle($content)->one();
            if (!$form) {
                $this->warnings[] = "Form \"{$content}\" not found for {$blockHandle}.{$field->handle}; using the first form.";
                return $this->fallbackValue($field, $page);
            }
            return [$form->id];
        }

        if ($field instanceof Matrix) {
            return $this->nestedEntries($field, (array)$content, $page, $blockHandle, $full, $long);
        }

        return $content;
    }

    private function fallbackValue(FieldInterface $field, Entry $page, bool $full = false, string $context = '', bool $long = false): mixed
    {
        return match (true) {
            $field::class === self::CKEDITOR_FIELD_TYPE => $this->richText($field, null, $full, $context),
            $field instanceof PlainText, $field instanceof AnchorLink => 'Lorem ipsum dolor sit amet',
            $field instanceof Url => 'https://www.statik.be',
            $field instanceof AssetsField => $field->maxRelations ? array_slice(array_values($this->imageIds), 0, $field->maxRelations) : array_slice(array_values($this->imageIds), 0, 4),
            $field instanceof EntriesField => array_slice(array_values(array_diff($this->showcasePageIds, [$page->id])), 0, 3),
            $field::class === 'verbb\hyper\fields\HyperField' => $this->hyperLinks($field, [['type' => 'url', 'value' => 'https://www.statik.be', 'text' => 'Read more']], ''),
            $field::class === 'verbb\formie\fields\Forms' => array_filter([\verbb\formie\elements\Form::find()->one()?->id]),
            $field instanceof Matrix => $this->nestedEntries($field, [[], [], []], $page, $context, $full, $long),
            default => null,
        };
    }

    private function emptyValue(FieldInterface $field): mixed
    {
        return match (true) {
            $field instanceof AssetsField, $field instanceof EntriesField, $field instanceof Matrix => [],
            $field::class === 'verbb\hyper\fields\HyperField' => [],
            default => null,
        };
    }

    /**
     * Links in content.json: { "type": "url"|"email"|"entry"|<link type handle>, "value": "...", "text": "...", "newWindow": false, "fields": { "ctaFieldLinkLayouts": "btn btn--primary" } }
     * For "entry" links, value is the entry URI on the primary site ("__home__" for the homepage).
     */
    private function hyperLinks(FieldInterface $field, array $links, string $blockHandle): array
    {
        /** @var \verbb\hyper\fields\HyperField $field */
        $typeHandles = [
            'url' => 'default-verbb-hyper-links-url',
            'email' => 'default-verbb-hyper-links-email',
            'entry' => 'default-verbb-hyper-links-entry',
            'asset' => 'default-verbb-hyper-links-asset',
        ];

        $result = [];
        foreach ($links as $link) {
            $handle = $typeHandles[$link['type'] ?? 'url'] ?? $link['type'];
            $linkType = $field->getLinkTypeByHandle($handle);
            if (!$linkType || !$linkType->enabled) {
                $this->warnings[] = "Link type \"{$handle}\" is not enabled on {$blockHandle}.{$field->handle}; link skipped.";
                continue;
            }

            $value = $link['value'] ?? '';
            if ($handle === $typeHandles['entry']) {
                $value = Entry::find()->uri($value)->status(null)->one()?->id;
            } elseif ($handle === $typeHandles['asset']) {
                $value = $this->imageIds[$value] ?? null;
            }

            $result[] = [
                'handle' => $handle,
                'type' => $linkType::class,
                'linkValue' => $value,
                'linkText' => $link['text'] ?? null,
                'newWindow' => $link['newWindow'] ?? false,
                'fields' => $link['fields'] ?? [],
            ];
            if (!$field->multipleLinks) {
                break;
            }
        }
        return $result;
    }

    /**
     * Nested Matrix items in content.json: a list of objects keyed by field handle, with an optional "type"
     * (nested entry type handle, defaults to the first one). Missing fields get fallback content.
     */
    private function nestedEntries(Matrix $field, array $items, Entry $page, string $blockHandle, bool $full = false, bool $long = false): array
    {
        $entryTypes = $field->getEntryTypes();
        $result = [];
        foreach (array_values($items) as $i => $item) {
            $type = $item['type'] ?? $entryTypes[0]->handle;
            $entryType = collect($entryTypes)->firstWhere('handle', $type);
            if (!$entryType) {
                $this->warnings[] = "Nested entry type \"{$type}\" does not exist in {$blockHandle}.{$field->handle}.";
                continue;
            }
            // Only the first nested item of the "full" / "long" instance gets the stress content
            $itemFull = $full && $i === 0;
            $itemLong = $long && $i === 0;
            $context = "{$blockHandle}.{$field->handle}";
            $values = [];
            foreach ($entryType->getFieldLayout()->getCustomFields() as $nestedField) {
                if ($itemLong && ContentbuilderShowcase::isTitleField($nestedField)) {
                    $values[$nestedField->handle] = $this->longTitle();
                    continue;
                }
                $values[$nestedField->handle] = array_key_exists($nestedField->handle, $item)
                    ? $this->normalizeContent($nestedField, $item[$nestedField->handle], $page, $context, $itemFull)
                    : $this->fallbackValue($nestedField, $page, $itemFull, "{$context}.{$nestedField->handle}");
            }
            $result['new' . ($i + 1)] = ['type' => $type, 'enabled' => true, 'fields' => array_filter($values, fn($value) => $value !== null)];
        }
        return $result;
    }

    // Rich text (CKEditor)
    // =========================================================================

    /**
     * CKEditor content, adapted to what the field's toolbar offers:
     *  - every instance has bold, italic and linked text; when the content lacks one, a sample sentence is added;
     *  - the "full" instance (the first one where the field is filled) also gets a heading for every allowed
     *    heading level, a bulleted list and a numbered list.
     * Sample texts come from content.json "richText" (see RICH_TEXT_DEFAULTS).
     */
    private function richText(FieldInterface $field, ?string $html, bool $full, string $context): string
    {
        /** @var \craft\ckeditor\Field $field */
        $settings = ($this->contentData['richText'] ?? []) + self::RICH_TEXT_DEFAULTS;
        $toolbar = $field->toolbar;
        $isGiven = $html !== null;
        $html ??= '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>';

        foreach ($this->unsupportedTags($field, $html) as $tag) {
            $this->warnings[] = "{$context}: <{$tag}> is not available in this field's editor; remove it from content.json.";
        }

        $missing = [];
        if (in_array('bold', $toolbar, true) && !preg_match('/<(strong|b)[\s>]/i', $html)) {
            $missing['bold'] = '<strong>' . $settings['bold'] . '</strong>';
        }
        if (in_array('italic', $toolbar, true) && !preg_match('/<(em|i)[\s>]/i', $html)) {
            $missing['italic'] = '<em>' . $settings['italic'] . '</em>';
        }
        if (in_array('link', $toolbar, true) && !preg_match('/<a\s/i', $html)) {
            $missing['link'] = '<a href="' . htmlspecialchars($settings['link']) . '">' . $settings['linkText'] . '</a>';
        }
        if ($missing) {
            if ($isGiven) {
                $this->warnings[] = "{$context}: content has no " . implode('/', array_keys($missing)) . ' text; a sample sentence was added.';
            }
            $html .= '<p>' . implode(', ', $missing) . '.</p>';
        }

        if ($full) {
            $levels = in_array('heading', $toolbar, true) && $field->headingLevels ? array_map('intval', array_values($field->headingLevels)) : [];
            $lists = array_values(array_filter([
                in_array('bulletedList', $toolbar, true) ? 'ul' : null,
                in_array('numberedList', $toolbar, true) ? 'ol' : null,
            ]));
            $items = '<li>' . implode('</li><li>', $settings['listItems']) . '</li>';
            $headings = array_values($settings['headings']);

            // Alternate headings with lists (or a paragraph once the lists are used up)
            for ($i = 0; $i < max(count($levels), count($lists)); $i++) {
                if (isset($levels[$i])) {
                    $html .= "<h{$levels[$i]}>" . $headings[$i % count($headings)] . "</h{$levels[$i]}>";
                }
                $html .= isset($lists[$i]) ? "<{$lists[$i]}>{$items}</{$lists[$i]}>" : $settings['paragraph'];
            }
        }

        return $html;
    }

    /**
     * An excessively long title (content.json "longTitle"), to test wrapping, hyphenation and overflow.
     */
    private function longTitle(): string
    {
        return $this->contentData['longTitle'] ?? self::LONG_TITLE_DEFAULT;
    }

    /**
     * Tags in the content that this field's editor can't produce. Skipped for editors with source editing.
     */
    private function unsupportedTags(FieldInterface $field, string $html): array
    {
        /** @var \craft\ckeditor\Field $field */
        $toolbar = $field->toolbar;
        if (in_array('sourceEditing', $toolbar, true)) {
            return [];
        }
        $levels = in_array('heading', $toolbar, true) && $field->headingLevels ? array_map('intval', $field->headingLevels) : [];

        preg_match_all('/<([a-z][a-z0-9]*)[\s>\/]/i', $html, $matches);
        $unsupported = [];
        foreach (array_unique(array_map('strtolower', $matches[1])) as $tag) {
            $feature = self::RICH_TEXT_FEATURES[$tag] ?? null;
            if (($feature && !in_array($feature, $toolbar, true)) || (preg_match('/^h([1-6])$/', $tag, $h) && !in_array((int)$h[1], $levels, true))) {
                $unsupported[] = $tag;
            }
        }
        return $unsupported;
    }

    // Images
    // =========================================================================

    /**
     * Imports the images from content.json into the showcase folder. Each image has a key and either a
     * "url" or a "file" (relative to the content.json folder), plus optional "alt", "caption", "copyright" and "filename".
     */
    private function importImages(): void
    {
        $images = $this->contentData['images'] ?? [];
        if (!$images) {
            return;
        }

        $folder = $this->getImageFolder();
        if (!$folder) {
            return;
        }

        foreach ($images as $key => $image) {
            $source = $image['file'] ?? $image['url'] ?? null;
            if (!$source) {
                $this->warnings[] = "Image \"{$key}\" has no url or file.";
                continue;
            }
            $extension = strtolower(pathinfo(parse_url($source, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION)) ?: 'jpg';
            $filename = $image['filename'] ?? StringHelper::toKebabCase($key) . '.' . $extension;

            $asset = Asset::find()->folderId($folder->id)->filename($filename)->one();
            $needsFile = !$asset || $this->refreshImages;
            $tempPath = null;

            if ($needsFile) {
                $tempPath = $this->fetchImage($source);
                if (!$tempPath) {
                    $this->warnings[] = "Could not fetch image \"{$key}\" from {$source}.";
                    continue;
                }
            }

            if ($asset && $tempPath) {
                Craft::$app->getAssets()->replaceAssetFile($asset, $tempPath, $filename);
            } elseif (!$asset) {
                $asset = new Asset();
                $asset->tempFilePath = $tempPath;
                $asset->filename = $filename;
                $asset->newFolderId = $folder->id;
                $asset->volumeId = $folder->volumeId;
                $asset->avoidFilenameConflicts = true;
                $asset->setScenario(Asset::SCENARIO_CREATE);
            }

            $asset->alt = $image['alt'] ?? null;
            $layout = $asset->getFieldLayout();
            foreach (['imageCaption' => 'caption', 'imageCopyright' => 'copyright'] as $fieldHandle => $property) {
                if (isset($image[$property]) && $layout?->getFieldByHandle($fieldHandle)) {
                    $asset->setFieldValue($fieldHandle, $image[$property]);
                }
            }

            if (Craft::$app->getElements()->saveElement($asset)) {
                $this->imageIds[$key] = $asset->id;
            } else {
                $this->warnings[] = "Could not save image \"{$key}\": " . implode(' ', $asset->getFirstErrors());
            }
        }

        $this->stdout('✓ Images: ' . count($this->imageIds) . ' of ' . count($images) . ' available' . PHP_EOL, Console::FG_GREEN);
    }

    private function fetchImage(string $source): ?string
    {
        $tempPath = Craft::$app->getPath()->getTempPath() . '/contentbuilder-showcase-' . StringHelper::randomString(8);

        if (!preg_match('/^https?:\/\//', $source)) {
            $path = str_starts_with($source, '/') ? $source : $this->contentDir . '/' . $source;
            return is_file($path) && copy($path, $tempPath) ? $tempPath : null;
        }

        try {
            Craft::createGuzzleClient()->get($source, ['sink' => $tempPath, 'timeout' => 30]);
            return $tempPath;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function getImageFolder(): ?\craft\models\VolumeFolder
    {
        $settings = $this->contentData['assets'] ?? [];
        $volume = Craft::$app->getVolumes()->getVolumeByHandle($settings['volume'] ?? 'publicFiles');
        if (!$volume) {
            $this->warnings[] = 'Asset volume "' . ($settings['volume'] ?? 'publicFiles') . '" not found; no images imported.';
            return null;
        }
        $path = trim($settings['folder'] ?? 'contentbuilder-showcase', '/') . '/';
        return Craft::$app->getAssets()->ensureFolderByFullPathAndVolume($path, $volume);
    }

    // Pages
    // =========================================================================

    private function ensureParentPage(Section $section, EntryType $pageType, ?User $author): ?Entry
    {
        $parent = ContentbuilderShowcase::findParentPage();
        if ($parent) {
            return $parent;
        }
        $title = $this->contentData['parent']['title'] ?? 'Contentbuilder';
        $parent = $this->createPage($section, $pageType, $author, $title, ContentbuilderShowcase::parentSlug());
        if ($parent) {
            $this->stdout("✓ Created \"{$title}\" page" . PHP_EOL, Console::FG_GREEN);
        }
        return $parent;
    }

    private function findChildPage(Entry $parent, string $blockHandle): ?Entry
    {
        return Entry::find()->section(ContentbuilderShowcase::SECTION_HANDLE)->descendantOf($parent)->descendantDist(1)->slug($this->pageSlug($blockHandle))->status(null)->one();
    }

    private function createPage(Section $section, EntryType $pageType, ?User $author, string $title, string $slug, ?Entry $parent = null): ?Entry
    {
        $page = new Entry();
        $page->sectionId = $section->id;
        $page->typeId = $pageType->id;
        $page->title = $title;
        $page->slug = $slug;
        $page->setAuthorIds($author ? [$author->id] : []);
        if ($parent) {
            $page->setParentId($parent->id);
        }
        if (!Craft::$app->getElements()->saveElement($page)) {
            $this->stderr("✗ Could not create page \"{$title}\": " . implode(' ', $page->getFirstErrors()) . PHP_EOL, Console::FG_RED);
            return null;
        }
        return $page;
    }

    private function removeStalePages(Entry $parent, array $blockHandles): void
    {
        $slugs = array_map(fn($handle) => $this->pageSlug($handle), $blockHandles);
        $stale = Entry::find()->section(ContentbuilderShowcase::SECTION_HANDLE)->descendantOf($parent)->descendantDist(1)->slug(array_merge(['not'], $slugs))->status(null)->all();
        foreach ($stale as $page) {
            Craft::$app->getElements()->deleteElement($page);
            $this->stdout("✓ Removed \"{$page->title}\" (block no longer exists)" . PHP_EOL, Console::FG_YELLOW);
        }
    }

    private function getPageEntryType(Section $section): ?EntryType
    {
        foreach ($section->getEntryTypes() as $entryType) {
            if ($entryType->getFieldLayout()->getFieldByHandle(self::FIELD_HANDLE)) {
                return $entryType;
            }
        }
        return null;
    }

    private function pageSlug(string $blockHandle): string
    {
        return StringHelper::toKebabCase($blockHandle);
    }

    // Helpers
    // =========================================================================

    private function loadContent(): bool
    {
        $path = $this->content ? FileHelper::normalizePath($this->content) : ContentbuilderShowcase::CONTENT_PATH;
        if (!is_file($path)) {
            $this->stderr("Content file not found: {$path}" . PHP_EOL, Console::FG_RED);
            return false;
        }
        try {
            $this->contentData = Json::decode(file_get_contents($path)) ?? [];
        } catch (\Throwable $e) {
            $this->stderr("Invalid JSON in {$path}: {$e->getMessage()}" . PHP_EOL, Console::FG_RED);
            return false;
        }
        $this->contentDir = dirname($path);
        return true;
    }

    private function blockContent(string $blockHandle): array
    {
        return $this->contentData['blocks'][$blockHandle] ?? [];
    }

    /**
     * Content for a block field: blocks.<block>.fields.<field>, falling back to the shared fields.<field>.
     */
    private function contentFor(string $blockHandle, string $fieldHandle): mixed
    {
        return $this->blockContent($blockHandle)['fields'][$fieldHandle] ?? $this->contentData['fields'][$fieldHandle] ?? null;
    }

    private function hasContent(string $blockHandle, string $fieldHandle): bool
    {
        return $this->contentFor($blockHandle, $fieldHandle) !== null;
    }

    private function fieldByHandle(array $fields, string $handle): ?FieldInterface
    {
        foreach ($fields as $field) {
            if ($field->handle === $handle) {
                return $field;
            }
        }
        return null;
    }

    private function printPlan(array $plans): void
    {
        $this->stdout(PHP_EOL);
        foreach ($plans as $handle => $plan) {
            $color = $plan['tooLarge'] ? Console::FG_RED : Console::FG_CYAN;
            $this->stdout(str_pad($plan['type']->name . " ({$handle})", 36) . str_pad($plan['count'] . ($plan['count'] === 1 ? ' instance' : ' instances'), 16), $color);
            $fields = $plan['type']->getFieldLayout()->getCustomFields();
            $dims = [];
            foreach ($plan['dimensions'] as $fieldHandle => $values) {
                $field = $this->fieldByHandle($fields, $fieldHandle);
                $dims[] = $fieldHandle . '[' . implode('|', array_map(fn($value) => ContentbuilderShowcase::formatValue($field, $value), $values)) . ']';
            }
            $this->stdout(implode(' × ', $dims) . PHP_EOL);
            if ($plan['placeholders']) {
                $this->stdout('  ↳ placeholder content (not in content.json): ' . implode(', ', $plan['placeholders']) . PHP_EOL, Console::FG_GREY);
            }
            if ($plan['tooLarge']) {
                $this->stdout("  ↳ more than --max={$this->max}: skipped. Pin dimensions with blocks.{$handle}.fixed in content.json or raise --max." . PHP_EOL, Console::FG_RED);
            }
        }
        $this->stdout(PHP_EOL);
    }

    private function printWarnings(): void
    {
        foreach (array_unique($this->warnings) as $warning) {
            $this->stdout('! ' . $warning . PHP_EOL, Console::FG_YELLOW);
        }
    }
}
