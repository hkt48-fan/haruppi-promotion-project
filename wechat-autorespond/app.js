
var tokenManager = require('./tokenManager');
var liveManager = require('./liveManager');

var config = require('./config');
var verify = require('./middleware/verify');
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');
var express = require('express');
var app = express();

var _ = require('lodash');

var xml2js = require('xml2js');
var builder = new xml2js.Builder({cdata:true,headless:true});
var parseString = xml2js.parseString;


tokenManager.startRefresh();
liveManager.startRefresh();


app.use(xmlparser());


app.get('/',verify);


var userMsgCommands = [
  {
    key: 'live',
    keywords: ['live','ev','直播','节目表','番组表'],
    description: 'live schedule and room status',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text']
        }
      };

      var liveData = liveManager.getLiveData();
      var content = "番组表:\n";

      for(var i=0;i<liveData.schedule.length;i++){
        var s = liveData.schedule[i];
        content += '>'  + 
          s.begin +'\n' + 
          s.end + '\n' + 
          s.description + '\n';
      }

      if(liveData.room.length !== 0){
        content +="\n直播中:\n";
      }
      for(var j=0;j<liveData.room.length;j++){
        var r = liveData.room[j];
        //console.log(liveData.room);
        //console.log(r);
        content += r.room_name + '\n';
      }

      respd.xml.Content=content;
      //console.log('---------');
      //console.log(respd.xml.Content);
      // console
      return respd;

    }
  },
  {
    key: 'performance',
    keywords: ['perf','gongyan','公演'],
    description: 'performance info',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
          Content: ['hei!']
        }
      };
      return respd;
    }
  }
];

var getMatchedCommand = function(userMsg){
  var result = _.find(userMsgCommands,function(cmd){
    if(!userMsg.xml.content){
      return false;
    }

    return _.includes(cmd.keywords,userMsg.xml.content.toString());
  });
  return result;
};


// parse 
app.post('/',function(req,res,next){
  //console.log(req.body);

  var cmd = getMatchedCommand(req.body);
  if (!cmd) {
    console.log("not match any keyword");
    res.end();
    return;
  }

  var respond = cmd.respondBuilder(req.body);

  req.respond = respond;
  next();
});

app.post('/',function(req,res,next){

  console.log("middleware for output xml");
  if (!req.respond) {
    console.log("respond is empty");
    res.end();
  }

  var xml = builder.buildObject(req.respond);
  console.log(xml);
  res.write(xml);
  res.end();
});


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


