var assert = require("assert");
var fs = require("fs");
var path = require("path");
var async = require("async");
var architect = require("architect");

module.exports = function(options, imports, register) {
  assert(options.bucketPath, "Option 'bucketPath' required");
  assert(path.existsSync(options.bucketPath), "Option 'bucketPath' is not an existing path");

  var pm = new ParserManager(options.bucketPath);

  register(null, {
    "parser-manager": pm
  });
};

function ParserManager(folder) {
  var self = this;

  /**
   * Startup needs to get this service and then pass the architect app
   * to me
   */
  this.init = function(app) {
    var callback = function(err) {
      if (err) {
        return console.error('ParserManager.init failed', err);
      }
      console.log('done init');
    };

    this.app = app;

    // Let's look in our folder what we have there
    fs.readdir(folder, function(err, files) {
      if (err) return callback(err);

      files = files.map(function(f) {
        return path.join(folder, f);
      });

      async.filter(files, function(f, next) {
        fs.stat(f, function(err, stat) {
          return next(stat && stat.isDirectory());
        });
      }, function(buckets) {
        self.loadPlugins(buckets, callback);
      });
    });

    // set up a file watcher for that dir as well
    fs.watch(folder, { persistent: false }, self.watcher);
  };

  this.watcher = function(ev, filename) {
    console.log('watcher', ev, filename);
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
        var name = path.basename(folder);
        return next(null, {
          packagePath: '../parser-http',
          prefix: '/c/' + name,
          definitions: def
        });
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
        fs.readFile(path.join(defPath, f), "ascii", next);
      }, callback);
    });
  };
}
