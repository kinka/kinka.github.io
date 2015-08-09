require("./article.css");

var React = require("react");
var Comet = require("./Comet");

class Item extends React.Component
{
    constructor() {
        this.state = {loading: false};
    }
    onClick() {
        if (this.props.onClick)
            this.props.onClick();
    }
    render() {
        return <li key={this.props.key} onClick={this.onClick.bind(this)}>{this.props.name}</li>;
    }
}

class Articles extends React.Component {
    static get ONDATAFETCH() {return "article.fetch";}

    constructor() {
        this.state = {articles: [], loading: false}
    }

    componentDidMount() {
        fetch(Comet.REPO + "/contents/articles").then(function(response) {
            return response.json();
        }).then(function(data) {
            this.setState({articles: data});

            data && data.length > 0 && this.onClick(0);
        }.bind(this));
    }

    onClick(i) {
        var link = this.state.articles[i].download_url;

        return fetch(link).then(function(res) {return res.text()}).then(final).catch(final);

        function final(data) {
            data && Comet.oncedone.done(Articles.ONDATAFETCH, data);

            return data;
        }
    }

    render() {
        if (this.state.articles.length == 0)
            return <div>加载列表中。。。</div>;

        return <ul className="art-items">
        {this.state.articles.map(function(art, i) {
            return <Item key={i} name={art.name} link={art.download_url} onClick={this.onClick.bind(this, i)}/>;
        }, this)}</ul>
    }
}

module.exports = Articles;