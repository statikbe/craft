<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\db\Table;
use modules\statik\helpers\ImageWarmer;
use modules\statik\migrations\ImageWarmerTables;

/**
 * The image warmer's tables, for projects from before ImageWarmer::ensureTables() (which creates them after the project config is
 * applied, also on `craft install`). The schema is in modules\statik\migrations\ImageWarmerTables; it skips existing tables.
 */
class m261022_140000_image_warmer_pages extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->tableExists(ImageWarmer::PAGES_TABLE)) {
            $this->createTable(ImageWarmer::PAGES_TABLE, [
                'id' => $this->primaryKey(),
                'url' => $this->text()->notNull(),
                // The URL's md5: a unique index on a text column isn't possible in MySQL
                'urlHash' => $this->char(32)->notNull(),
                'siteId' => $this->integer()->notNull(),
                'dateWarmed' => $this->dateTime()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]);
            $this->createIndex(null, ImageWarmer::PAGES_TABLE, ['urlHash'], true);
            $this->addForeignKey(null, ImageWarmer::PAGES_TABLE, ['siteId'], Table::SITES, ['id'], 'CASCADE');
        }

        if (!$this->db->tableExists(ImageWarmer::TAGS_TABLE)) {
            $this->createTable(ImageWarmer::TAGS_TABLE, [
                'pageId' => $this->integer()->notNull(),
                'tag' => $this->string(255)->notNull(),
            ]);
            $this->addPrimaryKey(null, ImageWarmer::TAGS_TABLE, ['pageId', 'tag']);
            $this->createIndex(null, ImageWarmer::TAGS_TABLE, ['tag']);
            $this->addForeignKey(null, ImageWarmer::TAGS_TABLE, ['pageId'], ImageWarmer::PAGES_TABLE, ['id'], 'CASCADE');
        }

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists(ImageWarmer::TAGS_TABLE);
        $this->dropTableIfExists(ImageWarmer::PAGES_TABLE);

        return true;
    }
}
