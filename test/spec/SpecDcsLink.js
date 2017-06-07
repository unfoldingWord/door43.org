
describe('Test DCS Links', function () {

  it('should get the correct link back to DCS', function () {

    var pathname = '/u/Door43/en_obs/ec7c9d9e8c/';
    var dcs_url = getDcsLink(pathname);

    expect(dcs_url).toEqual('https://git.door43.org/Door43/en_obs');

  });

  it('should return empty string', function () {

    var pathname1 = '';
    var pathname2 = '/t/Door43/en_obs/ec7c9d9e8c/';
    var pathname3 = '/u/Door43/';

    expect(getDcsLink(pathname1)).toEqual('');
    expect(getDcsLink(pathname2)).toEqual('');
    expect(getDcsLink(pathname3)).toEqual('');
  });

  it('should set href of anchor', function () {

    // add the anchor tag
    $(document.body).append('<a id="see-on-dcs" href="">See on DCS</a>');
    var $see_on_dcs = $('#see-on-dcs');
    expect($see_on_dcs.length).toEqual(1);

    // call the function
    var localContext = {
      'window':{
        location:{
          href: 'https://live.door43.org/u/Door43/en_obs/ec7c9d9e8c/',
          pathname: '/u/Door43/en_obs/ec7c9d9e8c/'
        }
      }
    };

    //noinspection WithStatementJS
    with(localContext) {
      setDcsHref(window.location);
      expect($see_on_dcs.attr('href')).toEqual('https://git.door43.org/Door43/en_obs');
    }
  });

  it('should set href of anchor to myRepoName', function () {

    // add the anchor tag
    $(document.body).append('<a id="see-on-dcs" href="">See on DCS</a>');
    var $see_on_dcs = $('#see-on-dcs');
    expect($see_on_dcs.length).toEqual(1);

    // call the function
    var localContext = {
      'window': {
        location: {
          href: 'https://live.door43.org/u/Door43/en_obs/ec7c9d9e8c/',
          pathname: '/u/Door43/en_obs/ec7c9d9e8c/'
        }
      }
    };

    myOwner = 'unit-tester';
    myRepoName = 'unit-test-repo';

    //noinspection WithStatementJS
    with(localContext) {
      setDcsHref(window.location);
      expect($see_on_dcs.attr('href')).toEqual('https://git.door43.org/unit-tester/unit-test-repo');
    }
  });
});
