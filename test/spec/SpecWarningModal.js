describe('Test Warning Modal', function () {
    it('showWarningModel() should generate modal HTML', function () {
        myRepoOwner = 'Door43';
        myRepoName = 'en_obs';
        showWarningModal('<ul><li>'+['Missing Chapter 1', 'Missing Chapter 2'].join('</li><li>')+'</li></ul>');

        expect($('#warning-modal')).toExist();

        var expectedLength = 2;
        expect($('#warning-modal .modal-body li').length).toEqual(expectedLength);

        var expectedText = 'mailto:help@door43.org?subject='+encodeURIComponent('Build Warning: '+myOwner+'/'+myRepoName);
        const $help_button = $('#warning-modal .btn-secondary:first');
        expect($help_button.attr('href')).toContain(expectedText);
    });

    it('showWarningModal() print click should work', function () {
        // given
        jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
        loadFixtures('obs-project-page-fixture.html');
        spyOn(window, 'printWarnings').and.returnValue(false);

        // when
        showWarningModal('warnings');
        $("#warning-print").trigger('click');

        // then
        expect(window.printWarnings).toHaveBeenCalled();
        $('#warning-modal').trigger('hidden.bs.modal'); // clear off screen
    });

    it('printWarnings() first time should call $.getScript() and printWarningsSub()', function () {
        // given
        jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
        loadFixtures('obs-project-page-fixture.html');
        printLoaded = false;
        spyOn($, 'getScript').and.callFake(mockGetScript);
        spyOn(window, 'printWarningsSub').and.returnValue(false);

        // when
        printWarnings();

        // then
        expect($.getScript).toHaveBeenCalled();
        expect(window.printWarningsSub).toHaveBeenCalled();
        expect(printLoaded).toBeTruthy();
    });

    it('printWarnings() second time should not call $.getScript(), but printWarningsSub()', function () {
        // given
        jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
        loadFixtures('obs-project-page-fixture.html');
        printLoaded = true;
        spyOn($, 'getScript').and.callFake(mockGetScript);
        spyOn(window, 'printWarningsSub').and.returnValue(false);

        // when
        printWarnings();

        // then
        expect($.getScript).not.toHaveBeenCalled();
        expect(window.printWarningsSub).toHaveBeenCalled();
        expect(printLoaded).toBeTruthy();
    });

    it('printWarningsSub() should call $.print', function () {
        // given
        var print = jasmine.createSpy('print');
        var $warnings = {
            'print': print
        };

        // when
        printWarningsSub($warnings, "title");

        // then
        expect(print).toHaveBeenCalled();
    });

    //
    // helpers
    //

    function mockGetScript(url, func){
        func();
    }
});