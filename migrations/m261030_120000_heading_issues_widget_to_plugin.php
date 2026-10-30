<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\db\Table;

/**
 * The Heading issues dashboard widget moved from the Statik module to the Headings Checker plugin: point the widgets that
 * were added before to the plugin's class.
 */
class m261030_120000_heading_issues_widget_to_plugin extends Migration
{
    public function safeUp(): bool
    {
        $this->update(Table::WIDGETS, [
            'type' => 'statikbe\headingschecker\widgets\HeadingIssues',
        ], [
            'type' => 'modules\statik\widgets\HeadingIssues',
        ], updateTimestamp: false);
        return true;
    }

    public function safeDown(): bool
    {
        echo "m261030_120000_heading_issues_widget_to_plugin cannot be reverted.\n";
        return false;
    }
}
