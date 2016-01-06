
var tokenManager = require('./tokenManager');
var liveManager = require('./liveManager');
var performanceManager = require('./performanceManager');

var config = require('./config');

// middlewares
var userTracker = require('./middleware/userTracker');
var verify = require('./middleware/verify');
var replier = require('./middleware/replier');
var moderator = require('./middleware/moderator');
var oauth2authorizer = require('./middleware/oauth2authorizer');

var luckyMoney = require('./middleware/luckyMoney');

// 3rd parts middlewares
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');

var express = require('express');
var app = express();


tokenManager.startRefresh();
liveManager.startRefresh();

app.use(xmlparser());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/',verify);
app.post('/',userTracker);
app.post('/',replier);
app.post('/',moderator);

app.use('/luckymoney',luckyMoney);

app.get('/auth',oauth2authorizer.auth);
app.get('/oauth2callback',oauth2authorizer.callback);


console.log('init performancemanager');
performanceManager.setGoogle(oauth2authorizer.getGoogleAPI());
performanceManager.startRefresh();


// server start
app.listen(7788);
console.log('server started.');


