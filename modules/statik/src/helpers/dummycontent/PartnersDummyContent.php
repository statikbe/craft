<?php

namespace modules\statik\helpers\dummycontent;

use Craft;
use craft\elements\Asset;
use craft\elements\Entry;
use craft\helpers\FileHelper;
use craft\helpers\StringHelper;

/**
 * Dummy partners: a name, a logo and mostly a website. The logos are generated SVGs in five proportions (horizontal, stacked,
 * square badge, portrait, text only; see wordmark()), saved as dummy-logo-<name>.svg in the logo field's upload volume. Earlier
 * dummy logos are replaced on every run. Names and colours come from the
 * "partners" key in config/dummy-content/content.json. Partners have no URL; the dummy- slug only marks them for cleanup.
 */
class PartnersDummyContent extends DummyContentType
{
    public function key(): string
    {
        return 'partners';
    }

    public function label(): string
    {
        return 'partners';
    }

    public function sectionHandle(): string
    {
        return 'partners';
    }

    public function fill(Entry $entry, int $index, array $categoryIds): void
    {
        $name = $this->title('names', $index);
        $entry->title = $name;
        $entry->slug = self::slug($name);
        $entry->postDate = $this->pastDate($index);

        $logo = $this->logo($name, (string)($this->pick('colors', $index) ?? '#1f6feb'), $index);
        $website = (string)($this->pick('websites', $index) ?? '');
        $entry->setFieldValues([
            'logo' => $logo ? [$logo->id] : [],
            'website' => $website !== '' ? ['type' => 'url', 'value' => $website] : null,
        ]);
    }

    /**
     * The logo asset for a partner: an existing dummy logo with this name, or a new SVG wordmark (shape + name).
     */
    private function logo(string $name, string $color, int $index): ?Asset
    {
        $field = Craft::$app->getFields()->getFieldByHandle('logo');
        $volumeUid = str_replace('volume:', '', (string)($field->defaultUploadLocationSource ?? ''));
        $volume = $volumeUid ? Craft::$app->getVolumes()->getVolumeByUid($volumeUid) : null;
        if (!$volume) {
            return null;
        }
        $filename = 'dummy-logo-' . StringHelper::slugify($name) . '.svg';
        // Replace an earlier dummy logo with this name (its shape may have changed)
        foreach (Asset::find()->volumeId($volume->id)->filename($filename)->all() as $existing) {
            Craft::$app->getElements()->deleteElement($existing, true);
        }

        $tempPath = Craft::$app->getPath()->getTempPath() . '/' . $filename;
        FileHelper::writeToFile($tempPath, $this->wordmark($name, $color, $index));
        $asset = new Asset();
        $asset->tempFilePath = $tempPath;
        $asset->setFilename($filename);
        $asset->newFolderId = Craft::$app->getAssets()->getRootFolderByVolumeId($volume->id)->id;
        $asset->setVolumeId($volume->id);
        $asset->avoidFilenameConflicts = true;
        $asset->setScenario(Asset::SCENARIO_CREATE);
        return Craft::$app->getElements()->saveElement($asset) ? $asset : null;
    }

    /**
     * A generated logo in one of five shapes, so a logo wall gets logos of every proportion:
     * 0 horizontal (a shape next to the name), 1 stacked (the shape above the name, about 4:3), 2 a square badge (initials, 1:1),
     * 3 portrait (a shape above the name on two lines, taller than wide), 4 text only (the name in capitals, very wide).
     */
    private function wordmark(string $name, string $color, int $index): string
    {
        $text = htmlspecialchars($name, ENT_XML1);
        $ink = '#1c2420';
        $font = 'font-family="Helvetica, Arial, sans-serif" font-weight="700"';
        $shape = fn(float $cx, float $cy, float $r) => match (intdiv($index, 5) % 3) {
            0 => "<circle cx=\"$cx\" cy=\"$cy\" r=\"$r\" fill=\"$color\"/>",
            1 => '<rect x="' . ($cx - $r) . '" y="' . ($cy - $r) . '" width="' . (2 * $r) . '" height="' . (2 * $r) . '" rx="' . ($r / 2.2) . "\" fill=\"$color\"/>",
            default => '<path d="M' . $cx . ' ' . ($cy - $r) . ' ' . ($cx + $r) . ' ' . $cy . ' ' . $cx . ' ' . ($cy + $r) . ' ' . ($cx - $r) . ' ' . $cy . "z\" fill=\"$color\"/>",
        };

        switch ($index % 5) {
            case 1: // stacked
                $w = max(160, 30 + (int)ceil(mb_strlen($name) * 14));
                return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 $w 120\" width=\"$w\" height=\"120\">" . $shape($w / 2, 40, 28)
                    . "<text x=\"" . ($w / 2) . "\" y=\"104\" text-anchor=\"middle\" $font font-size=\"24\" fill=\"$ink\">$text</text></svg>";
            case 2: // square badge with initials
                $initials = htmlspecialchars(mb_strtoupper(implode('', array_map(fn($w) => mb_substr($w, 0, 1), array_slice(preg_split('/[\s&]+/', $name, -1, PREG_SPLIT_NO_EMPTY), 0, 2)))), ENT_XML1);
                return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 120\" width=\"120\" height=\"120\"><rect width=\"120\" height=\"120\" rx=\"24\" fill=\"$color\"/>"
                    . "<text x=\"60\" y=\"76\" text-anchor=\"middle\" $font font-size=\"46\" fill=\"#ffffff\">$initials</text></svg>";
            case 3: // portrait: the name on two lines under a big shape
                $words = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY);
                // Two lines for a name of several words; one word stays whole
                $lines = count($words) > 1 ? [implode(' ', array_slice($words, 0, (int)ceil(count($words) / 2))), implode(' ', array_slice($words, (int)ceil(count($words) / 2)))] : [$name];
                $w = max(100, 20 + (int)ceil(max(array_map('mb_strlen', $lines)) * 13));
                $tspans = '';
                foreach ($lines as $i => $line) {
                    $tspans .= '<tspan x="' . ($w / 2) . '" dy="' . ($i ? 26 : 0) . '">' . htmlspecialchars($line, ENT_XML1) . '</tspan>';
                }
                return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 $w 170\" width=\"$w\" height=\"170\">" . $shape($w / 2, 52, 40)
                    . "<text y=\"128\" text-anchor=\"middle\" $font font-size=\"22\" fill=\"$ink\">$tspans</text></svg>";
            case 4: // text only, very wide
                $caps = htmlspecialchars(mb_strtoupper($name), ENT_XML1);
                $w = 40 + (int)ceil(mb_strlen($name) * 26);
                return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 $w 48\" width=\"$w\" height=\"48\"><text x=\"20\" y=\"34\" $font font-size=\"26\" letter-spacing=\"6\" fill=\"$color\">$caps</text></svg>";
            default: // horizontal
                $w = 76 + (int)ceil(mb_strlen($name) * 15.5);
                return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 $w 60\" width=\"$w\" height=\"60\">" . $shape(30, 30, 22)
                    . "<text x=\"66\" y=\"40\" $font font-size=\"28\" fill=\"$ink\">$text</text></svg>";
        }
    }
}
