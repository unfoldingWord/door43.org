// karma.conf.js
module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            './js/jquery.min.js',
            './js/bootstrap/bootstrap.min.js',
            './js/underscore.min.js',
            './js/moment.min.js',
            './js/application.js',
            './js/general-tools.js',
            './js/project-page-functions.js',
            './js/i18n.js',
            './test/spec/*.js'
        ],

        // coverage reporter generates the coverage
        reporters: ['coverage', 'coveralls'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            './js/general-tools.js': 'coverage',
            './js/project-page-functions.js': 'coverage',
            './js/application.js': 'coverage',
            './js/i18n.js': 'coverage'
        },

        // optionally, configure the reporter
        coverageReporter: {
            // type : 'html', // use this to see the code coverage
            type : 'lcov', // needed by coveralls
            dir : 'coverage/'
        }
    })
};
