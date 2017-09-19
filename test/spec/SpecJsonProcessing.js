
describe('Test Processing of Json files', function () {
    var $buildStatusIcon = null;
    var $downloadMenuButton = null;
    var $revisions = null;
    var $lastUpdated = null;
    var appendHtmlSet = null;
    var attrKeySet = null;
    var attrTextSet = null;
    var htmlSet = null;

    describe('Test processProjectJson()', function () {
        var commit = {
            created_at: "2017-06-26T20:57:42Z",
            ended_at: "2017-06-26T20:57:45Z",
            id: "39a099622d",
            started_at: "2017-06-26T20:57:43Z",
            status: "success",
            success: true
        };

        beforeEach(function () {
            $revisions = {
                append: jasmine.createSpy().and.callFake(mockJqueryAppend)
            };
            appendHtmlSet = null;
        });

        it('processProjectJson() valid object should update revisions', function () {
            // given
            var commitCount = 1;
            var project = generateProject(commitCount);
            var expectedCallCount = commitCount;

            // when
            processProjectJson(project, $revisions);

            // then
            validateRevision(expectedCallCount);
        });

        it('processProjectJson() valid object with 10 commits should update revisions + more', function () {
            // given
            var commitCount = 10;
            var project = generateProject(commitCount);
            var expectedCallCount = commitCount + 1;

            // when
            processProjectJson(project, $revisions);

            // then
            validateRevision(expectedCallCount);
        });

        //
        // helpers
        //

        function generateProject(commitCount) {
            var commits = [];
            for(var i = 0; i < commitCount; i++) {
                commits.push(commit);
            }
            var project = {
                commits: commits,
                repo: "ar_eph_text_ulb",
                repo_url: "https://https://git.door43.org/dummy/ar_eph_text_ulb",
                user: "dummy"
            };
            return project;
        }

        //
        // helpers
        //

        function validateRevision(expectedCallCount) {
            expect($revisions.append).toHaveBeenCalledTimes(expectedCallCount);
            validateString(appendHtmlSet, 5);
        }
    });

    describe('Test processBuildLogJson()', function () {
        var repo = "ar_eph_text_ulb";
        var user = "dummy_user";
        var build_log_base = {
            commit_id: "39a099622d",
            created_at: "2017-06-26T20:57:42Z",
            started_at: "2017-06-26T20:57:43Z",
            errors: [],
            message: "Conversion successful",
            repo_name: repo,
            repo_owner: user,
            source: "https://s3-us-west-2.amazonaws.com/test-tx-webhook-client/preconvert/39a099622d.zip",
            status: "success",
            success: true,
            warnings: []
        };

        beforeEach(function () {
            $revisions = {
                empty: jasmine.createSpy().and.returnValue(false)
            };
            spyOn(window, 'setDownloadButtonState').and.returnValue(false);
            spyOn(window, 'setOverallConversionStatus').and.returnValue(false);
            $downloadMenuButton = null;
            $buildStatusIcon = {
                find: jasmine.createSpy().and.callFake(mockJqueryFind),
                attr: jasmine.createSpy().and.callFake(mockJqueryAttr)
            };
            $lastUpdated = {
                html: jasmine.createSpy().and.callFake(mockJqueryHtml)
            };
            appendHtmlSet = null;
            attrKeySet = null;
            attrTextSet = null;
            htmlSet = null;
            myCommitId = null;
            myOwner = null;
            myRepoName = null;
        });

        it('processBuildLogJson() valid object should update screen status', function () {
            // given
            var build_log = build_log_base;

            // when
            processBuildLogJson(build_log, $downloadMenuButton, $buildStatusIcon, $lastUpdated, $revisions);

            // then
            validateBuildStatus();
        });

        it('processBuildLogJson() errors should update screen status', function () {
            // given
            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.errors = ["ERROR!"];

            // when
            processBuildLogJson(build_log, $downloadMenuButton, $buildStatusIcon, $lastUpdated, $revisions);

            // then
            validateBuildStatus();
        });

        it('processBuildLogJson() warnings should update screen status and ok click should work', function () {
            // given
            jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
            loadFixtures('obs-project-page-fixture.html');
            $buildStatusIcon = $('#build-status-icon');
            spyOn($buildStatusIcon, 'attr').and.callFake(mockJqueryAttr);
            spyOn(window, 'showWarningModal').and.returnValue(false);

            var build_log = JSON.parse(JSON.stringify(build_log_base)); // clone
            build_log.warnings = ["warning"];

            // when
            processBuildLogJson(build_log, $downloadMenuButton, $buildStatusIcon, $lastUpdated, $revisions);
            $buildStatusIcon.trigger('click');

            // then
            validateBuildStatus();
            expect(window.showWarningModal).toHaveBeenCalled();
            $('#warning-modal').trigger('hidden.bs.modal'); // clear off screen
        });

        //
        // helpers
        //

        function validateBuildStatus() {
            expect(window.setDownloadButtonState).toHaveBeenCalled();
            expect(window.setOverallConversionStatus).toHaveBeenCalled();
            expect($buildStatusIcon.attr).toHaveBeenCalled();
            validateString(attrKeySet,3);
            validateString(attrTextSet,5);
            expect($lastUpdated.html).toHaveBeenCalled();
            validateString(htmlSet,5);
            expect($revisions.empty).toHaveBeenCalled();
        }
    });

  //
  // helpers
  //

    function mockJqueryAppend(html){
        appendHtmlSet = html;
    }

    function mockJqueryHtml(html){
        htmlSet = html;
    }

    function mockJqueryFind(text){
        return $buildStatusIcon;
    }

    function mockJqueryAttr(key, text){
        attrKeySet = key;
        attrTextSet = text;
    }

    function validateString(value, min_size) {
        expect(typeof(value)).toEqual('string');
        expect(value.length).toBeGreaterThanOrEqual(min_size);
    }
});
