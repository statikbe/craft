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
use modules\statik\helpers\GridBuilder;
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
 * The "Content row" block is the exception: it gets a showcase of its own (a separate parent page, "gridbuilder"),
 * with a page per column type that links to a page per combination of two column types, see planGrid().
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
    /** Key of the grid showcase parent page in the grid plan, see planGrid() */
    private const GRID_ROOT = '@root';

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
        $gridPlans = null;
        foreach ($field->getEntryTypes() as $blockType) {
            if ($onlyBlocks && !in_array($blockType->handle, $onlyBlocks, true)) {
                continue;
            }
            if ($this->blockContent($blockType->handle)['skip'] ?? false) {
                $this->stdout("Skipping {$blockType->name} (skip: true in content)" . PHP_EOL, Console::FG_GREY);
                continue;
            }
            if ($blockType->handle === GridBuilder::ROW_TYPE) {
                // Content rows get a showcase of their own, see planGrid()
                $gridPlans = $this->planGrid($blockType);
                continue;
            }
            $plans[$blockType->handle] = $this->planBlock($blockType);
        }

        $this->printPlan($plans);
        $this->printGridPlan($gridPlans ?? []);

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
        // The content row block has no page here, it has a showcase of its own.
        $pages = [];
        foreach ($field->getEntryTypes() as $blockType) {
            if ($blockType->handle !== GridBuilder::ROW_TYPE) {
                $pages[$blockType->handle] = $this->findChildPage($parent, $this->pageSlug($blockType->handle));
            }
        }
        foreach ($plans as $handle => $plan) {
            if (!$pages[$handle] && !$plan['tooLarge']) {
                $pages[$handle] = $this->createPage($section, $pageType, $author, $plan['type']->name, $this->pageSlug($handle), $parent);
            }
        }
        $this->showcasePageIds = array_values(array_filter(array_map(fn(?Entry $page) => $page?->id, $pages)));
        $gridPages = $gridPlans !== null ? $this->ensureGridPages($section, $pageType, $author, $gridPlans) : [];

        $this->importImages();

        // Pass 2: fill the block pages.
        foreach ($plans as $handle => $plan) {
            if ($plan['tooLarge'] || !$pages[$handle]) {
                continue;
            }
            $this->fillBlockPage($pages[$handle], $plan);
        }
        foreach ($gridPlans ?? [] as $key => $gridPlan) {
            if (!isset($gridPages[$key])) {
                continue;
            }
            isset($gridPlan['links'])
                ? $this->fillOverviewPage($gridPages[$key], $field, $gridPlan, $gridPages)
                : $this->fillGridPage($gridPages[$key], $gridPlan);
        }

        // Remove pages of blocks that no longer exist (only on a full run), and grid pages of column types or combinations that no longer exist.
        if (!$onlyBlocks) {
            $this->removeStalePages($parent, array_keys($pages));
        }
        if ($gridPages) {
            $this->removeStaleGridPages($gridPages[self::GRID_ROOT], $gridPages);
        }

        $this->fillParentPage($parent, $field, array_values(array_filter($pages)));

        $this->printWarnings();
        $this->stdout(PHP_EOL . 'Done! ' . $parent->getUrl() . PHP_EOL, Console::FG_GREEN);
        if ($gridPages) {
            $this->stdout('Done! ' . $gridPages[self::GRID_ROOT]->getUrl() . PHP_EOL, Console::FG_GREEN);
        }

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

        // Grouped dimensions only vary among each other (other fields at their default), not in the main product
        $groups = [];
        foreach ($this->blockContent($blockType->handle)['groups'] ?? [] as $group) {
            $group = array_intersect_key($dimensions, array_flip((array)$group));
            if ($group) {
                $groups[] = $group;
            }
        }
        $main = array_diff_key($dimensions, ...$groups);

        $base = [];
        foreach ($blockType->getFieldLayout()->getCustomFields() as $field) {
            if (isset($dimensions[$field->handle])) {
                $base[$field->handle] = $this->baseValue($field, $dimensions[$field->handle]);
            }
        }

        $combinations = [];
        foreach ([$main, ...$groups] as $set) {
            foreach ($this->combinations($set) as $combination) {
                $combinations[] = array_merge($base, $combination);
            }
        }
        // A dependent dimension only varies when at least one of the fields it depends on is filled; otherwise it stays at its default
        $dependsOn = array_intersect_key($this->blockContent($blockType->handle)['dependsOn'] ?? [], $dimensions);
        foreach ($combinations as &$combination) {
            foreach ($dependsOn as $handle => $fieldHandles) {
                $isEmpty = fn($fieldHandle) => in_array($combination[$fieldHandle] ?? $fixed[$fieldHandle] ?? true, [false, 0], true);
                if (count(array_filter((array)$fieldHandles, $isEmpty)) === count((array)$fieldHandles)) {
                    $combination[$handle] = $base[$handle];
                }
            }
        }
        unset($combination);
        // A group combination can equal a main one (everything at its default), and dependsOn can make combinations equal
        $combinations = array_values(array_intersect_key($combinations, array_unique(array_map('serialize', $combinations))));
        $count = count($combinations);

        return [
            'type' => $blockType,
            'dimensions' => $dimensions,
            'main' => $main,
            'groups' => $groups,
            'combinations' => $combinations,
            'fixed' => $fixed,
            'placeholders' => $placeholders,
            'count' => $count,
            'tooLarge' => $count > $this->max,
        ];
    }

    /**
     * The value a dimension has when it is not varied: the field's default option when it has one, else the first value.
     */
    private function baseValue(FieldInterface $field, array $values): mixed
    {
        $default = property_exists($field, 'default') ? $field->default : null;
        return in_array($default, $values, true) ? $default : $values[0];
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
        $combinations = $plan['combinations'];

        $variants = [];
        $filledIn = [];
        foreach ($combinations as $i => $combination) {
            foreach ($fields as $field) {
                $variant = $combination[$field->handle] ?? $plan['fixed'][$field->handle] ?? ContentbuilderShowcase::dimensionValues($field)[0];
                $variants[$i][$field->handle] = $variant;
                if ($variant === true || (is_int($variant) && $variant > 0 && ContentbuilderShowcase::isCountField($field))) {
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
                $nth = (int)array_search($i, $filled, true);
                $value = $this->fieldValue($field, $variants[$i][$field->handle], $blockType->handle, $page, $full, $long, $nth);
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
     * The parent page links to every block page, see overviewBlock().
     */
    private function fillParentPage(Entry $parent, Matrix $field, array $pages): void
    {
        $parentContent = $this->contentData['parent'] ?? [];
        $values = [self::INTRO_FIELD_HANDLE => $parentContent['intro'] ?? null];
        $block = $this->overviewBlock($field, 'Blocks', $pages);
        if ($block) {
            $values[self::FIELD_HANDLE] = ['new1' => $block];
        }

        $this->saveOnAllSites($parent, $values, $parent->title, count($pages) . ' block pages linked');
    }

    /**
     * A block linking to the given pages: one with an Entries field (e.g. "Overview", shown as cards) when there is one,
     * otherwise a list of links in the first block with a rich text field. With `$showTitle`, the title is shown above it (in its blockTitle field).
     *
     * @param Entry[] $pages
     */
    private function overviewBlock(Matrix $field, string $title, array $pages, bool $showTitle = false): ?array
    {
        $titleValue = $showTitle ? ['blockTitle' => $title] : [];
        foreach ($field->getEntryTypes() as $blockType) {
            foreach ($blockType->getFieldLayout()->getCustomFields() as $blockField) {
                if ($blockField instanceof EntriesField) {
                    return ['type' => $blockType->handle, 'enabled' => true, 'title' => $title, 'fields' => $titleValue + [$blockField->handle => array_map(fn(Entry $page) => $page->id, $pages)]];
                }
            }
        }

        foreach ($field->getEntryTypes() as $blockType) {
            foreach ($blockType->getFieldLayout()->getCustomFields() as $blockField) {
                if ($blockField::class === self::CKEDITOR_FIELD_TYPE) {
                    $links = array_map(fn(Entry $page) => '<li><a href="{entry:' . $page->id . ':url||' . $page->getUrl() . '}">' . htmlspecialchars($page->title) . '</a></li>', $pages);
                    return ['type' => $blockType->handle, 'enabled' => true, 'title' => $title, 'fields' => $titleValue + [$blockField->handle => '<ul>' . implode('', $links) . '</ul>']];
                }
            }
        }

        $this->warnings[] = 'No block with an Entries or rich text field found to link the showcase pages from their parent page.';
        return null;
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

    // Content rows
    // =========================================================================

    /**
     * The content row showcase, a page tree of its own under the "gridbuilder" page (ContentbuilderShowcase::gridParentSlug()):
     *  - level 1: the parent page, with cards to every column type, the "Layouts" page and the "2/3 page";
     *  - level 2: a page per column type, with cards to its combination with every column type (itself included);
     *  - level 3: a page per combination of two column types, under the type that comes first in the gridCells field
     *    (the "Image" page links to "Text + Image" under "Text"). Two different types: every layout they fit in, both ways round,
     *    and each one first on mobile. The same type twice: the type alone, in every layout it fits in, and its own variants
     *    (filled/empty fields, options) at 1/2 next to the base variant;
     *  - "Layouts": every layout with neutral cells, every vertical alignment and a row with a mobile order;
     *  - "2/3 page": every cell type in the layouts allowed when the content builder is 2/3 wide (see ContentbuilderShowcase::isNarrowPage()).
     * Backgrounds rotate over the rows; on a page with "subject" rows (the type at 1/2), every background shows at least once on one.
     *
     * A row is ['layout' => …, 'cells' => [[cell type handle, [field handle => variant]], …], 'alignment' => …, 'background' => …].
     * A page is ['title' => …, 'slug' => …, 'parent' => page key|null, 'intro' => …] with 'rows' (content rows) or 'links' (overview title => page keys).
     *
     * @return array<string, array> page key => page, parents before their children
     */
    private function planGrid(EntryType $rowType): array
    {
        $content = $this->blockContent(GridBuilder::ROW_TYPE);
        $parentContent = $this->contentData['gridParent'] ?? [];
        $cellTypes = $this->gridCellTypes();
        $handles = array_keys($cellTypes);
        $partner = $content['partner'] ?? 'cellText';
        $visual = $content['visualPartner'] ?? 'cellImage';

        $rowFields = $rowType->getFieldLayout()->getCustomFields();
        $backgroundField = $this->fieldByHandle($rowFields, 'backgroundColor');
        $backgrounds = $backgroundField ? ContentbuilderShowcase::dimensionValues($backgroundField) : [null];
        $alignmentField = $this->fieldByHandle($rowFields, 'gridAlignment');
        $alignments = $alignmentField ? ContentbuilderShowcase::dimensionValues($alignmentField) : [];

        $plans = [self::GRID_ROOT => [
            'title' => $parentContent['title'] ?? 'Gridbuilder',
            'slug' => ContentbuilderShowcase::gridParentSlug(),
            'parent' => null,
            'intro' => $parentContent['intro'] ?? '<p>An overview of every column type of the “Content row” block. Each column type links to its combination with every other column type.</p>',
            'links' => ['Column types' => $handles, 'Layouts' => ['layouts', 'twoThirds']],
        ]];

        foreach ($handles as $i => $handle) {
            // Pairs that can't share a row (contentBuilderGrid.blockedCombinations) get no page; the type's own page always exists
            $partners = array_filter(array_keys($handles), fn(int $j) => $i === $j || GridBuilder::isCombinationAllowed($handle, $handles[$j]));
            $combinations = array_map(fn(int $j) => $this->gridPairKey($handles[min($i, $j)], $handles[max($i, $j)]), array_values($partners));
            $plans[$handle] = [
                'title' => $cellTypes[$handle]->name,
                'slug' => $this->gridTypeSlug($handle),
                'parent' => self::GRID_ROOT,
                'intro' => '<p>The “' . htmlspecialchars($cellTypes[$handle]->name) . '” column next to every column type.</p>',
                'links' => ['Combinations' => $combinations],
            ];
        }

        foreach ($handles as $i => $a) {
            foreach (array_slice($handles, $i) as $b) {
                if ($a !== $b && !GridBuilder::isCombinationAllowed($a, $b)) {
                    continue;
                }
                $nameA = $cellTypes[$a]->name;
                $nameB = $cellTypes[$b]->name;
                $plans[$this->gridPairKey($a, $b)] = [
                    'title' => "{$nameA} + {$nameB}",
                    'slug' => $this->gridTypeSlug($a) . '-' . $this->gridTypeSlug($b),
                    'parent' => $a,
                    'intro' => $a === $b
                        ? "The “{$nameA}” column on its own, next to itself in every layout it fits in, and its variations at 1/2."
                        : "The “{$nameA}” and “{$nameB}” columns in every layout they fit in, both ways round, and each one first on mobile.",
                    'rows' => $this->gridBackgrounds($a === $b ? $this->gridSingleTypeRows($cellTypes[$a]) : $this->gridPairRows($a, $b), $backgrounds),
                ];
            }
        }

        $rows = [];
        foreach ([
            'full' => [$partner],
            'halves' => [$partner, $visual],
            'thirds' => [$partner, $visual, $partner],
            'thirdTwoThirds' => [$visual, $partner],
            'twoThirdsThird' => [$partner, $visual],
        ] as $layout => $cellHandles) {
            if (!$this->gridFits($layout, $cellHandles)) {
                $this->warnings[] = "Layouts page: no \"{$layout}\" row, the partner types (content.json blocks.gridRow) don't fit its columns.";
                continue;
            }
            $rows[] = $this->gridRow($layout, array_map(fn($handle) => [$handle, []], $cellHandles));
        }
        // Mobile order 3 – Auto – 1: stacked, the right column comes first and the middle one fills position 2
        if ($this->gridFits('thirds', [$partner, $visual, $partner])) {
            $rows[] = $this->gridRow('thirds', [
                [$partner, [GridBuilder::MOBILE_ORDER_FIELD => '3']],
                [$visual, []],
                [$partner, [GridBuilder::MOBILE_ORDER_FIELD => '1']],
            ]);
        }
        $baseAlignment = $alignmentField ? $this->baseValue($alignmentField, $alignments) : null;
        foreach ($alignments as $alignment) {
            if ($alignment !== $baseAlignment) {
                $rows[] = $this->gridRow('halves', [[$partner, []], [$visual, []]], ['alignment' => $alignment]);
            }
        }
        $plans['layouts'] = [
            'title' => 'Layouts',
            'slug' => 'layouts',
            'parent' => self::GRID_ROOT,
            'intro' => 'Every layout of the content row, every vertical alignment, and three columns that stack in another order on mobile (right, middle, left).',
            'rows' => $this->gridBackgrounds($rows, $backgrounds),
        ];

        $rows = [];
        foreach ($cellTypes as $handle => $cellType) {
            foreach (GridBuilder::allowedLayouts(true) as $layout) {
                $widths = GridBuilder::columnWidths($layout, true);
                if (!GridBuilder::isTypeAllowed($handle, $widths[0])) {
                    continue;
                }
                $partnerMisfits = array_filter(array_slice($widths, 1), fn(float $width) => !GridBuilder::isTypeAllowed($partner, $width));
                $handles = array_merge([$handle], array_fill(0, count($widths) - 1, $partner));
                if ($partnerMisfits || !GridBuilder::areCombinationsAllowed($handles)) {
                    continue;
                }
                $cells = array_fill(0, count($widths), [$partner, []]);
                $cells[0] = [$handle, []];
                $rows[] = $this->gridRow($layout, $cells);
            }
        }
        $plans['twoThirds'] = [
            'title' => '2/3 page',
            'slug' => ContentbuilderShowcase::GRID_NARROW_SLUG,
            'parent' => self::GRID_ROOT,
            'intro' => 'The content builder at 2/3 of the page width, like a page with a sidebar: only layouts without 1/3 columns, and every column type checked against its width on the page.',
            'rows' => $this->gridBackgrounds($rows, $backgrounds),
        ];

        return $plans;
    }

    /**
     * Two different column types: every layout they fit in, both ways round (in thirds: a, b, a and b, a, b),
     * then each one on the right and first on mobile.
     */
    private function gridPairRows(string $a, string $b): array
    {
        $rows = [];
        foreach (['halves', 'thirdTwoThirds', 'twoThirdsThird', 'thirds'] as $layout) {
            foreach ([[$a, $b], [$b, $a]] as [$first, $second]) {
                $handles = $layout === 'thirds' ? [$first, $second, $first] : [$first, $second];
                if ($this->gridFits($layout, $handles)) {
                    $rows[] = $this->gridRow($layout, array_map(fn($handle) => [$handle, []], $handles));
                }
            }
        }
        foreach ([[$a, $b], [$b, $a]] as [$left, $right]) {
            $layout = $this->gridFirstFit(['halves', 'thirdTwoThirds', 'twoThirdsThird'], [$left, $right]);
            if ($layout) {
                $rows[] = $this->gridRow($layout, [[$left, []], [$right, [GridBuilder::MOBILE_ORDER_FIELD => '1']]]);
            }
        }
        return $rows;
    }

    /**
     * One column type: on its own, next to itself in every layout it fits in, its own variants at 1/2 next to the base variant,
     * and the right one first on mobile.
     */
    private function gridSingleTypeRows(EntryType $cellType): array
    {
        $handle = $cellType->handle;
        // On its own only when it may be full width (contentBuilderGrid.maxWidthPerType)
        $rows = $this->gridFits('full', [$handle]) ? [$this->gridRow('full', [[$handle, []]])] : [];
        foreach (['halves', 'thirds', 'thirdTwoThirds', 'twoThirdsThird'] as $layout) {
            $handles = array_fill(0, count(GridBuilder::LAYOUTS[$layout]), $handle);
            if ($this->gridFits($layout, $handles)) {
                $rows[] = $this->gridRow($layout, array_map(fn($handle) => [$handle, []], $handles), ['subject' => $layout === 'halves']);
            }
        }

        if (!GridBuilder::isCombinationAllowed($handle, $handle)) {
            // Not next to itself (contentBuilderGrid.blockedCombinations): its variants on their own, if it may be full width
            if ($this->gridFits('full', [$handle])) {
                foreach (array_slice($this->gridCellVariants($cellType), 1) as $variant) {
                    $rows[] = $this->gridRow('full', [[$handle, $variant]]);
                }
            }
            return $rows;
        }

        $layout = $this->gridFirstFit(['halves', 'thirdTwoThirds', 'twoThirdsThird'], [$handle, $handle]);
        if (!$layout) {
            return $rows;
        }
        foreach (array_slice($this->gridCellVariants($cellType), 1) as $variant) {
            $rows[] = $this->gridRow($layout, [[$handle, $variant], [$handle, []]], ['subject' => $layout === 'halves']);
        }
        $rows[] = $this->gridRow($layout, [[$handle, []], [$handle, [GridBuilder::MOBILE_ORDER_FIELD => '1']]]);
        return $rows;
    }

    private function gridRow(string $layout, array $cells, array $extra = []): array
    {
        return $extra + [
            'layout' => $layout,
            'cells' => $cells,
            'alignment' => null,
            'background' => null,
            'subject' => false,
        ];
    }

    /**
     * Whether these column types (left to right) are all allowed in their column of the layout, and in the same row.
     */
    private function gridFits(string $layout, array $handles): bool
    {
        if (!GridBuilder::areCombinationsAllowed(array_slice($handles, 0, count(GridBuilder::LAYOUTS[$layout])))) {
            return false;
        }
        foreach (GridBuilder::LAYOUTS[$layout] as $i => $width) {
            if (!isset($handles[$i]) || !GridBuilder::isTypeAllowed($handles[$i], $width)) {
                return false;
            }
        }
        return true;
    }

    private function gridFirstFit(array $layouts, array $handles): ?string
    {
        foreach ($layouts as $layout) {
            if ($this->gridFits($layout, $handles)) {
                return $layout;
            }
        }
        return null;
    }

    /**
     * Variants of a cell's own fields (filled/empty, options, item counts), the base variant (all filled, default options) first.
     * Variants with every field empty are skipped; pin fields with blocks.<cell type>.fixed in content.json.
     *
     * @return array<array<string, mixed>>
     */
    private function gridCellVariants(EntryType $cellType): array
    {
        $fixed = $this->blockContent($cellType->handle)['fixed'] ?? [];
        $dimensions = [];
        $base = [];
        // A required field (always filled) means the cell is never empty
        $hasRequiredContent = false;
        foreach ($cellType->getFieldLayout()->getCustomFields() as $field) {
            // The mobile order gets a row of its own instead of multiplying every variant
            if ($field->handle === GridBuilder::MOBILE_ORDER_FIELD) {
                continue;
            }
            $values = array_key_exists($field->handle, $fixed) ? [$fixed[$field->handle]] : ContentbuilderShowcase::dimensionValues($field);
            if (count($values) > 1) {
                $dimensions[$field->handle] = $values;
                $base[$field->handle] = $this->baseValue($field, $values);
            } elseif ($values !== [false]) {
                $hasRequiredContent = true;
            }
        }

        $variants = [$base];
        foreach ($this->combinations($dimensions) as $variant) {
            $isEmpty = !$hasRequiredContent && !array_filter($variant, fn($value) => !in_array($value, [false, 0], true));
            if ($variant !== $base && !$isEmpty) {
                $variants[] = $variant;
            }
        }
        return $variants;
    }

    /**
     * Rotates the backgrounds over the rows, and makes sure every background shows at least once on a "subject" row (the cell at 1/2).
     */
    private function gridBackgrounds(array $rows, array $backgrounds): array
    {
        foreach ($rows as $i => &$row) {
            $row['background'] = $backgrounds[$i % count($backgrounds)];
        }
        unset($row);

        $subjectRows = array_values(array_filter($rows, fn(array $row) => $row['subject']));
        if ($subjectRows) {
            foreach (array_diff($backgrounds, array_column($subjectRows, 'background')) as $background) {
                $rows[] = ['background' => $background] + $subjectRows[0];
            }
        }
        return $rows;
    }

    private function fillGridPage(Entry $page, array $plan): void
    {
        $cellTypes = $this->gridCellTypes();
        $seen = [];
        $blocks = [];
        foreach ($plan['rows'] as $i => $row) {
            $cells = [];
            foreach ($row['cells'] as $j => [$handle, $variant]) {
                if (!isset($cellTypes[$handle])) {
                    $this->warnings[] = "Cell type \"{$handle}\" (content.json blocks.gridRow) is not available in the grid.";
                    continue;
                }
                // Per cell type on this page: the first instance shows every rich text feature, the second one gets a long title
                $nth = $seen[$handle] = ($seen[$handle] ?? -1) + 1;
                $cells['new' . ($j + 1)] = $this->gridCellBlock($cellTypes[$handle], $variant, $page, $nth);
            }

            $fields = array_filter([
                GridBuilder::LAYOUT_FIELD => $row['layout'],
                'gridAlignment' => $row['alignment'],
                'backgroundColor' => $row['background'],
            ], fn($value) => $value !== null) + [GridBuilder::CELLS_FIELD => $cells];

            $blocks['new' . ($i + 1)] = ['type' => GridBuilder::ROW_TYPE, 'enabled' => true, 'fields' => $fields];
        }

        $this->saveOnAllSites($page, [
            self::FIELD_HANDLE => $blocks,
            self::INTRO_FIELD_HANDLE => '<p>' . count($blocks) . ' rows. ' . htmlspecialchars($plan['intro']) . '</p>',
        ], $plan['title'], count($blocks) . ' rows');
    }

    private function gridCellBlock(EntryType $cellType, array $variant, Entry $page, int $nth): array
    {
        $values = [];
        foreach ($cellType->getFieldLayout()->getCustomFields() as $field) {
            // "Auto" unless the row sets it (the dropdown has no default value to fall back on)
            if ($field->handle === GridBuilder::MOBILE_ORDER_FIELD && !array_key_exists($field->handle, $variant)) {
                continue;
            }
            $fieldVariant = array_key_exists($field->handle, $variant)
                ? $variant[$field->handle]
                : $this->baseValue($field, ContentbuilderShowcase::dimensionValues($field));
            $value = $this->fieldValue($field, $fieldVariant, $cellType->handle, $page, $nth === 0, $nth === 1, $nth);
            if ($value !== null) {
                $values[$field->handle] = $value;
            }
        }
        return ['type' => $cellType->handle, 'enabled' => true, 'fields' => $values];
    }

    /**
     * @return array<string, EntryType> cell type handle => entry type, with the name it has in the grid
     */
    private function gridCellTypes(): array
    {
        $field = Craft::$app->getFields()->getFieldByHandle(GridBuilder::CELLS_FIELD);
        $cellTypes = [];
        foreach ($field instanceof Matrix ? $field->getEntryTypes() : [] as $entryType) {
            $cellTypes[$entryType->handle] = $entryType;
        }
        return $cellTypes;
    }

    private function gridPairKey(string $a, string $b): string
    {
        return "{$a}+{$b}";
    }

    /** E.g. cellText → text */
    private function gridTypeSlug(string $cellTypeHandle): string
    {
        return $this->pageSlug((string)preg_replace('/^cell/', '', $cellTypeHandle));
    }

    /**
     * Finds or creates every grid showcase page (the parent page first, then the pages below it).
     *
     * @return array<string, Entry> page key => page
     */
    private function ensureGridPages(Section $section, EntryType $pageType, ?User $author, array $plans): array
    {
        $pages = [];
        foreach ($plans as $key => $plan) {
            if ($plan['parent'] === null) {
                $page = ContentbuilderShowcase::findGridParentPage()
                    ?? $this->createPage($section, $pageType, $author, $plan['title'], $plan['slug']);
            } else {
                $parent = $pages[$plan['parent']] ?? null;
                $page = $parent
                    ? ($this->findChildPage($parent, $plan['slug']) ?? $this->createPage($section, $pageType, $author, $plan['title'], $plan['slug'], $parent))
                    : null;
            }
            if (!$page && $plan['parent'] === null) {
                return [];
            }
            if ($page) {
                $pages[$key] = $page;
            }
        }
        return $pages;
    }

    /**
     * A grid showcase page that links to other grid showcase pages: an overview block per group of links.
     *
     * @param array<string, Entry> $gridPages
     */
    private function fillOverviewPage(Entry $page, Matrix $field, array $plan, array $gridPages): void
    {
        $blocks = [];
        $count = 0;
        foreach ($plan['links'] as $title => $keys) {
            $linked = array_values(array_filter(array_map(fn(string $key) => $gridPages[$key] ?? null, $keys)));
            $block = $linked ? $this->overviewBlock($field, $title, $linked, true) : null;
            if ($block) {
                $blocks['new' . (count($blocks) + 1)] = $block;
                $count += count($linked);
            }
        }

        $this->saveOnAllSites($page, [
            self::FIELD_HANDLE => $blocks,
            self::INTRO_FIELD_HANDLE => $plan['intro'],
        ], $plan['title'], $count . ' pages linked');
    }

    /**
     * Removes grid showcase pages that are no longer planned (a column type was removed or renamed), deepest first.
     *
     * @param array<string, Entry> $gridPages
     */
    private function removeStaleGridPages(Entry $root, array $gridPages): void
    {
        $ids = array_map(fn(Entry $page) => $page->id, $gridPages);
        $descendants = Entry::find()->section(ContentbuilderShowcase::SECTION_HANDLE)->descendantOf($root->id)->id(array_merge(['not'], $ids))->status(null)->all();
        foreach (array_reverse($descendants) as $page) {
            Craft::$app->getElements()->deleteElement($page);
            $this->stdout("✓ Removed \"{$page->title}\" (no longer part of the grid showcase)" . PHP_EOL, Console::FG_YELLOW);
        }
    }

    // Field values
    // =========================================================================

    /**
     * Returns the value to store for a field. `$variant` is a literal option value, or true/false for filled/empty.
     * Content is looked up in content.json: blocks.<block>.fields.<field> → fields.<field> → a fallback per field type.
     * Extend `fallbackValue()` / `normalizeContent()` when blocks get new field types.
     */
    private function fieldValue(FieldInterface $field, mixed $variant, string $blockHandle, Entry $page, bool $full = false, bool $long = false, int $nth = 0): mixed
    {
        if ($field instanceof Lightswitch) {
            return (bool)$variant;
        }
        if (ContentbuilderShowcase::isCountMatrix($field) && is_int($variant)) {
            // Item count variant: the first N items from content.json, padded with fallback items
            $items = array_slice(array_values((array)($this->contentFor($blockHandle, $field->handle) ?? [])), 0, $variant);
            $items = array_pad($items, $variant, []);
            return $this->nestedEntries($field, $items, $page, $blockHandle, $full, $long);
        }
        if ($field instanceof EntriesField && is_int($variant) && ContentbuilderShowcase::isCountField($field)) {
            // Item count variant: the first N related entries
            $content = $this->contentFor($blockHandle, $field->handle);
            $ids = $content === null ? $this->fallbackValue($field, $page) : $this->normalizeContent($field, $content, $page, $blockHandle);
            if (count($ids) < $variant) {
                $this->warnings[] = "Only " . count($ids) . " of {$variant} entries available for {$blockHandle}.{$field->handle}.";
            }
            return array_slice($ids, 0, $variant);
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

        return $this->normalizeContent($field, $content, $page, $blockHandle, $full, $long, $nth);
    }

    private function normalizeContent(FieldInterface $field, mixed $content, Entry $page, string $blockHandle, bool $full = false, bool $long = false, int $nth = 0): mixed
    {
        if ($field::class === self::CKEDITOR_FIELD_TYPE) {
            // A list of texts is cycled over the filled instances
            if (is_array($content) && array_is_list($content)) {
                $content = $content[$nth % count($content)];
            }
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
            // A list of link sets ([[link, …], [link, …]]) is cycled over the filled instances
            $content = (array)$content;
            if (is_array($content[0] ?? null) && array_is_list($content[0])) {
                $content = $content[$nth % count($content)];
            }
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

    private function findChildPage(Entry $parent, string $slug): ?Entry
    {
        // By ID, so Craft reads the parent's current position in the structure: creating a page moves the pages after it
        return Entry::find()->section(ContentbuilderShowcase::SECTION_HANDLE)->descendantOf($parent->id)->descendantDist(1)->slug($slug)->status(null)->one();
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
        $stale = Entry::find()->section(ContentbuilderShowcase::SECTION_HANDLE)->descendantOf($parent->id)->descendantDist(1)->slug(array_merge(['not'], $slugs))->status(null)->all();
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
            $sets = [];
            foreach ([$plan['main'], ...$plan['groups']] as $set) {
                $dims = [];
                foreach ($set as $fieldHandle => $values) {
                    $field = $this->fieldByHandle($fields, $fieldHandle);
                    $dims[] = $fieldHandle . '[' . implode('|', array_map(fn($value) => ContentbuilderShowcase::formatValue($field, $value), $values)) . ']';
                }
                $sets[] = implode(' × ', $dims);
            }
            $this->stdout(implode(' + ', array_filter($sets)) . PHP_EOL);
            if ($plan['placeholders']) {
                $this->stdout('  ↳ placeholder content (not in content.json): ' . implode(', ', $plan['placeholders']) . PHP_EOL, Console::FG_GREY);
            }
            if ($plan['tooLarge']) {
                $this->stdout("  ↳ more than --max={$this->max}: skipped. Pin dimensions with blocks.{$handle}.fixed in content.json or raise --max." . PHP_EOL, Console::FG_RED);
            }
        }
        $this->stdout(PHP_EOL);
    }

    private function printGridPlan(array $gridPlans): void
    {
        foreach ($gridPlans as $key => $plan) {
            if (isset($plan['links'])) {
                $this->stdout(str_pad("{$plan['title']} ({$key})", 46) . count(array_merge(...array_values($plan['links']))) . ' pages linked' . PHP_EOL, Console::FG_CYAN);
                continue;
            }
            $layouts = array_unique(array_column($plan['rows'], 'layout'));
            $this->stdout(str_pad("  {$plan['title']} ({$key})", 46) . str_pad(count($plan['rows']) . ' rows', 16), Console::FG_CYAN);
            $this->stdout(implode(', ', $layouts) . PHP_EOL);
        }
        if ($gridPlans) {
            $this->stdout(PHP_EOL);
        }
    }

    private function printWarnings(): void
    {
        foreach (array_unique($this->warnings) as $warning) {
            $this->stdout('! ' . $warning . PHP_EOL, Console::FG_YELLOW);
        }
    }
}
