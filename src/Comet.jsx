class OnceDone {
    constructor() {
        this.dones = {};
    }

    once(event, done) {
        if (!this.dones[event])
            this.dones[event] = [];
        this.dones[event].push(done);
    }
    done(event, data) {
        if (this.dones[event] && this.dones[event] instanceof Array)
            this.dones[event].map(function(fn) {
                fn(data);
            });
    }
    remove(event, done) {
        if (!done) return this.dones[event] = [];
        return this.dones[event].splice(this.dones[event].indexOf(done), 1);
    }
}

module.exports = {
    REPO: "https://api.github.com/repos/kinka/kinka.github.io",
    $: function(selector) {return document.querySelector(selector);},
    $$: function(selector) {return document.querySelectorAll(selector);},
    oncedone: new OnceDone()
};