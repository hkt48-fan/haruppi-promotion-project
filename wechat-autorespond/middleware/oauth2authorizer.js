var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var credential = require('../.credential');
var fs = require('fs');
var tokenFilePath = '../.token';

var oauth2Client = new OAuth2(
  credential.client_id,
  credential.client_secret,
  'http://wechat.sashi.co/oauth2callback');
google.options({auth: oauth2Client});

// load token from file
fs.readFile(tokenFilePath,function(err,data){
  if (err) {
    console.log(err);
    return;
  }
  
  var tokens = JSON.parse(data);
  oauth2Client.setCredentials(tokens);
  console.log("token loaded");
});


// var exports = module.exports;
exports.auth = function(req,res,next){
  console.log('in auth');
  // var oauth2Client = new OAuth2(credential.client_id,credential.client_secret,'http://wechat.sashi.co/oauth2callback');
  var scopes =[
    'https://www.googleapis.com/auth/calendar.readonly'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  var html = '<html><body><a href="' + url + '">auth me</a></body></html>';

  res.end(html);
};

exports.callback = function(req,res,next){
  console.log('in oauth2callback');
  var code = req.query.code;
  oauth2Client.getToken(code,function(err,tokens){
    if (!err) {
      console.log(tokens);
      // TODO save copy for service restarting
      // and implement code for token loading
      //

      oauth2Client.setCredentials(tokens);
      fs.writeFile(tokenFilePath,tokens,function(err){
        if (err) {
          console.log(err);
          return res.end('cant write file');
        }
        console.log("token file saved");
        return res.end('success');
      });

      
    }

    return res.end(err);
  });
};

exports.getGoogleAPI = function(){
  return google;
};

