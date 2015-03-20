// Generated on 2014-03-28 using generator-phaser-official 0.0.8-rc-2
'use strict';
var config = require('./config.json');
var _ = require('underscore');
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      scripts: {
        files: [
            'client/game/**/*.js',
            '!client/game/main.js'
        ],
        options: {
          spawn: false,
          livereload: LIVERELOAD_PORT
        },
        tasks: ['build']
      },
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:9000'
      }
    },
    copy: {
      dist: {
        files: [
          // includes files within path and its sub-directories
          { expand: true, cwd: 'client/', src: ['assets/**'], dest: 'dist/' },
          { expand: true, cwd: 'client/', flatten: true, src: ['game/plugins/*.js'], dest: 'dist/js/plugins/' },
          { expand: true, flatten: true, src: ['bower_components/**/build/*.js','bower_components/socket.io-client/socket.io.js'], dest: 'dist/js/' },
          { expand: true, cwd: 'client/', src: ['css/**'], dest: 'dist/' },
          { expand: true, cwd: 'client/', src: ['index.html'], dest: 'dist/' }
        ]
      }
    },
    browserify: {
      build: {
        src: ['client/game/main.js'],
        dest: 'dist/js/game.js'
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon'],
        limit: 5,
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server/index.js',
        options: {
          nodeArgs: ['--debug'],
          env: {
            PORT: '5455'
          },
          // omit this property if you aren't serving HTML files and
          // don't want to open a browser tab on start
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              // Delay before server listens on port
              setTimeout(function() {
                //require('open')('http://localhost:5455');
              }, 1000);
            });

            // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    }
  });

  grunt.registerTask('build', ['buildBootstrapper', 'browserify','copy']);
  grunt.registerTask('serve', [ 'build', 'connect:livereload',  'concurrent:dev', 'watch']); //'open',
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('prod', ['build', 'copy']);

  grunt.registerTask('buildBootstrapper', 'builds the bootstrapper file correctly', function() {
    var stateFiles = grunt.file.expand('client/game/states/*.js');
    var gameStates = [];
    var statePattern = new RegExp(/(\w+).js$/);
    stateFiles.forEach(function(file) {
      var state = file.match(statePattern)[1];
      if (!!state) {
        gameStates.push({shortName: state, stateName: _.capitalize(state) + 'State'});
      }
    });
    config.gameStates = gameStates;
    console.log(config);
    var bootstrapper = grunt.file.read('templates/_main.js.tpl');
    bootstrapper = grunt.template.process(bootstrapper,{data: config});
    grunt.file.write('client/game/main.js', bootstrapper);
  });
};
