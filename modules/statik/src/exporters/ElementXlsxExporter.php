<?php

namespace modules\statik\exporters;

use Craft;
use craft\base\EagerLoadingFieldInterface;
use craft\base\ElementExporter;
use craft\base\ElementExporterInterface;
use craft\base\ElementInterface;
use craft\elements\db\ElementQuery;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Db;
use craft\helpers\Json;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;

/**
 * Expanded represents an "Expanded" element exporter.
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since 3.4.0
 */
class ElementXlsxExporter extends ElementExporter implements ElementExporterInterface
{
    /**
     * @inheritdoc
     */
    public static function displayName(): string
    {
        return Craft::t('app', 'Excel exporter');
    }

    public static function isFormattable(): bool
    {
        return false;
    }

    public function getFilename(): string
    {
        /** @var ElementInterface $elementType */
        $elementType = $this->elementType;
        $typeName = $elementType::pluralLowerDisplayName();
        return "$typeName.xls";
    }

    /**
     * @inheritdoc
     */
    public function export(ElementQueryInterface $query): mixed
    {
        try {
            // Eager-load as much as we can
            $eagerLoadableFields = [];
            foreach (Craft::$app->getFields()->getAllFields() as $field) {
                if ($field instanceof EagerLoadingFieldInterface) {
                    $eagerLoadableFields[] = [
                        'path' => $field->handle,
                        'criteria' => [
                            'status' => null,
                        ],
                    ];
                }
            }

            $data = [];

            /** @var ElementQuery $query */
            $query->with($eagerLoadableFields);

            foreach (Db::each($query) as $element) {
                /** @var ElementInterface $element */
                // Get the basic array representation excluding custom fields
                $attributes = array_flip($element->attributes());
                if (($fieldLayout = $element->getFieldLayout()) !== null) {
                    foreach ($fieldLayout->getCustomFields() as $field) {
                        unset($attributes[$field->handle]);
                    }
                }
                $elementArr = $element->toArray(array_keys($attributes));
                if ($fieldLayout !== null) {
                    foreach ($fieldLayout->getCustomFields() as $field) {
                        $value = $element->getFieldValue($field->handle);
                        $elementArr[$field->handle] = $field->serializeValue($value, $element);
                    }
                }
                $data[] = $elementArr;
            }


            $rows = array_map(function($row) {
                $row = array_map(function($item) {
                    if (is_array($item)) {
                        return Json::encode($item);
                    }
                    return $item;
                }, $row);
                return $row;
            }, $data);

            array_unshift($rows, array_keys($data[0]));

            try {
                ob_end_clean();
            } catch (\Throwable $e) {
            }

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->fromArray($rows);
            $writer = new Xls($spreadsheet);

            $path = Craft::$app->getPath()->getTempPath() . '/' . $this->getFilename();
            $writer->save($path);

            Craft::$app->getResponse()->headers->add('Content-Description', 'File Transfer');
            Craft::$app->getResponse()->headers->add('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            Craft::$app->getResponse()->headers->add('Content-Disposition', 'attachment; filename=' . $this->getFilename());
            Craft::$app->getResponse()->headers->add('Content-Transfer-Encoding', 'binary');
            Craft::$app->getResponse()->headers->add('Connection', 'Keep-Alive');
            Craft::$app->getResponse()->headers->add('Expires', 0);
            Craft::$app->getResponse()->headers->add('Cache-Control', 'must-revalidate, post-check=0, pre-check=0');
            Craft::$app->getResponse()->headers->add('Pragma', 'public');
            return file_get_contents($path);
        } catch (\Throwable $e) {
            Craft::error(Craft::t('app', '{message} {file}:{line}', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]));
            return true;
        }
    }
}
