require("./article.css");

var React = require("react");
var Comet = require("./Comet");
var Articles = require("./Articles");

class Article extends React.Component {
    constructor() {
        this.state = {raw: "loading..."};
    }
    componentDidMount() {
        Comet.oncedone.once(Articles.ONDATAFETCH, function(data) {
            this.setState({raw: data});
        }.bind(this));
    }
    render() {
        return <div>{this.state.raw}</div>
    }
}

module.exports = Article;