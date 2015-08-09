require("./article.css");

var React = require("react");
var Comet = require("./Comet");

class Item extends React.Component
{
    constructor() {
        this.state = {loading: false};
    }

    onClick(link) {
        if (this.state.loading) return;
        var me = this;

        this.setState({loading: true});
        fetch(link).then(function(res) {return res.text()})
            .then(function(data) {
            console.log(data.length)
            final();
        }).catch(final);

        function final() {
            me.setState({loading: false});
            if (me.props.onClick)
                me.props.onClick();
        }
    }
    render() {
        return <li key={this.props.key}
        onClick={this.onClick.bind(this, this.props.link)}>{this.props.name}</li>;
    }
}

class Articles extends React.Component {
    constructor() {
        this.state = {articles: []}
    }

    componentDidMount() {
        fetch(Comet.REPO + "/contents/articles").then(function(response) {
            return response.json();
        }).then(function(data) {
            this.setState({articles: data});
        }.bind(this));
    }
    onClick(i) {
        console.log(i)
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