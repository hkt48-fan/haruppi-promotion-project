
var tokenManager = require('./tokenManager');
var liveManager = require('./liveManager');

var config = require('./config');

// middlewares
var verify = require('./middleware/verify');
var replier = require('./middleware/replier');

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


var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var credential = require('./.credential');
app.get('/auth',function(req,res,next){
  console.log('in auth');
  var oauth2Client = new OAuth2(credential.client_id,credential.client_secret,'http://wechat.sashi.co/oauth2callback');
  var scopes =[
    'https://www.googleapis.com/auth/calendar.readonly'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  var html = '<html><body><a href="' + url + '">auth me</a></body></html>';

  res.end(html);
});


app.get('/oauth2callback',function(req,res,next){
  console.log('in oauth2callback')
});

app.listen(7788);
console.log('server started.');


