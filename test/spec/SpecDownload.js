describe('Test Download Link', function () {

    it('setDownloadButtonState() download exists should enable button', function () {
        //given
        const expectedCommit = '123456789';
        const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
        const expectedDownloadExists = true;
        var data = {
            download_exists: expectedDownloadExists
        };
        var response = {};
        spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
            response = e.success(data);
        });
        var propertySet = null;
        var propertyStateSet = null;
        var button = {
            prop: function(property, state) {
                propertySet = property;
                propertyStateSet = state;
            }
        };
        var expectedError = false;

        //when
        setDownloadButtonState(button, expectedCommit, dummyPage);

        //then
        validateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
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
        spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
            response = e.success(data);
        });
        var propertySet = null;
        var propertyStateSet = null;
        var button = {
            prop: function(property, state) {
                propertySet = property;
                propertyStateSet = state;
            }
        };
        var expectedError = false;

        //when
        setDownloadButtonState(button, expectedCommit, dummyPage);

        //then
        validateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
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
        spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
            response = e.success(data);
        });
        var propertySet = null;
        var propertyStateSet = null;
        var button = {
            prop: function(property, state) {
                propertySet = property;
                propertyStateSet = state;
            }
        };

        //when
        setDownloadButtonState(button, expectedCommit, dummyPage);

        //then
        validateResults(response, expectedDownloadExists, expectedError, propertySet, propertyStateSet);
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
        spyOn($, "ajax").and.callFake(function(e) { // mock ajax call
            response = e.error(null, errorStatus, errorThrown);
        });
        var propertySet = null;
        var propertyStateSet = null;
        var button = {
            prop: function(property, state) {
                propertySet = property;
                propertyStateSet = state;
            }
        };

        //when
        setDownloadButtonState(button, expectedCommit, dummyPage);

        //then
        validateResults(response, expectedDownloadExists, expectedResponseErrorMessage, propertySet, propertyStateSet, expectedCommError);
    });

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

    //
    // helpers
    //

    function validateResults(response, expectedDownloadExists, expectedResponseErrorMessage, propertySet, propertyStateSet, expectedCommError) {
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
