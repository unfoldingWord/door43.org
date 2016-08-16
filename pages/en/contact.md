---
layout: default
title: Contact
permalink: /en/contact/index.html
---

The fastest way to get answers is to ask the #helpdesk channel in our Team43 Slack Group.

<script type="text/javascript">
  function signUp(f) {

    var url = 'https://aj7l129x3e.execute-api.us-west-2.amazonaws.com/prod/slack_invite';

    $.ajax({
        url: url,
        type: 'GET',
        data: $(f).serialize(),
        dataType: 'jsonp',
        success: function (data, status) {
            if (data['result'] === 'success') {
                alert('An invitation has been sent to your email address');
            }
            else {
                alert('A problem was encountered: ' + data['message'] + '.');
            }
        },
        error: function (xOptions, textStatus) {
            console.log('Error: ' + textStatus);
        }
    });

    return false;
  }
</script>
<form onsubmit="return signUp(this)" action="" method="POST">
    <fieldset id="slack-fields">
        <legend>TEAM43 Slack Sign Up Form</legend>
        <label for="first_name"><span>First Name: </span><input type="text" name="first_name" id="first_name"></label>
        <label for="last_name"><span>Last Name: </span><input type="text" name="last_name" id="last-name"></label>
        <label for="email"><span>E-Mail: </span><input type="email" name="email" id="email"></label>
        <input type="hidden" name="token" value="IByqnIF8ql+jXkKvvTQZCvc32RH2K2jKxRyy3kKHGrjtj+q9XXFfVGyqWS8lzneylw==">
        <button type="submit">Sign Up</button>
    </fieldset>
</form>

You may also email our help desk at [help@door43.org][help-mail].

[help-mail]: mailto:help@door43.org "help@door43.org"
[slack]: http://ufw.io/team43 "Team43 Slack"
