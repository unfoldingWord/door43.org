---
layout: default
title: Contact
permalink: /en/contact/index.html
---

## Slack

The fastest way to get answers is to ask the [#helpdesk](https://team43.slack.com/messages/helpdesk/) channel in our Team43 Slack Group.  Use the form below to join our Slack team if you are not a member.

<script type="text/javascript">
  function disable_page() {
    var cover = document.getElementById('gray_cover');
    cover.style.display = 'inline-block';
  }

  function enable_page() {
    var cover = document.getElementById('gray_cover');
    cover.style.display = 'none';
  }

  function signUp(f) {

    var url = 'https://aj7l129x3e.execute-api.us-west-2.amazonaws.com/prod/slack_invite';
    disable_page();

    $.ajax({
        url: url,
        type: 'GET',
        data: $(f).serialize(),
        dataType: 'jsonp',
        success: function (data, status) {
            if (data['result'] === 'success') {
                alert('An invitation has been sent to your e-mail address');
            }
            else {
                alert('A problem was encountered: ' + data['message'] + '.');
            }
            enable_page();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('Error: ' + textStatus + '\n' +  errorThrown);
            alert(textStatus);
            enable_page();
        }
    });

    return false;
  }
</script>
<div id="gray_cover" style="position:fixed;top:0;left:0;overflow:hidden;display:none;width:100%;height:100%;background-color:#000000;opacity:0.5;MozOpacity:0.5;z-index:150;filter:alpha(opacity=50);cursor: wait;"></div>
<form onsubmit="return signUp(this)" action="" method="POST">
    <fieldset id="slack-fields">
        <legend>Team43 Slack Sign Up Form</legend>
        <p>By using this service you agree to our <a href="/en/slack-terms-of-service/">Slack Terms of Service</a>.</p>
        <label for="first_name"><span>First Name: </span><input type="text" name="first_name" id="first_name"></label>
        <label for="last_name"><span>Last Name: </span><input type="text" name="last_name" id="last-name"></label>
        <label for="email"><span>E-Mail: </span><input type="email" name="email" id="email"></label>
        <input type="hidden" name="token" value="IByqnIF8ql+jXkKvvTQZCvc32RH2K2jKxRyy3kKHGrjtj+q9XXFfVGyqWS8lzneylw==">
        <button type="submit">Sign Up</button>
    </fieldset>
</form>

## E-Mail

If you prefer, you may also e-mail our help desk at [help@door43.org][help-mail].

[help-mail]: mailto:help@door43.org "help@door43.org"
