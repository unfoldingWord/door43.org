/***
 * This configures Jasmine to log to console when specs (tests) start and the test results along with stack traces of failures.
 * This allows the spec information to be captured in Karma.
 */

currentSpec = {};
currentSuite = {};
var failedSpecs = [];
var failedSuites = [];

jasmine.getEnv().addReporter({ // set up test Name logging
    jasmineStarted: function(suiteInfo) {
        currentSpec = {};
        currentSuite = {};
        failedSpecs = [];
        failedSuites = [];
        console.log('Running suite with ' + suiteInfo.totalSpecsDefined);
    },

    suiteStarted: function(result) {
        currentSuite = result;
        console.log('STARTING: Suite started: ' + result.description + ' whose full description is: ' + result.fullName);
    },

    specStarted: function(result) {
        currentSpec = result; // make spec info available to current Spec
        var currentSpecName = result.fullName;
        console.log('STARTING: Spec: ' + currentSpecName);
    },

    specDone: function(result) {
        var specName = result.description;
        console.log(result.status.toUpperCase() + ': Spec: ' + specName);
        console.log('Passed expectation count: ' + result.passedExpectations.length);
        for(var i = 0; i < result.failedExpectations.length; i++) {
            console.log('Failure: ' + result.failedExpectations[i].message);
            console.log(result.failedExpectations[i].stack);
        }
        if(result.failedExpectations.length) {
            var suiteName = currentSuite.description;
            failedSpecs.push((suiteName + ": " + specName));
            if(failedSuites.indexOf(suiteName) < 0) {
                failedSuites.push(suiteName);
            }
        }
    },

    suiteDone: function(result) {
        console.log(result.status.toUpperCase() + ': Suite: ' + result.description);
        for(var i = 0; i < result.failedExpectations.length; i++) {
            console.log('AfterAll ' + result.failedExpectations[i].message);
            console.log(result.failedExpectations[i].stack);
        }
    },

    jasmineDone: function(result) {
        if(!failedSpecs.length) {
            console.log('\n\nPASSED: Jasmine finished and all tests passed!');
            return;
        }

        console.log('\n\n#### FAILED ####\nJasmine finished with failed specs:');
        for(var i = 0; i < failedSpecs.length; i++) {
            console.log('Failed Spec ' + (i+1) + ': ' + failedSpecs[i]);
        }

        console.log('Jasmine finished with failed suites:');
        for(i = 0; i < failedSuites.length; i++) {
            console.log('Failed Suite ' + (i+1) + ': ' + failedSuites[i]);
        }
    }
});

