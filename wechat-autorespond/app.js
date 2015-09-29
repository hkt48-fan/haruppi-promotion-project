
var tokenManager = require('./tokenManager');
var liveManager = require('./liveManager');
var PerformanceManager = require('./performanceManager');

var config = require('./config');

// middlewares
var verify = require('./middleware/verify');
var replier = require('./middleware/replier');
var oauth2authorizer = require('./middleware/oauth2authorizer');

// 3rd parts middlewares
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');

var express = require('express');
var app = express();


tokenManager.startRefresh();
liveManager.startRefresh();

app.use(xmlparser());

app.get('/',verify);
app.post('/',replier);

app.get('/auth',oauth2authorizer.auth);
app.get('/oauth2callback',oauth2authorizer.callback);

var performanceManager = new PerformanceManager(oauth2authorizer.getGoogleAPI());
performanceManager.startRefresh();




// server start
app.listen(7788);
console.log('server started.');


