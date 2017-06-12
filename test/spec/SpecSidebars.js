
describe('Test Project Sidebars', function () {

  it('should set scrollspy data', function () {

    // add the nav tags to the body
    var $body = $(document.body);
    $body.append('<nav class="navbar navbar-inverse navbar-fixed-top" itemscope="itemscope" itemtype="http://schema.org/SiteNavigationElement" role="navigation">Top Nav Bar</nav>');
    var $navbar = $('.navbar');
    $navbar.css('height', 65);
    $body.append('<nav class="affix-top hidden-print hidden-xs hidden-sm" id="right-sidebar-nav">Right Nav Bar</nav>');
    $body.append('<div class="nav nav-stacked" id="revisions-div">Revisions</div>');
    var $right_nav = $body.find('#right-side-nav');
    $right_nav.append('<ul class="nav nav-stacked books panel-group" id="sidebar-nav"></ul>');

    // run the onload function
    onProjectPageLoaded();

    // check for scrollspy data
    var $data = $body.data('bs.scrollspy');
    expect($data).toBeDefined();
    expect($data.options.offset).toEqual(165);
  });
});
