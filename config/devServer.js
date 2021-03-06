const webpack = require('webpack');
const webpackDevMid = require('webpack-dev-middleware');
const express = require('express');

const devConf = require('./webpack.dev.conf');
let webpackConf = devConf;

const app = express();
const port = process.env.PORT || 5000;
const compiler = webpack(webpackConf);

const devMid = webpackDevMid(compiler, {
    quiet: true,
    noInfo: true,
    publicPath: webpackConf.output.publicPath
});
const hotMid = require("webpack-hot-middleware")(compiler, {
    log: () => {}
});

app.use(devMid);

app.use(hotMid);
let _html = '';
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {

    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        
        // 解决webpack 3.0+ HtmlWebpackPlugin bug
        // https://github.com/webpack/webpack-dev-server/issues/949
        _html = _html || data.html.source();
        if (_html !== data.html.source()) {
            _html = data.html.source();
            hotMid.publish({
                action: 'reload'
            });
        }
        cb()
    })
})

console.log('> Starting dev server...');


devMid.waitUntilValid(() => {
    console.log('> Listening at http://localhost:' + port + '\n')
});


const server = app.listen(port);