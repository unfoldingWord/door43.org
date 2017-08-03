describe('Test Mobile Nav Setup and TearDown', function () {

    describe('Test setupMobileContentNav', function () {
        var htmlSet = null;
        var $downloadMenuItem = null;

        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

            loadFixtures('obs_project_page.html');

            spyOn(window, 'getSpanForDownloadMenuItem').and.callFake(function () {
                return $downloadMenuItem
            });
            htmlSet = null;
        });

        it('updateTextForDownloadItem() valid $downloadMenuItem should set text', function () {
            //given
            const input_format = 'md';
            const expectedText = 'Markdown';

            //when
            updateTextForDownloadItem(input_format);

            //then
            expect($downloadMenuItem.html).toHaveBeenCalled();
            expect(htmlSet).toEqual(expectedText);
        });

        it('updateTextForDownloadItem() null $downloadMenuItem should not text', function () {
            //given
            const input_format = 'md';
            const expectedText = 'Markdown';
            $downloadMenuItem = null;
            spyOn(window, 'getTextForDownloadItem');

            //when
            updateTextForDownloadItem(input_format);

            //then
            expect(window.getTextForDownloadItem).not.toHaveBeenCalled();
            expect(htmlSet).toBeNull();
        });

        function mockJqueryHtml(html){
            htmlSet = html;
        }
    });

    describe('Test getSpanForDownloadMenuItem()', function () {
        it('getSpanForDownloadMenuItem() should return', function () {
            //given

            //when
            var span = getSpanForDownloadMenuItem();

            //then
            expect(span).toBeNull();
        });
    });

    describe('Test getTextForDownloadItem()', function () {
        it('getTextForDownloadItem() input_format md should return Markdown', function () {
            //given
            const input_format = 'md';
            const expectedText = 'Markdown';

            //when
            var text = getTextForDownloadItem(input_format);

            //then
            expect(text).toEqual(expectedText);
        });

        it('getTextForDownloadItem() input_format not md should return USFM', function () {
            //given
            const input_format = '';
            const expectedText = 'USFM';

            //when
            var text = getTextForDownloadItem(input_format);

            //then
            expect(text).toEqual(expectedText);
        });

        it('getTextForDownloadItem() input_format null should return USFM', function () {
            //given
            const input_format = null;
            const expectedText = 'USFM';

            //when
            var text = getTextForDownloadItem(input_format);

            //then
            expect(text).toEqual(expectedText);
        });
    });

    describe('Test setDownloadButtonState()', function () {
        it('setDownloadButtonState() download exists should enable button', function () {
            //given
            const expectedCommit = '123456789';
            const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
            const expectedDownloadExists = true;
            var data = {
                download_exists: expectedDownloadExists
            };
            var response = {};
            spyOn($, "ajax").and.callFake(function (e) { // mock ajax call
                response = e.success(data);
            });
            var propertySet = null;
            var propertyStateSet = null;
            var button = {
                prop: function (property, state) {
                    propertySet = property;
                    propertyStateSet = state;
                }
            };
            var expectedError = false;

            //when
            setDownloadButtonState(button, expectedCommit, dummyPage);

            //then
            validateButtonStateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
        });

        it('setDownloadButtonState() download does not exist should disable button', function () {
            //given
            const expectedCommit = '123456789';
            const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
            const expectedDownloadExists = false;
            var data = {
                download_exists: expectedDownloadExists
            };
            var response = {};
            spyOn($, "ajax").and.callFake(function (e) { // mock ajax call
                response = e.success(data);
            });
            var propertySet = null;
            var propertyStateSet = null;
            var button = {
                prop: function (property, state) {
                    propertySet = property;
                    propertyStateSet = state;
                }
            };
            var expectedError = false;

            //when
            setDownloadButtonState(button, expectedCommit, dummyPage);

            //then
            validateButtonStateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
        });

        it('setDownloadButtonState() download check error should disable button', function () {
            //given
            const expectedCommit = '';
            const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
            const expectedDownloadExists = undefined;
            var expectedError = true;
            var data = {
                'ErrorMessage': 'error'
            };
            var response = {};
            spyOn($, "ajax").and.callFake(function (e) { // mock ajax call
                response = e.success(data);
            });
            var propertySet = null;
            var propertyStateSet = null;
            var button = {
                prop: function (property, state) {
                    propertySet = property;
                    propertyStateSet = state;
                }
            };

            //when
            setDownloadButtonState(button, expectedCommit, dummyPage);

            //then
            validateButtonStateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
        });

        it('setDownloadButtonState() download get error should disable button', function () {
            //given
            const expectedCommit = '123456789';
            const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
            const expectedDownloadExists = undefined;
            var expectedResponseErrorMessage = false;
            var response = {};
            const errorStatus = 'error status';
            const errorThrown = 'error thrown';
            const expectedCommError = 'Error: ';
            spyOn($, "ajax").and.callFake(function (e) { // mock ajax call
                response = e.error(null, errorStatus, errorThrown);
            });
            var propertySet = null;
            var propertyStateSet = null;
            var button = {
                prop: function (property, state) {
                    propertySet = property;
                    propertyStateSet = state;
                }
            };

            //when
            setDownloadButtonState(button, expectedCommit, dummyPage);

            //then
            validateButtonStateResults(response, expectedDownloadExists, expectedResponseErrorMessage, propertySet, propertyStateSet, expectedCommError);
        });

        //
        // helpers
        //

        function validateButtonStateResults(response, expectedDownloadExists, expectedResponseErrorMessage, propertySet, propertyStateSet, expectedCommError) {
            if(!expectedCommError) {
                expect(response['download_exists']).toEqual(expectedDownloadExists);
                expect(response.hasOwnProperty('ErrorMessage')).toEqual(expectedResponseErrorMessage);
            } else {
                expect(response.indexOf(expectedCommError)).toEqual(0);
            }
            expect(propertySet).toEqual('disabled');
            expect(propertyStateSet).toEqual(!expectedDownloadExists); // not disabled if download exists
        }
    });

    describe('Test getDownloadUrl()', function () {
        it('getDownloadUrl() should pick up cached source', function () {
            //given
            const expectedURL = 'http://SOMETHING/SAVED';
            source_download = expectedURL;

            //when
            var downloadUrl = getDownloadUrl();

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getDownloadUrl() should generate default URL if no cached source', function () {
            //given
            const expectedCommit = "123455678";
            const expectedURL = DEFAULT_DOWNLOAD_LOCATION + expectedCommit + ".zip";
            const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
            source_download = null;

            //when
            var downloadUrl = getDownloadUrl(dummyPage);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });

        it('getDownloadUrl() should fail gracefully if no commitID in URL and no cached source', function () {
            //given
            const expectedCommit = "undefined";
            const expectedURL = DEFAULT_DOWNLOAD_LOCATION + expectedCommit + ".zip";
            const dummyPage = 'http://location/u/user/repo'; // no commit
            source_download = null;

            //when
            var downloadUrl = getDownloadUrl(dummyPage);

            //then
            expect(downloadUrl).toEqual(expectedURL);
        });
    });

    describe('Test saveDownloadLink()', function () {
        it('saveDownloadLink() should use source download for USFM', function () {
            //given
            const myLog = {
                input_format: "usfm",
                source: "http://source",
                commit_url: "http://commit"
            };
            var expectedDownload = myLog.source;
            source_download = "something";

            //when
            saveDownloadLink(myLog);

            //then
            expect(source_download).toEqual(expectedDownload);
        });

        it('saveDownloadLink() should use source download for other formats', function () {
            //given
            const myLog = {
                source: "http://source",
                commit_url: "http://somthing/commit"
            };
            var expectedDownload = myLog.source;
            source_download = "something";

            //when
            saveDownloadLink(myLog);

            //then
            expect(source_download).toEqual(expectedDownload);
        });

        it('saveDownloadLink() should fail gracefully if log file is empty', function () {
            //given
            const myLog = {};
            source_download = "something";

            //when
            saveDownloadLink(myLog);

            //then
            expect(source_download).toBeNull();
        });

        it('saveDownloadLink() should fail gracefully if log file is null', function () {
            //given
            const myLog = null;
            source_download = "something";

            //when
            saveDownloadLink(myLog);

            //then
            expect(source_download).toBeNull();
        });
    });

});
