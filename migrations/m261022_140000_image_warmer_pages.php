<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\db\Table;

/**
 * The image warmer's record of pages (modules/statik/src/helpers/ImageWarmer.php): per warmed URL the element cache tags its
 * render depended on, so a change to one of those elements warms the pages that show it.
 */
class m261022_140000_image_warmer_pages extends Migration
{
    public const PAGES = '{{%statik_warmpages}}';
    public const TAGS = '{{%statik_warmtags}}';

    public function safeUp(): bool
    {
        if (!$this->db->tableExists(self::PAGES)) {
            $this->createTable(self::PAGES, [
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
            $this->createIndex(null, self::PAGES, ['urlHash'], true);
            $this->addForeignKey(null, self::PAGES, ['siteId'], Table::SITES, ['id'], 'CASCADE');
        }

        if (!$this->db->tableExists(self::TAGS)) {
            $this->createTable(self::TAGS, [
                'pageId' => $this->integer()->notNull(),
                'tag' => $this->string(255)->notNull(),
            ]);
            $this->addPrimaryKey(null, self::TAGS, ['pageId', 'tag']);
            $this->createIndex(null, self::TAGS, ['tag']);
            $this->addForeignKey(null, self::TAGS, ['pageId'], self::PAGES, ['id'], 'CASCADE');
        }

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists(self::TAGS);
        $this->dropTableIfExists(self::PAGES);

        return true;
    }
}
