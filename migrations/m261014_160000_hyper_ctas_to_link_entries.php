<?php

namespace craft\contentmigrations;

use Craft;
use craft\base\ElementInterface;
use craft\db\Migration;
use craft\db\Query;
use craft\db\Table;
use craft\elements\Entry;
use craft\fieldlayoutelements\CustomField;
use craft\fields\Link;
use craft\fields\Matrix;
use craft\helpers\ElementHelper;

/**
 * Hyper CTA fields → CTA fields with Link entries: `cta` for one link, `ctas` for more. The new fields took over the handles of
 * the Hyper fields, which are deleted; the migration finds everything by uid.
 *
 * The entry type layouts already have the new fields (project config, applied before content migrations). The Hyper links
 * are still in the stored content under the old layout elements; every owner that has them gets a Link entry per link
 * (Link field + Link Style). Owners that already have CTAs in the new field are left alone, so it can run again.
 */
class m261014_160000_hyper_ctas_to_link_entries extends Migration
{
    /** Hyper layout element uid => the uid of the new CTA field in the same layout */
    private const ELEMENTS = [
        // Hyper cta (one link) → cta with one Link entry
        '875a273b-d0a2-4388-9a08-4106596b2fd2' => self::CTA, // quote
        '460defe0-7444-47e3-8f53-8ffe022800a7' => self::CTA, // textVideo
        '9e4c2aa3-dbf7-44d8-ad27-3c85d255f8b5' => self::CTA, // cellQuote
        // Hyper ctas (max 3 links) → ctas with Link entries
        '19e39354-0b95-4efe-b985-cce67beab385' => self::CTAS, // callToAction
        '123f1b2e-8968-4e21-92e2-f770e960a817' => self::CTAS, // textImage
        'f10f7bbc-a341-46d7-9548-1c3111ff6e01' => self::CTAS, // heroBlock
        'bc328241-4345-4f9d-bc53-be04f4c08e07' => self::CTAS, // faq
        'a17aa904-e550-428b-9065-a2a7a34b411e' => self::CTAS, // embed
        '04fe7c6a-e4d1-47c2-96b7-47f8f0d0a069' => self::CTAS, // textColumnBlock
        '1252a874-7a52-436c-84c9-c3baf58397d6' => self::CTAS, // textTable
        '7c5730c1-513f-4195-826a-fd881eee8c8f' => self::CTAS, // pageWithSidebar (sidebarCtas)
    ];
    private const CTA = '9f8fbc34-dca9-48d6-8571-bd1746f85fd0';
    private const CTAS = 'bafbfbff-4885-4841-85d4-9105c37effee';

    /** Handle of the "Link style" field on the Link entries (ctaFieldLinkLayouts before the code guidelines rename) */
    private const STYLE_FIELD = 'linkStyle';
    private const OLD_STYLE_FIELD = 'ctaFieldLinkLayouts';

    private array $counts = ['owners' => 0, 'links' => 0, 'skipped' => 0, 'staleSites' => 0];

    /**
     * The handle of the Link style field: linkStyle, or the old handle on a project that hasn't applied the renamed project config
     */
    private function styleField(): string
    {
        return Craft::$app->getFields()->getFieldByHandle(self::STYLE_FIELD) ? self::STYLE_FIELD : self::OLD_STYLE_FIELD;
    }

    public function safeUp(): bool
    {
        foreach (self::ELEMENTS as $oldUid => $fieldUid) {
            $rows = (new Query())
                ->select(['elementId', 'siteId', 'content'])
                ->from(Table::ELEMENTS_SITES)
                ->where(['like', 'content', $oldUid])
                ->all();

            foreach ($rows as $row) {
                $links = json_decode((string)$row['content'], true)[$oldUid] ?? null;
                if (is_array($links) && $links) {
                    $this->convert((int)$row['elementId'], (int)$row['siteId'], $fieldUid, $links);
                }
            }
        }

        echo "    > {$this->counts['owners']} owners, {$this->counts['links']} links converted, {$this->counts['skipped']} links skipped, {$this->counts['staleSites']} rows of unsupported sites left alone\n";

        return true;
    }

    public function safeDown(): bool
    {
        echo "m261014_160000_hyper_ctas_to_link_entries cannot be reverted, restore a backup instead.\n";
        return false;
    }

    private function convert(int $elementId, int $siteId, string $fieldUid, array $links): void
    {
        $owner = Entry::find()
            ->id($elementId)
            ->siteId($siteId)
            ->status(null)
            ->drafts(null)
            ->provisionalDrafts(null)
            ->one();

        // Revisions and deleted entries keep their Hyper data
        if (!$owner) {
            return;
        }

        // Leftover content of a site the entry no longer supports
        $supportedSiteIds = array_column(ElementHelper::supportedSitesForElement($owner), 'siteId');
        if (!in_array($siteId, $supportedSiteIds)) {
            $this->counts['staleSites']++;
            return;
        }

        $layoutElement = $this->layoutElement($owner, $fieldUid);
        $field = $layoutElement?->getField();
        if (!$field instanceof Matrix) {
            Craft::warning("Entry {$elementId} (site {$siteId}) has no CTA field {$fieldUid} in its layout.", __METHOD__);
            return;
        }

        $handle = $layoutElement->attribute();
        if ($owner->getFieldValue($handle)->status(null)->count() > 0) {
            return;
        }

        $entryType = $field->getEntryTypes()[0];
        $linkHandle = null;
        foreach ($entryType->getFieldLayout()->getCustomFields() as $nestedField) {
            if ($nestedField instanceof Link) {
                $linkHandle = $nestedField->handle;
                break;
            }
        }
        if (!$linkHandle) {
            Craft::warning("The \"{$entryType->handle}\" entry type has no Link field.", __METHOD__);
            return;
        }

        $entries = [];
        foreach (array_values($links) as $link) {
            $value = $this->linkValue($link, $siteId);
            if ($value === null) {
                $this->counts['skipped']++;
                Craft::warning("Hyper link of entry {$elementId} (site {$siteId}) skipped: " . json_encode($link), __METHOD__);
                continue;
            }
            $entries['new' . (count($entries) + 1)] = [
                'type' => $entryType->handle,
                'enabled' => true,
                'fields' => array_filter([
                    $linkHandle => $value,
                    $this->styleField() => $this->style($link),
                ], fn($fieldValue) => $fieldValue !== null),
            ];
        }
        if ($field->maxEntries) {
            $entries = array_slice($entries, 0, $field->maxEntries, true);
        }
        if (!$entries) {
            return;
        }

        $owner->setFieldValue($handle, $entries);
        if (!Craft::$app->getElements()->saveElement($owner, false, false)) {
            Craft::warning("Could not save entry {$elementId} (site {$siteId}): " . json_encode($owner->getErrors()), __METHOD__);
            return;
        }

        $this->counts['owners']++;
        $this->counts['links'] += count($entries);
    }

    private function layoutElement(ElementInterface $owner, string $fieldUid): ?CustomField
    {
        foreach ($owner->getFieldLayout()?->getTabs() ?? [] as $tab) {
            foreach ($tab->getElements() as $element) {
                if ($element instanceof CustomField && $element->getFieldUid() === $fieldUid) {
                    return $element;
                }
            }
        }
        return null;
    }

    /**
     * A Hyper link as a Link field value, or null for link types without a counterpart.
     */
    private function linkValue(array $link, int $siteId): ?array
    {
        $type = substr(strrchr('\\' . ($link['type'] ?? ''), '\\'), 1);
        $value = $link['linkValue'] ?? null;
        $elementId = is_array($value) ? (int)reset($value) : (int)$value;
        $elementSiteId = (int)($link['linkSiteId'] ?? $siteId);
        $urlSuffix = $link['urlSuffix'] ?? null;

        $result = match ($type) {
            'Url', 'Anchor', 'Custom' => is_string($value) && $value !== '' ? ['type' => 'url', 'value' => $value] : null,
            'Email' => is_string($value) && $value !== '' ? ['type' => 'email', 'value' => $value] : null,
            'Phone' => is_string($value) && $value !== '' ? ['type' => 'tel', 'value' => $value] : null,
            'Entry', 'EntryAnchor' => $elementId ? ['type' => 'entry', 'value' => "{entry:{$elementId}@{$elementSiteId}:url}"] : null,
            'Asset' => $elementId ? ['type' => 'asset', 'value' => "{asset:{$elementId}@{$elementSiteId}:url}"] : null,
            default => null,
        };
        if ($result === null) {
            return null;
        }

        // Our "Entry (with anchor)" link type: the anchor becomes the URL suffix
        if (!empty($link['anchor'])) {
            $urlSuffix = '#' . ltrim((string)$link['anchor'], '#') . ($urlSuffix ?? '');
        }

        return $result + array_filter([
            'label' => $link['linkText'] ?? null,
            'target' => !empty($link['newWindow']) ? '_blank' : null,
            'urlSuffix' => $urlSuffix ?: null,
        ]);
    }

    /**
     * The link style: Hyper kept it in the link's own fields, keyed by layout element uid.
     */
    private function style(array $link): ?string
    {
        foreach ($link['fields'] ?? [] as $fieldValue) {
            if (is_string($fieldValue) && $fieldValue !== '') {
                return $fieldValue;
            }
        }
        return null;
    }
}
