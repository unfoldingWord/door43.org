describe('Test Badges', function () {
    it('should generate correct badge', function () {
        for(var i = eConvStatus.SUCCESS; i <= eConvStatus.ERROR; i++) {
            var expectedType = null;
            switch(i) {
                case eConvStatus.SUCCESS:
                    expectedType = "success";
                    break;
                case eConvStatus.WARNING:
                    expectedType = "warning";
                    break;
                default:
                    expectedType = "error";
                    break;
            }
            for(var w = 0; w <= 1; w++) {
                var expectedWidth = w ? "long" : "short";
                for(var h = 0; h <= 1; h++) {
                    var expectedHeight = h ? "large" : "small";
                    var icon = getNewStatusIcon(i, w, h);
                    var size = lookupSizeForImage(icon);
                    expect(size.length).toEqual(2)
                    var sizeStr = getImageDimensions(icon);
                    expect(sizeStr.length).toBeGreaterThan(0);

                    var expectedHeightStr = 'height="' + size[1] + '"';
                    expect(sizeStr).toContain(expectedHeightStr);
                    var expectedWidthStr = 'width="' + size[0] + '"';
                    expect(sizeStr).toContain(expectedWidthStr);

                    var parts = icon.split(".");
                    parts = parts[0].split("-");
                    var type = parts[0];
                    expect(type).toEqual(expectedType);
                    var width = parts[1];
                    expect(width).toEqual(expectedWidth);
                    var height = parts[2];
                    expect(height).toEqual(expectedHeight);
                }
            }
        }

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