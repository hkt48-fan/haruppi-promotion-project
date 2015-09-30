var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var credential = require('../.credential');
var fs = require('fs');
var tokenFilePath = './.token';

var oauth2Client = new OAuth2(
  credential.client_id,
  credential.client_secret,
  'http://wechat.sashi.co/oauth2callback');

google.options({auth: oauth2Client});
console.log('set google auth')


// load token from file
var tokens = {};
try{

  var tokenString = fs.readFileSync(tokenFilePath);
  if(!tokenString){
    console.log('failed open token file');
  }
  else{
    //console.log(tokenString);
    tokens = JSON.parse(tokenString);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);
    //google.options({auth: oauth2Client});
    console.log('token loaded');
  }
}
catch(e){}
google.options({auth: oauth2Client});



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
  oauth2Client.getToken(code,function(err,t){
    if (!err) {
      console.log(t);
      // TODO save copy for service restarting
      // and implement code for token loading
      //

      Object.assign(tokens,t);
      oauth2Client.setCredentials(tokens);
      console.log('will save to file:');
      console.log(tokens);
      var tokenString = JSON.stringify(tokens);
      fs.writeFile(tokenFilePath,tokenString,'utf8',function(err){
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
  console.log('return google api object');
  return google;
};

//
exports.getAuth = function(){
  return oauth2Client;
};
