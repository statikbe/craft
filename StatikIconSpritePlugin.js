var path = require('path');
var fs = require('fs');
let ejs = require('ejs');
const { info } = require('console');

/*
 * Credits to https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
 * Create directory recursively and support node < v10.12, from which version fs.mkdir support natively
 * `recursive` option
 */

const plugin = {
  name: 'StatikIconSpritePlugin',
};

var mkdir = function (targetDir) {
  var sep = path.sep;
  var initDir = path.isAbsolute(targetDir) ? sep : '';

  return targetDir.split(sep).reduce(function (parentDir, childDir) {
    var curDir = path.resolve(parentDir, childDir);

    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      // If curDir already exists!
      if (err.code === 'EEXIST') {
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error('EACCES: permission denied, mkdir' + parentDir);
      }

      var caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || (caughtErr && targetDir === curDir)) {
        // Throw if it's just the last created dir.
        throw err;
      }
    }

    return curDir;
  }, initDir);
};

var StatikIconSpritePlugin = (function () {
  function StatikIconSpritePlugin(options) {
    if (typeof options !== 'object') {
      throw new Error('options should be an object!');
    }

    if (options.filename === undefined) {
      throw new Error('filename is required!');
    }

    if (options.template === undefined) {
      throw new Error('template is required!');
    }

    var basename = path.basename(options.filename.twig);
    if (basename === '.' || basename === '..' || basename === '') {
      throw new Error('illegal operation on a directory!');
    }

    var basename = path.basename(options.filename.css);
    if (basename === '.' || basename === '..' || basename === '') {
      throw new Error('illegal operation on a directory!');
    }

    this.options = options;
  }

  StatikIconSpritePlugin.prototype.apply = function (compiler) {
    var options = this.options;
    let iconFound = false;

    function writeTemplate(compilation) {
      for (const [filePath, value] of compilation.assetsInfo.entries()) {
        const regex = new RegExp('icon/sprite.*.svg');
        if (regex.test(filePath)) {
          iconFound = true;
          // Collect the options for underlying `writeFileSync`.
          var optionsForWriteFile = {};
          optionsForWriteFile.encoding = options.encoding || 'utf8';
          optionsForWriteFile.mode = options.mode || 0o666;
          optionsForWriteFile.flag = options.flag || 'w';
          ejs.renderFile(options.template.twig, { filePath: filePath }, options, function (err, str) {
            if (err) {
              console.error(err);
            } else {
              fs.writeFileSync(options.filename.twig, str, optionsForWriteFile);
            }
          });
          ejs.renderFile(options.template.css, { filePath: filePath }, options, function (err, str) {
            if (err) {
              console.error(err);
            } else {
              fs.writeFileSync(options.filename.css, str, optionsForWriteFile);
            }
          });
        }
      }
    }

    compiler.hooks.assetEmitted.tap(
      'Statik Icon Sprite Plugin',
      (file, { content, source, outputPath, compilation, targetPath }) => {
        if (!iconFound) {
          writeTemplate(compilation);
        }
      }
    );

    // compiler.hooks.watchRun.tap('WatchRun', (comp) => {
    //   if (comp.modifiedFiles) {
    //     const changedFiles = Array.from(comp.modifiedFiles, (file) => `\n  ${file}`).join('');
    //     console.log('===============================');
    //     console.log('FILES CHANGED:', comp.modifiedFiles);
    //     console.log('===============================');
    //   }
    // });
    // compiler.hooks.environment.tap('Statik Icon Sprite Plugin', (comp) => {
    //   console.log('WATCHING \n');
    // });
    compiler.hooks.afterCompile.tap('Statik Icon Sprite Plugin', (compilation) => {
      writeTemplate(compilation);
      // console.log('BOOM2', comp.modifiedFiles);
      // console.log('BOOM2', compilation.assetsInfo);
    });
  };

  return StatikIconSpritePlugin;
})();

module.exports = StatikIconSpritePlugin;
