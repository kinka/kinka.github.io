var webpack = require("webpack");
module.exports = {
    entry: "./src/app.jsx",
    output: {
        path: __dirname + "/build/",
        filename: "app.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css']
    },
    devtool: "#sourcemap",
    module: {
        loaders: [
            {test: /\.jsx$/, loaders: ['jsx?harmony']},
            {test: /\.css$/, loader: 'style!css'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourcemap: false,
            compress: {warnings: false}
        })
    ]
};
