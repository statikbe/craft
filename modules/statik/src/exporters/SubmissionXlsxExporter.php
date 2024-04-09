<?php

namespace modules\statik\exporters;

use Craft;
use craft\base\EagerLoadingFieldInterface;
use craft\base\ElementExporter;
use craft\base\ElementExporterInterface;
use craft\elements\db\ElementQuery;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Json;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use verbb\formie\Formie;

/**
 * Expanded represents an "Expanded" element exporter.
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since 3.4.0
 */
class SubmissionXlsxExporter extends ElementExporter implements ElementExporterInterface
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
        return "submissions.xls";
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
                if ($field instanceof EagerLoadingFieldInterface && strpos($field->context, 'formie') !== false) {
                    $eagerLoadableFields[] = $field->handle;
                }
            }

            $data = [];

            $attributes = [
                'id' => Craft::t('site', 'ID'),
                'formId' => Craft::t('site', 'Form ID'),
                'userId' => Craft::t('site', 'User ID'),
                'ipAddress' => Craft::t('site', 'IP Address'),
                'isIncomplete' => Craft::t('site', 'Is Incomplete?'),
                'isSpam' => Craft::t('site', 'Is Spam?'),
                'spamReason' => Craft::t('site', 'Spam Reason'),
                'title' => Craft::t('site', 'Title'),
                'dateCreated' => Craft::t('site', 'Date Created'),
                'dateUpdated' => Craft::t('site', 'Date Updated'),
                'dateDeleted' => Craft::t('site', 'Date Deleted'),
                'trashed' => Craft::t('site', 'Trashed'),
                'status' => Craft::t('site', 'Status'),
            ];

            /** @var ElementQuery $query */
            $query->with($eagerLoadableFields);

            foreach ($query->each() as $element) {
                // Fetch the attributes for the element
                $values = $element->toArray(array_keys($attributes));

                // Convert values to strings
                $values = array_map(function ($item) {
                    return (string)$item;
                }, $values);

                $row = array_combine(array_values($attributes), $values);

                // Fetch the custom field content, already prepped
                $fieldValues = $element->getValuesForExport();

                $data[] = array_merge($row, $fieldValues);
            }

            // Normalise the columns. Due to repeaters/table fields, some rows might not have the correct columns.
            // We need to have all rows have the same column definitions.
            // First, find the row with the largest columns to use as our template for all other rows
            $counts = array_map('count', $data);
            $key = array_flip($counts)[max($counts)];
            $largestRow = $data[$key];

            // Now we have the largest row in columns, normalise all other rows, filling in blanks
            $keys = array_keys($largestRow);
            $template = array_fill_keys($keys, '');

            $exportData = array_map(function ($item) use ($template) {
                return array_merge($template, $item);
            }, $data);


            $rows = array_map(function ($row) {
                $row = array_map(function($item) {
                    if(is_array($item)) {
                        return Json::encode($item);
                    }
                    return $item;
                }, $row);
                return $row;
            }, $data);

            array_unshift($rows, array_keys($exportData[0]));

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
            Formie::log(Craft::t('app', '{message} {file}:{line}', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]));
        }

    }
}