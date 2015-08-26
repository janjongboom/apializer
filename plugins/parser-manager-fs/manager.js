var assert = require("assert");
var fs = require("fs");
var Path = require("path");
var async = require("async");
var architect = require("architect");
var chokidar = require("chokidar");

module.exports = function(options, imports, register) {
  assert(options.bucketPath, "Option 'bucketPath' required");
  assert(fs.existsSync(options.bucketPath), "Option 'bucketPath' is not an existing path");

  options.parserOptions = options.parserOptions || {};
  options.parserOptions.maxRequestSize = options.parserOptions.maxRequestSize || 2 * 1024 * 1024;
  options.parserOptions.allowedHeaders = options.parserOptions.allowedHeaders || ['set-cookie'];

  var pm = new ParserManager(options.bucketPath, options.parserOptions);

  register(null, {
    "parser-manager": pm
  });
};

function ParserManager(folder, parserOptions) {
  var self = this;

  var watcher = chokidar.watch(folder, {
    ignored: /^\./,
    persistent: true
  });

  watcher.on('add', function(path, stat) {
    var depth = Path.relative(folder, path).split(Path.sep).length;
    if (depth === 1 && stat.isDirectory()) { // new module
      self.loadPlugins([path], function(err) {
        if (err) return console.error('Load new module failed', err);

        console.log('Loaded new module', path);
      });
    }
  });

  watcher.on('change', function(path, stat) {
    var depth = Path.relative(folder, path).split(Path.sep);
    if (depth.length === 2 && !stat.isDirectory()) {
      self.reloadPlugin(Path.dirname(path), function(err) {
        if (err) return console.error('Reload module failed', err);

        console.log('Reloaded', Path.dirname(path));
      });
    }
  }).on('unlink', function(path) {
    var depth = Path.relative(folder, path).split(Path.sep);
    if (depth.length === 1) {
      self.unloadPlugin(path, function(err) {
        if (err) return console.error('Unload module failed', err);

        console.log('Unloaded', path);
      });
    }
    else if (depth.length === 2) {
      self.reloadPlugin(Path.dirname(path), function(err) {
        if (err) return console.error('Reload module failed', err);

        console.log('Reloaded', Path.dirname(path));
      });
    }
  }).on('error', function(error) {
    console.error('Watcher error happened', error);
  });

  /**
   * Startup needs to get this service and then pass the architect app
   * to me
   */
  this.init = function(app) {
    var callback = function(err) {
      if (err) {
        return console.error('ParserManager.init failed', err);
      }
    };

    this.app = app;

    // Let's look in our folder what we have there
    fs.readdir(folder, function(err, files) {
      if (err) return callback(err);

      files = files.map(function(f) {
        return Path.join(folder, f);
      });

      async.filter(files, function(f, next) {
        fs.stat(f, function(err, stat) {
          return next(stat && stat.isDirectory());
        });
      }, function(buckets) {
        self.loadPlugins(buckets, callback);
      });
    });
  };


  /**
   * Pass in folderNames as absolute names
   */
  this.loadPlugins = function(folderNames, callback) {
    async.map(folderNames, function(folder, next) {
      // for all foldernames passed in generate definition files
      self.generateDefinition(folder, function(err, def) {
        if (err) return next(err);

        // then with that make plugins for architect
        var name = Path.basename(folder);
        var plugin = {
          packagePath: '../parser-http',
          prefix: '/c/' + name,
          definitions: def
        };

        for (var o in parserOptions) {
          plugin[o] = parserOptions[o];
        }

        return next(null, plugin);
      });
    }, function(err, plugins) {
      if (err) return callback(err);

      // pass the plugins into architect
      architect.resolveConfig(plugins, __dirname, function(err, resolved) {
        if (err) {
          return callback('Resolve config failed ' + err);
        }
        // and load them into the app
        self.app.loadPlugins(resolved, function(err) {
          if (err) {
            return callback('loadPlugins failed ' + err);
          }

          // done!
          callback();
        });
      });
    });
  };

  this.generateDefinition = function(defPath, callback) {
    fs.readdir(defPath, function(err, files) {
      if (err) return callback(err);

      async.map(files, function(f, next) {
        fs.readFile(Path.join(defPath, f), "ascii", next);
      }, callback);
    });
  };

  this.unloadPlugin = function(folder, callback) {
    var plugin = self.app.config.filter(function(c) {
       return Path.join(__dirname, '../parser-http') === c.packagePath &&
          c.prefix === '/c/' + Path.basename(folder);
    })[0];

    if (!plugin) {
      return callback('Could not find plugin ' + folder);
    }

    plugin.destroy();
    callback();
  };

  this.reloadPlugin = function(folder, callback) {
    self.unloadPlugin(folder, function(err) {
      if (err && err.indexOf('Could not find plugin') !== 0)
        return callback(err);

      self.loadPlugins([folder], callback);
    });
  };
}
