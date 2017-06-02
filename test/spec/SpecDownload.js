describe('Test Download Link', function () {
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

});
