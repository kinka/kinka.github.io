module.exports = {
    entry: "./src/app.jsx",
    output: {
        path: __dirname + "/build/",
        filename: "app.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css']
    },
    module: {
        loaders: [
            {test: /\.jsx$/, loaders: ['jsx?harmony']},
            {test: /\.css$/, loader: 'style!css'}
        ]
    }
};
