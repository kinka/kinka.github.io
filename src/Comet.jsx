module.exports = {
    REPO: "https://api.github.com/repos/kinka/kinka.github.io",
    $: function(selector) {return document.querySelector(selector);},
    $$: function(selector) {return document.querySelectorAll(selector);}
};