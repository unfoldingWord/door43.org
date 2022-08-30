---
layout: default
title: Library
header_title: Library
permalink: /en/library/index.html
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react.js" charset="utf-8"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react-dom.js" charset="utf-8"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.21.1/babel.min.js" charset="utf-8"></script>

<style>
        .quiz {
            display: block;
            background: linear-gradient(to bottom, #2a86d6 0%,#7db9e8 100%);
            padding: 40px;
            color: #ffffff;
        }

        .quiz button {
            display: block;
            margin-bottom: 10px;
            color: #000000;
        }

        .quiz .correct {
            background-color: #ffffff;
            padding: 5px;
            color: #11AF08;
            font-weight: bold;
        }

        .quiz .incorrect {
            background-color: #ffffff;
            padding: 5px;
            color: #FF0C0C;
            font-weight: bold;
        }
    </style>

<script type="text/babel">
class Quiz extends React.Component {
	constructor(props) {
    	super(props);
    	this.state = {
        	correct: null
        };
    }
    
    answer(correct) {
    	this.setState({
        	correct
        });
    }

    render() {
    	let question = null;
        if (this.state.correct === null) {
            question = <div>
                <button onClick={() => this.answer(false)}>a) A graph database query language</button>
                <button onClick={() => this.answer(true)}>b) An API query language</button>
                <button onClick={() => this.answer(false)}>c) A graph drawing API</button>
        	</div>;
        }
        let answer = null;
        if (this.state.correct === true) {
        	answer = <div className="correct">Correct! It is an API query language</div>;
        } else if (this.state.correct === false) {
        	answer = <div className="incorrect">Nope! It's actually an API query language</div>;
        }
        
        return <div className="quiz">
            <p>What is GraphQL?</p>
            {question}
            {answer}
        </div>;
    }
}
ReactDOM.render(
    <Quiz />,
    document.getElementById('quiz')
);
</script>

DDoor43 is a community of people interested in furthering unrestricted biblical content in every language. Contributors from all over the world use this site to work together to create, translate, and distribute unrestricted discipleship resources.

Learn more about the [New Door43 Site]({{ '/en/about/new_door43/' | prepend: site.baseurl }}).

See the [Statement of Faith]({{ '/en/statement-of-faith/' | prepend: site.baseurl }}) or the [Translation Guidelines]({{ '/en/translation-guidelines/' | prepend: site.baseurl }}).

## Legal Information

* [Copyrights and Licensing]({{ '/en/copyright-and-licensing/' | prepend: site.baseurl }})
* [Copyright Violations]({{ '/en/copyright-violations/' | prepend: site.baseurl }})
* [General Disclaimer]({{ '/en/general-disclaimer/' | prepend: site.baseurl }})
* [Privacy Policy]({{ '/en/privacy-policy/' | prepend: site.baseurl }})
* [Slack Terms of Service]({{ '/en/slack-terms-of-service/' | prepend: site.baseurl }})
