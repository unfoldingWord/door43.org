describe('Test Badges', function () {

     it('should generate correct icon type for status string', function () {
        for(var statusStr in statusMap) {
            var expectedType = statusMap[statusStr];

            var iconTYpe = getDisplayIconType(statusStr);
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
    // dynamically create normal test cases for badge icon:
    //
    var tests = generateNormalTestCasesForBadgeHtml();
    tests.forEach(function(test) {
        it('should generate correct badge html for ' + test.status, function () {
            var setHtml = setOverallConversionStatus(test.status);
            var getHtml = getCommitConversionStatusIcon(test.status);

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
        it('should generate correct badge icon for ' + test.expectedIconStr, function () {
            var icon = getNewStatusIcon(test.type, test.width, test.height);

            validateIcon(icon, test.expectedTypeStr, test.expectedWidthStr, test.expectedHeightStr);
        });
    });

    it('invalid eConvStatus should generate error badge', function () {
        var type = 10; // illegal
        var expectedType = eConvStatus.ERROR;
        var width = 0;
        var height = 0;
        var expectedTypeStr = getStatusStrTypeFromInt(expectedType);
        var expectedWidthStr = getWidthStrFromInt(width);
        var expectedHeightStr = getHeightStrFromInt(height);

        var icon = getNewStatusIcon(type, width, height);

        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
    });

    it('invalid width should generate long badge', function () {
        var type = eConvStatus.WARNING;
        var width = -1; // illegal
        var expectedWidthStr = "long";
        var height = 0;
        var expectedTypeStr = getStatusStrTypeFromInt(type);
        var expectedHeightStr = getHeightStrFromInt(height);

        var icon = getNewStatusIcon(type, width, height);

        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
    });

    it('invalid height should generate large badge', function () {
        var type = eConvStatus.WARNING;
        var width = 0;
        var height = -1; // illegal
        var expectedHeightStr = "large";
        var expectedTypeStr = getStatusStrTypeFromInt(type);
        var expectedWidthStr = getWidthStrFromInt(width);

        var icon = getNewStatusIcon(type, width, height);

        validateIcon(icon, expectedTypeStr, expectedWidthStr, expectedHeightStr);
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