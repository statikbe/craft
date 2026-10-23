<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use modules\statik\migrations\ImageWarmerTables;

/**
 * The image warmer's tables, for projects from before ImageWarmer::ensureTables() (which creates them after the project config is
 * applied, also on `craft install`). The schema is in modules\statik\migrations\ImageWarmerTables; it skips existing tables.
 */
class m261022_140000_image_warmer_pages extends Migration
{
    public function safeUp(): bool
    {
        return (new ImageWarmerTables(['db' => $this->db]))->safeUp();
    }

    public function safeDown(): bool
    {
        return (new ImageWarmerTables(['db' => $this->db]))->safeDown();
    }
}
