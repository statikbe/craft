<?php

namespace Deployer;

require_once 'recipe/common.php';
require_once 'contrib/rsync.php';
require_once 'contrib/cachetool.php';
require_once 'contrib/yarn.php';

// statikbe/deployer-tasks is installed globally in the Bitbucket pipeline image,
// fall back to the project's vendor dir when running dep locally.
function deployerTasksPath(string $file): string
{
    $composerHome = getenv('COMPOSER_HOME') ?: getenv('HOME') . '/.composer';
    foreach ([__DIR__ . '/vendor', $composerHome . '/vendor'] as $vendorDir) {
        $path = "$vendorDir/statikbe/deployer-tasks/$file";
        if (file_exists($path)) {
            return $path;
        }
    }

    throw new \RuntimeException("statikbe/deployer-tasks not found, cannot load $file");
}

// The package's Craft starter (recipe/craft.php) is not used: it deploys with git + composer on the server,
// while we rsync the build from the pipeline.
require_once deployerTasksPath('recipe/tasks/copy-stage-files.php');
require_once deployerTasksPath('recipe/tasks/reload-phpfpm.php');
require_once deployerTasksPath('recipe/tasks/voight.php');

// Config
set('repository', 'git@ssh.bitbucket.org:statikbe/[PROJECT_CODE_HERE].git');
// Combell: enables statik:reload-phpfpm, and uploads run as the web server user so writable can be skipped
set('combell_hosting', true);
set('writable_mode', 'skip');
set('keep_releases', 3);
set('public_path', 'public');
// statik:reload-phpfpm probes the site: config/htaccess-staging lets the probe file through basic auth,
// BASIC_AUTH_USER/BASIC_AUTH_PASSWORD (Bitbucket variables) are only needed for hosts without that exception
set('basic_auth_user', getenv('BASIC_AUTH_USER') ?: '');
set('basic_auth_password', getenv('BASIC_AUTH_PASSWORD') ?: '');
// [Optional] Allocate tty for git clone. Default value is false.
set('git_tty', true);
set('cachetool_args', '--web --web-path=./web --web-url=https://{{http_host}}');
// Shared files/dirs between deploys
set('shared_files', [
    '.env'
]);
set('shared_dirs', [
    'storage',
    'public/files',
    'translations',
]);
// Writable dirs by web server
set('writable_dirs', [
    'storage',
    'storage/appcache',
    'storage/runtime',
    'storage/logs',
    'storage/rebrand',
    'public/cpresources',
    'public/frontend'
]);
// Enable multiplexing
set('ssh_multiplexing', true);

//configure rsync:
set('rsync_src', __DIR__);
set('rsync_dest', '{{release_path}}');
set('rsync', [
    'exclude' => [
        'clint',
        '.git',
        'deploy.php',
        'node_modules'
    ],
    'exclude-file' => false,
    'include' => [],
    'include-file' => false,
    'filter' => [],
    'filter-file' => false,
    'filter-perdir' => false,
    'flags' => 'rlE', // Recursive, copy symlinks as links, preserve executability
    'options' => [
        'delete',          // Delete files that don't exist on sender
        'inplace',         // Update destination files in-place
        'omit-dir-times',  // Avoid setting directory timestamps (faster)
        'no-compress',     // Disable compression for small files
        'no-perms',        // Don't preserve permissions
    ],
    'timeout' => 300,
]);

// Hosts
import('hosts.yml');

desc('Copy the correct robots.txt file for the given stage');
task('statik:copy_robots', function () {
    $robotsFile = get('robots_file');
    if ($robotsFile) {
        run("cp {{release_path}}/config/$robotsFile {{release_path}}/public/robots.txt");
    }
});

desc('Give execute permissions for the Craft console command');
task('craft:set_permissions', function () {
    run('chmod +x {{release_path}}/craft');
})->once();

desc('Craft up');
task('craft:up', function () {
    run('{{release_path}}/craft up');
})->once();

desc('Cache clear');
task('craft:clear_caches', function () {
    run('{{release_path}}/craft clear-caches/all');
})->once();

desc('Voight versioning, production only');
task('statik:versioning', function () {
    onlyOnProduction(function () {
        // voight.sh reads VOIGHT_API_BASE_URL, VOIGHT_API_TOKEN and PROJECT_CODE from the shared .env
        if (!test('grep -q "^VOIGHT_API_TOKEN=." {{deploy_path}}/shared/.env')) {
            warning('Skipping Voight: VOIGHT_API_TOKEN is not set in shared/.env');

            return;
        }

        invoke('statik:voight');
    });
})->once();

desc('Symlink current/public to www');
task('statik:symlink', function () {
    onlyOnProduction(function () {
        // Also repoints an existing www symlink, e.g. one still pointing to a pre-Deployer webroot
        run('if [ ! -e "/data/sites/web/[PROJECT_CODE_HERE]livestatikbe/www" ] || [ -L "/data/sites/web/[PROJECT_CODE_HERE]livestatikbe/www" ]; then ln -sfn subsites/[PROJECT_CODE_HERE].live.statik.be/current/public /data/sites/web/[PROJECT_CODE_HERE]livestatikbe/www; fi');
    });

    run('{{release_path}}/craft statik/setup/install-translation-files');
})->once();

//overwrite the deploy:prepare task, to change the git clone command with rsync:
task('deploy:prepare', [
    'deploy:info',
    'deploy:setup',
    'deploy:lock',
    'deploy:release',
    'rsync',
    'deploy:shared',
    'deploy:writable',
]);

task('deploy', [
    'deploy:prepare',
    'craft:set_permissions',
    'craft:up',
    'craft:clear_caches',
    'statik:copy_htaccess',
    'statik:copy_robots',
    'deploy:publish',
]);

//Adjust standard deployment:
after('deploy:failed', 'deploy:unlock');
after('deploy:symlink', 'statik:reload-phpfpm');
after('deploy', 'statik:symlink');
after('deploy', 'statik:versioning');
after('deploy', 'deploy:success');

function onlyOnProduction(callable $taskLogic)
{
    if (get('stage') === 'production') {
        $taskLogic();
    } else {
        writeln('Skipping task: not in production stage.');
    }
}
