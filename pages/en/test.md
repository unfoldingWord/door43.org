---
layout: default
title: Test
permalink: /en/test/index.html
---

The fastest way to get answers is to ask the #helpdesk channel in our Team43 Slack Group.

<script type="text/javascript">
  function signUp(f) {

    var url = 'https://0x5npzjfbh.execute-api.us-west-2.amazonaws.com/prod/slack_invite';

    $.ajax({
        type: "GET",
        url: url,
        headers: {'X-Api-Key': 'Vj4f4SCZGT8kyldI80mO93GIyKcD3ADkGS8NscSh'},
        data: $(f).serialize(),
        dataType: 'jsonp',
        done: function(data)
        {
            console.log(data);
            if (data['ok']) {
                alert('You will receive an email shortly inviting you to join the slack team.');
                f.reset();
            }
            else {
                alert('There was a problem processing your request: ' + data['error']);
            }
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
        <input type="hidden" name="token" value="xoxp-4804598406-4815113088-6177291095-348c26">
        <input type="hidden" name="channels" value="C04PNHLCE">
        <input type="hidden" name="set_active" value="true">
        <input type="hidden" name="_attempts" value="1">
        <button type="submit">Sign Up</button>
    </fieldset>
</form>

You may also email our help desk at [help@door43.org][help-mail].

[help-mail]: mailto:help@door43.org "help@door43.org"
[slack]: http://ufw.io/team43 "Team43 Slack"
