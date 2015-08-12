require("./article.css");

var React = require("react");
var Comet = require("./Comet");
var Articles = require("./Articles");
var Marked = require("./marked");

class Article extends React.Component {
    constructor() {
        this.state = {raw: "loading..."};
    }
    componentDidMount() {
        Comet.oncedone.once(Articles.ONDATAFETCH, function(data) {
            this.setState({raw: data.content});
            location.href = location.href.replace(/([^#]*)(#?.*)/, "#" + data.link);
        }.bind(this));
    }
    markitdown() {
        return {__html: Marked(this.state.raw)};
    }
    render() {
        return <div dangerouslySetInnerHTML={this.markitdown()} />
    }
}

module.exports = Article;