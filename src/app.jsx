var React = require("react"),
    Articles = require("./Articles"),
    Article = require("./Article"),
    Comet = require("./Comet");
var article = <Article />;
React.render(<Articles article={article}/>, Comet.$("#list_article"));
React.render(article, Comet.$("#md_article"));

window.Comet = Comet;