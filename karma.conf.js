// karma.conf.js

// if debugging, disable instrumentation for coverage
var sourcePreprocessors = 'coverage';
function isDebug(argument) {
    return argument === '--debug';
}
if (process.argv.some(isDebug)) {
    sourcePreprocessors = [];
};

module.exports = function(config) {
    config.set({
        frameworks: ['jasmine-ajax', 'jasmine'],

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
            './js/general-tools.js': sourcePreprocessors,
            './js/project-page-functions.js': sourcePreprocessors,
            './js/application.js': sourcePreprocessors,
            './js/i18n.js': sourcePreprocessors
        },

        // optionally, configure the reporter
        coverageReporter: {
            // type : 'html', // use this to see the code coverage
            type : 'lcov', // needed by coveralls
            dir : 'coverage/'
        }
    })
};
