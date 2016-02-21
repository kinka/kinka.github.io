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

            this.loadComment(data.link);

            var md = this.refs.mdPreview && this.refs.mdPreview.getDOMNode();
            setTimeout(function() {
                [].forEach.call(md.querySelectorAll("pre code"), function(e) {
                    hljs.highlightBlock(e);
                });
            }, 0);
        }.bind(this));
    }
    loadComment(link) {
        delete window.uyan_loaded;
        delete window.uyan_loadover;
        var uyan_frame = document.getElementById("uyan_frame");
        uyan_frame.innerHTML = "";

        var su = decodeURIComponent(link);
        su = su.substring(su.indexOf("master/") + "master".length);
        window.uyan_config = {su: su};
        var script = document.createElement("script");
        script.src = "http://v2.uyan.cc/code/uyan.js?uid=2054671";
        document.body.appendChild(script);
    }
    markitdown() {
        return {__html: Marked(this.state.raw && this.state.raw)};
    }
    render() {
        return <div dangerouslySetInnerHTML={this.markitdown()} ref='mdPreview'/>
    }
}

module.exports = Article;