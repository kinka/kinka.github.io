module.exports = {
    entry: "./src/app.jsx",
    output: {
        path: __dirname + "/build/",
        filename: "app.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {test: /\.jsx$/, loaders: ['jsx?harmony']}
        ]
    }
};
