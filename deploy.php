<?php

namespace Deployer;

require_once 'recipe/common.php';
require_once 'contrib/rsync.php';
require_once 'contrib/cachetool.php';
require_once 'contrib/yarn.php';

// Config
set('repository', 'git@bitbucket.org:statikbe/[PROJECT_CODE_HERE].git');
//change writeable mode to chown because combell does not have acl installed:
set('writable_mode', 'chown');
set('keep_releases', 2);
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
        'cli',
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

desc('Copy the correct .htaccess file for the given stage');
task('statik:copy_htaccess', function () {
    $htaccessFile = get('htaccess_file');
    if ($htaccessFile) {
        run("cp {{release_path}}/config/$htaccessFile {{release_path}}/public/.htaccess");
    }
});

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

desc('Fichenbak versioning');
task('statik:fichenbak_versioning', function () {
    run('if [ -s {{release_path}}/fichenbak-versioning.sh ]; then sh {{release_path}}/fichenbak-versioning.sh; fi');
})->once();

desc('Symlink current/public to www');
task('statik:symlink', function () {
    onlyOnProduction(function () {
        run('if [ ! -L "/data/sites/web/[PROJECT_CODE_HERE]livestatikbe/www" ]; then ln -s subsites/[PROJECT_CODE_HERE].live.statik.be/current/public /data/sites/web/[PROJECT_CODE_HERE]livestatikbe/www; fi');
    });
})->once();

desc('Reload PHP-FPM');
task('statik:reload-phpfpm', function () {
    sleep(3);
    //reload the PHP-FPM caches.
    //Combell has a command to achieve this: reloadPHP.sh
    $tries = 1;
    while ($tries <= 3) {
        writeln('Reload PHP-FPM attempt #'.$tries.'..');
        $output = run('reloadPHP.sh');
        if (str_contains($output, 'OK')) {
            writeln('PHP-FPM reloaded!');
            break;
        }

        if ($tries++ >= 3) {
            throw new \RuntimeException('Failed to reload PHP-fpm. Cannot proceed');
        }

        sleep(1);
    }
});

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
    'statik:fichenbak_versioning',
    'deploy:publish',
]);

//Adjust standard deployment:
after('deploy:failed', 'deploy:unlock');
after('deploy', 'statik:symlink');
after('statik:symlink', 'statik:reload-phpfpm');
after('deploy', 'deploy:success');

function onlyOnProduction(callable $taskLogic)
{
    if (get('stage') === 'production') {
        $taskLogic();
    } else {
        writeln('Skipping task: not in production stage.');
    }
}