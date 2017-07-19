loadingText = ""; // make sure defined so no exceptions on onReady()

describe('Test Badges', function () {

    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    it('getDisplayIconType() should generate correct icon type for status string', function () {
        for(var statusStr in statusMap) {
            //given
            var expectedType = statusMap[statusStr];

            //when
            var iconTYpe = getDisplayIconType(statusStr);

            //then
            expect(iconTYpe).toEqual(expectedType);
        }
    });

    var statusMap = {
        'requested': eConvStatus.IN_PROGRESS,
        'started': eConvStatus.IN_PROGRESS,
        'success': eConvStatus.SUCCESS,
        'warnings': eConvStatus.WARNING,
        'critical': eConvStatus.ERROR,
        'failed': eConvStatus.ERROR,
        'UNKNOWN': eConvStatus.ERROR
    };

    //
    // dynamically create normal test cases for badge html:
    //
    var tests = generateNormalTestCasesForBadgeHtml();
    tests.forEach(function(test) {
        it('getCommitConversionStatusIcon() should generate correct badge html for ' + test.status, function () {
            //given
            var setHtml = setOverallConversionStatus(test.status);

            //when
            var getHtml = getCommitConversionStatusIcon(test.status);

            //then
            expect(getHtml).toEqual(test.expectedGetHtml);
            if(test.expectedSetHtml) {
                expect(setHtml).toEqual(test.expectedSetHtml);
            } else {
                expect(setHtml).toBeUndefined();
            }
        });
    });

    //
    // dynamically create normal test cases for badge icon:
    //
    var tests = generateNormalTestCasesForBadgeIcon();
    tests.forEach(function(test) {
        it('getNewStatusIcon() should generate correct badge icon for ' + test.expectedIconStr, function () {
            //when
            var icon = getNewStatusIcon(test.type, test.width, test.height);

            //then
            validateIcon(icon, test.expectedTypeStr, test.expectedWidthStr, test.expectedHeightStr);
        });
    });

    it('getNewStatusIcon() invalid eConvStatus should generate error badge', function () {
        //given
        var type = 10; // illegal
        var expectedType = eConvStatus.ERROR;
        var width = 0;
        var height = 0;
        var expectedTypeStr = getStatusStrTypeFromInt(expectedType);
        var expectedWidthStr = getWidthStrFromInt(width);
        var expectedHeightStr = getHeightStrFromInt(height);

        //when
        var icon = getNewStatusIcon(type, width, height);

        //then
        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
    });

    it('getNewStatusIcon() invalid width should generate long badge', function () {
        //given
        var type = eConvStatus.WARNING;
        var width = -1; // illegal
        var expectedWidthStr = "long";
        var height = 0;
        var expectedTypeStr = getStatusStrTypeFromInt(type);
        var expectedHeightStr = getHeightStrFromInt(height);

        //when
        var icon = getNewStatusIcon(type, width, height);

        //then
        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
    });

    it('getNewStatusIcon() invalid height should generate large badge', function () {
        //given
        var type = eConvStatus.WARNING;
        var width = 0;
        var height = -1; // illegal
        var expectedHeightStr = "large";
        var expectedTypeStr = getStatusStrTypeFromInt(type);
        var expectedWidthStr = getWidthStrFromInt(width);

        //when
        var icon = getNewStatusIcon(type, width, height);

        //then
        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
    });

    it('lookupSizeForImage() invalid image name should generate error', function () {
        //given
        const imageName = "";

        //when
        var size = lookupSizeForImage(imageName);

        //then
        expect(size).toBeNull();
    });

    it('timeSince() for 2 years should be valid', function () {
        //given
        const current = new Date();
        const previous = new Date(current.getFullYear() - 2, current.getMonth(), current.getDate(), current.getHours(),
            current.getMinutes(), current.getSeconds(), current.getMilliseconds());
        const expectedResults = "2 years";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    it('timeSince() for 3 months should be valid', function () {
        //given
        const current = new Date();
        const previousMs = current.getTime() - (3.1 * 30 * DAY) * 1000;
        const previous = new Date(previousMs);
        const expectedResults = "3 months";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    it('timeSince() for 4 days should be valid', function () {
        //given
        const current = new Date();
        const previousMs = current.getTime() - (4 * DAY) * 1000;
        const previous = new Date(previousMs);
        const expectedResults = "4 days";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    it('timeSince() for 5 hours should be valid', function () {
        //given
        const current = new Date();
        const previousMs = current.getTime() - (5 * HOUR) * 1000;
        const previous = new Date(previousMs);
        const expectedResults = "5 hours";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    it('timeSince() for 6 minutes should be valid', function () {
        //given
        const current = new Date();
        const previousMs = current.getTime() - (6 * MINUTE) * 1000;
        const previous = new Date(previousMs);
        const expectedResults = "6 minutes";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    it('timeSince() for 7 seconds should be valid', function () {
        //given
        const current = new Date();
        const previousMs = current.getTime() - 7 * 1000;
        const previous = new Date(previousMs);
        const expectedResults = "7 seconds";

        //when
        var timeDifference = timeSince(previous);

        //then
        expect(timeDifference).toEqual(expectedResults);
    });

    //
    // helpers
    //

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

    function splitIconIntoParts(iconStr) {
        var parts = iconStr.split(".");
        parts = parts[0].split("-");
        var type = parts[0];
        var width = parts[1];
        var height = parts[2];
        return {type: type, width: width, height: height};
    }

    function getWidthStrFromInt(width) {
        var expectedWidthStr = width ? "long" : "short";
        return expectedWidthStr;
    }

    function getHeightStrFromInt(height) {
        var expectedHeightStr = height ? "large" : "small";
        return expectedHeightStr;
    }

    function getExpectedIconStr(expectedTypeStr, expectedWidthStr, expectedHeightStr) {
        var expectedIconStr = expectedTypeStr + "-" + expectedWidthStr + "-" + expectedHeightStr;
        return expectedIconStr;
    }

    function validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr) {
        var size = lookupSizeForImage(icon);
        expect(size.length).toEqual(2);

        var sizeStr = getImageDimensions(icon);
        expect(sizeStr.length).toBeGreaterThan(0);

        var expectedHeightMatch = 'height="' + size[1] + '"';
        expect(sizeStr).toContain(expectedHeightMatch);

        var expectedWidthMatch = 'width="' + size[0] + '"';
        expect(sizeStr).toContain(expectedWidthMatch);

        var sizeParts = splitIconIntoParts(icon);
        expect(sizeParts.type).toEqual(expectedTypeStr);
        expect(sizeParts.width).toEqual(expectedWidthStr);
        expect(sizeParts.height).toEqual(expectedHeightStr);
    }

    function generateNormalTestCasesForBadgeIcon() {
        var tests = [];
        for (var i = eConvStatus.SUCCESS; i <= eConvStatus.ERROR; i++) {
            for (var w = 0; w <= 1; w++) {
                for (var h = 0; h <= 1; h++) {
                    var test = {type: i, width: w, height: h};
                    test.expectedTypeStr = getStatusStrTypeFromInt(test.type);
                    test.expectedWidthStr = getWidthStrFromInt(test.width);
                    test.expectedHeightStr = getHeightStrFromInt(test.height);
                    test.expectedIconStr = getExpectedIconStr(test.expectedTypeStr, test.expectedWidthStr, test.expectedHeightStr);
                    tests.push(test);
                }
            }
        }
        return tests;
    }

    function generateNormalTestCasesForBadgeHtml() {
        var tests = [];
        for (var statusStr in statusMap) {
            var test = {status: statusStr};

            if((statusStr == 'requested') || (statusStr == 'started')) {
                test.expectedGetHtml = '<i class="fa ' + faSpinnerClass + '" title="' + statusStr + '"></i>';
                test.expectedSetHtml = null;
            } else {
                test.expectedGetHtml = getIconHtml(0, 0, statusStr);
                test.expectedSetHtml = getIconHtml(1, 1, statusStr);
            }
            tests.push(test);
        }
        return tests;
    }

    function getIconHtml(width, height, statusStr) {
        var iconType = getDisplayIconType(statusStr);
        var icon = getNewStatusIcon(iconType, width, height);
        var sizeStr = getImageDimensions(icon);
        var html = '<img src="' + StatusImagesUrl + icon + '" alt="' + statusStr + '"' + sizeStr + '>';
        return html;
    }

    if (window['$'] === undefined) {
        $ = function (dummy) { // stub out jquery
            return { html: function (dummy) {

            }}
        }
    }
});
