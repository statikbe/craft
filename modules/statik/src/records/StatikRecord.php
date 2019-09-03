<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\records;

use modules\statik\Statik;

use Craft;
use craft\db\ActiveRecord;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikRecord extends ActiveRecord
{
    // Public Static Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%statik_statikrecord}}';
    }
}
