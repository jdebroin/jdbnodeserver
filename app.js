'use strict'

var lautils = require('./lautils.js');
var fs = require('fs');
var express = require('express');
var proto = process.env.PROTO || 'http';
var http;
if (proto === 'https') {
    http = require('https');
} else {
    http = require('http');
}

var path = require('path');
var logger = require('morgan');

var app = express();

app.set('port', process.env.PORT || 5000);
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/mock', function (req, res) {
    //var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var ip = req.ip;
    var delay = req.query.delay || 0;

    var r = Math.random() * (delay - 30) + 30;

    console.log('/mock from=' + ip + ', delay=' + r);
                         
    setTimeout(function() {
        var response = {
            ok: "yes"
        };
        res.end(JSON.stringify(response));
    }, r);
})


var options;

if (proto === 'https') {
    var envCertPath = process.env.CERT_PATH;
    var certPath = (envCertPath ? envCertPath : './');

    options = {
        key: fs.readFileSync(path.join(certPath, 'key.pem')),
        cert: fs.readFileSync(path.join(certPath, 'cert.pem'))
    };
} else {
    options = {};
}

http.createServer(options, app).listen(app.get('port'), function () {
    lautils.log("listening for " + proto + " on port " + app.get('port'));
});
