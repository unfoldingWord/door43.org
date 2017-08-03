describe('Test Mobile Nav Setup and TearDown', function () {

    describe('Test setupMobileContentNav & teardownMobileContentNav', function () {
        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

            loadFixtures('obs-project-page-fixture.html');

            spyOn(window, 'getSpanForDownloadMenuItem').and.callFake(function () {
                return $downloadMenuItem
            });
            htmlSet = null;
        });

        it('setupMobileContentNav() valid, #content-header and #content-body should be created', function () {
            setupMobileContentNavigation();
        });
    });
});
