describe('Test Warming Modal', function () {
    it('showWarningModel() should generate modal HTML', function () {
        myOwner = 'Door43';
        myRepoName = 'en_obs';
        showWarningModal('<ul><li>'+['Missing Chapter 1', 'Missing Chapter 2'].join('</li><li>')+'</li></ul>');

        expect($('#warning-modal')).toExist();

        var expectedLength = 2;
        expect($('#warning-modal .modal-body li').length).toEqual(expectedLength);

        var expectedText = 'mailto:help@door43.org?subject='+encodeURIComponent('Build Warning: '+myOwner+'/'+myRepoName);
        expect($('#warning-modal .btn-secondary').attr('href')).toContain(expectedText);
    });
});