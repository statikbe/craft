<?php
/*
 * Config scout.php
 *
 * This file exists only as a template for the Scout settings.
 * It does nothing on its own.
 *
 * Don't edit this file, instead copy it to 'craft/config' as 'scout.php'
 * and make your changes there to override default settings.
 *
 * Once copied to 'craft/config', this file will be multi-environment aware as
 * well, so you can have different settings groups for each environment, just as
 * you do for 'general.php'
 */

return [

    'application_id' => getenv("ALGOLIA_APP_ID"),
    'admin_api_key' => getenv("ALGOLIA_API_KEY"),
    'search_api_key' => getenv("ALGOLIA_SEARCH_KEY"), //optional
    /*
     * Scout listens to numerous Element events to keep them updated in
     * their respective indices. You can disable these and update
     * your indices manually using the commands.
     */
    'sync' => true,

    /*
     * By default Scout handles all indexing in a queued job, you can disable
     * this so the indices are updated as soon as the elements are updated
     */
    'queue' => true,

    /*
     * If queue is enabled, you can override the default time-to-reserve a job.
     * https://www.yiiframework.com/extension/yiisoft/yii2-queue/doc/api/2.0/yii-queue-queue#$ttr-detail
     */
    'ttr' => 300,

    /*
     * If queue is enabled, you can override the default priority for a job.
     * https://www.yiiframework.com/extension/yiisoft/yii2-queue/doc/api/2.0/yii-queue-queue#priority()-detail
     */
    'priority' => 1024,

    /*
     * The connection timeout (in seconds), increase this only if necessary
     */
    'connect_timeout' => 1,

    /*
     * The batch size Scout uses when importing a large amount of elements
     */
    'batch_size' => 1000,

    /*
     * A collection of indices that Scout should sync to, these can be configured
     * by using the \rias\scout\ScoutIndex::create('IndexName') command. Each
     * index should define an ElementType, criteria and a transformer.
     */
    'indices' => [
        // TODO: Change your index name here
        rias\scout\ScoutIndex::create(
            getenv('CRAFT_ENVIRONMENT') !== 'production' ?
                'dev_index_name' :
                'prod_index_name'
        )
            ->elementType(craft\elements\Entry::class)
            ->criteria(function (\craft\elements\db\EntryQuery $query) {
                // TODO: Add your query here
                return $query->section('');
            })
            ->transformer(function ($entry) {
                // TODO: Add your fields here
                return [
                    'title' => $entry->title,
                ];
            }),
    ],
];