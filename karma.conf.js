// karma.conf.js
module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            './js/jquery.min.js',
            './js/general-tools.js',
            './test/spec/*.js'
        ]
    })
}
