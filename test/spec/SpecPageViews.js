describe('Test Page Views', function () {

    beforeEach(function() {
        jasmine.Ajax.install(); // set up mocking for ajax
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
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

    // helpers

    function getStatusStrTypeFromInt(typeInt) {
        var type = null;
        switch (typeInt) {
            case eConvStatus.SUCCESS:
                type = "success";
                break;
            case eConvStatus.WARNING:
                type = "warning";
                break;
            default:
                type = "error";
                break;
        }
        return type;
    }
});
