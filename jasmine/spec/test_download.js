describe('Test Download', function () {
    it('should pick up cached source', function () {
        const expectedURL = 'http://SOMETHING/SAVED';
        source_download = expectedURL;
        expect(getDownloadUrl()).toEqual(expectedURL);
    });

    it('should pick up cached source', function () {
        const expectedCommit = "123455678"
        const expectedURL = DOWNLOAD_LOCATION + expectedCommit + ".zip";
        const dummyPage = 'http://location/u/user/repo/' + expectedCommit + '/01.html';
        source_download = null;
        expect(getDownloadUrl(dummyPage)).toEqual(expectedURL);
    });

    it('should fail gracefully if no commitID in URL', function () {
        const expectedCommit = "undefined"
        const expectedURL = DOWNLOAD_LOCATION + expectedCommit + ".zip";
        const dummyPage = 'http://location/u/user/repo'; // no commit
        source_download = null;
        expect(getDownloadUrl(dummyPage)).toEqual(expectedURL);
    });
});