'use strict';

module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            './js/jquery.min.js',
            './js/general-tools.js',
            './js/project-page-functions.js',
            './test/spec/*.js'
        ],

        // coverage reporter generates the coverage
        reporters: ['coverage'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            './js/general-tools.js': 'coverage',
            './js/project-page-functions.js': 'coverage',
            './js/application.js': 'coverage'
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    })
};
