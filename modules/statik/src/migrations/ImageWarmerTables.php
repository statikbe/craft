<?php

namespace modules\statik\migrations;

use craft\db\Migration;
use craft\db\Table;
use modules\statik\helpers\ImageWarmer;

/**
 * The image warmer's record of pages (modules/statik/src/helpers/ImageWarmer.php): per warmed URL the element cache tags its
 * render depended on, so a change to one of those elements warms the pages that show it.
 *
 * A module has no install migration and `craft install` doesn't run content migrations, so ImageWarmer::ensureTables() runs this
 * after the project config is applied (during `craft install`, `craft up`, project-config/apply). The content migration
 * m261022_140000_image_warmer_pages does the same for projects from before. Creates only what's missing.
 */
class ImageWarmerTables extends Migration
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
