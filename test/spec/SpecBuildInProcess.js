
describe('Test Processing of Json files', function () {
    var repo = "ar_eph_text_ulb";
    var user = "dummy_user";
    const startedAt = "2017-06-26T20:57:42Z";
    var build_log_base = {
        commit_id: "39a099622d",
        created_at: startedAt,
        started_at: startedAt,
        errors: [],
        message: "Conversion requested",
        repo_name: repo,
        repo_owner: user,
        source: "https://s3-us-west-2.amazonaws.com/test-tx-webhook-client/preconvert/39a099622d.zip",
        status: "success",
        success: true,
        warnings: []
    };

    beforeEach(function () {
        recent_build_log = null;
        CONVERSION_TIMED_OUT = false;
    });

    describe('Test checkForConversionRequested()', function () {
        it('checkForConversionRequested() conversion requested should call checkConversionStatus', function () {
            // given
            var $conversion_requested = [ true ];
            spyOn(window, 'checkConversionStatus').and.returnValue(false);

            // when
            checkForConversionRequested($conversion_requested);

            // then
            expect(window.checkConversionStatus).toHaveBeenCalled();
        });

        it('checkForConversionRequested() without conversion requested should not call checkConversionStatus', function () {
            // given
            var $conversion_requested = [  ];
            spyOn(window, 'checkConversionStatus').and.returnValue(false);

            // when
            checkForConversionRequested($conversion_requested);

            // then
            expect(window.checkConversionStatus).not.toHaveBeenCalled();
        });
    });

    describe('Test checkConversionStatus()', function () {

        it('checkConversionStatus() status success should reload page', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            mockGetJson(build_log);
            spyOn(window, 'reloadPage').and.returnValue(false);

            // when
            checkConversionStatus();

            // then
            expect(window.reloadPage).toHaveBeenCalled();
            expect(recent_build_log).toEqual(build_log);
        });

        it('checkConversionStatus() status requested should call checkAgainForBuildCompletion', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.status = "requested";
            mockGetJson(build_log);
            spyOn(window, 'checkAgainForBuildCompletion').and.returnValue(false);
            spyOn(window, 'reloadPage').and.returnValue(false);

            // when
            checkConversionStatus();

            // then
            validateCheckAgain(build_log);
        });

        it('checkConversionStatus() status started should call checkAgainForBuildCompletion', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.status = "started";
            mockGetJson(build_log);
            spyOn(window, 'checkAgainForBuildCompletion').and.returnValue(false);
            spyOn(window, 'reloadPage').and.returnValue(false);

            // when
            checkConversionStatus();

            // then
            validateCheckAgain(build_log);
        });

        it('checkConversionStatus() status started should call checkAgainForBuildCompletion', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.status = "started";
            mockGetJson(build_log);
            spyOn(window, 'checkAgainForBuildCompletion').and.returnValue(false);
            spyOn(window, 'reloadPage').and.returnValue(false);

            // when
            checkConversionStatus();

            // then
            validateCheckAgain(build_log);
        });


        it('checkConversionStatus() failed should call checkAgainForBuildCompletion', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.status = "started";
            const fail_spy = jasmine.createSpy().and.callFake(function (fail_func) {
                fail_func();
            });
            spyOn(jQuery, 'getJSON').and.callFake(function (url, func) {
                return {
                    fail: fail_spy // catch chain
                }
            });
            spyOn(window, 'checkAgainForBuildCompletion').and.returnValue(false);
            spyOn(window, 'reloadPage').and.returnValue(false);

            // when
            checkConversionStatus();

            // then
            validateCheckAgain(null);
        });


        //
        // helpers
        //

        function mockGetJson(build_log) {
            spyOn(jQuery, 'getJSON').and.callFake(function (url, func) {
                func(build_log);
                return {
                    fail: jasmine.createSpy().and.returnValue(false) // catch chain
                }
            });
        }

        function validateCheckAgain(build_log) {
            expect(window.reloadPage).not.toHaveBeenCalled();
            expect(window.checkAgainForBuildCompletion).toHaveBeenCalled();
            if(build_log) {
                expect(recent_build_log).toEqual(build_log);
            }
            expect(conversion_start_time).toEqual(new Date(startedAt));
        }
    });

    describe('Test checkAgainForBuildCompletion()', function () {

        it('checkAgainForBuildCompletion() should call setTimeout(checkConversionStatus)', function () {
            // given
            var actualCallback = null;
            spyOn(window, 'setTimeout').and.callFake(function (callBack, time) {
                actualCallback = callBack;
            });
            conversion_start_time = new Date();

            // when
            checkAgainForBuildCompletion();

            // then
            expect(actualCallback).toEqual(checkConversionStatus);
        });

        it('checkAgainForBuildCompletion() timeout should call showBuildStatusAsTimedOut()', function () {
            // given
            spyOn(window, 'showBuildStatusAsTimedOut').and.returnValue(false);
            conversion_start_time = new Date() - MAX_CHECKING_INTERVAL - 1; // make sure timed out

            // when
            checkAgainForBuildCompletion();

            // then
            expect(window.showBuildStatusAsTimedOut).toHaveBeenCalled();
        });
    });

    describe('Test showBuildStatusAsTimedOut()', function () {

       it('showBuildStatusAsTimedOut() should call updateConversionStatusOnPage()', function () {
            // given
            spyOn(window, 'updateConversionStatusOnPage').and.returnValue(false);
            var $buildStatusIcon = {};
            var expectedTimeOut = true;

            // when
            showBuildStatusAsTimedOut($buildStatusIcon);

            // then
            validate(expectedTimeOut);
        });

        it('showBuildStatusAsTimedOut() should handle updateConversionStatusOnPage() exceptions', function () {
            // given
            spyOn(window, 'updateConversionStatusOnPage').and.callFake(function () {
                throw 'error occurred';
            });
            var $buildStatusIcon = {};
            var expectedTimeOut = true;

            // when
            showBuildStatusAsTimedOut($buildStatusIcon);

            // then
            validate(expectedTimeOut);
        });

        //
        // helpers
        //

        function validate(expectedTimeOut) {
            expect(window.updateConversionStatusOnPage).toHaveBeenCalled();
            expect(CONVERSION_TIMED_OUT).toEqual(expectedTimeOut);
        }

    });

  //
  // helpers
  //

});
