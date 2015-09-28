// var http = require('http');
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

// attach token to all incoming request
// app.use(function(req,res,next){
//   req.token = tokenManager.getToken();
//   next();
// });

app.get('/',verify);


var userMsgCommands = [
  {
    key: 'live',
    keywords: ['live','ev','直播','番组表','节目表'],
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
      var content = "直播预告:\n";
      //var content = '';
      for(var i=0;i<liveData.schedule.length;i++){
        var s = liveData.schedule[i];
        content += '������' +  s.begin +'\n'
            + s.end + '\n'
            + s.description + '\n';
        //content += "description";
      }

      //content += "直播中:";
      for(var j=0;j<liveData.room.length;j++){
        var r = liveData.room[i];
        content += r.room_name + '\n';
      }

      respd.xml.Content=content;
      console.log('---------');
      console.log(respd.xml.content);
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
    return _.includes(cmd.keywords,userMsg.xml.content.toString());
  });
  return result;
};


// parse 
app.post('/',function(req,res,next){
  console.log(req.body);
  // var result = req.body; 

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
  // 

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


// server = http.createServer(function(req,res){
//   if(req.method === 'POST'){
//     var body ='';
//     req.on('data',function(data){
//       body += data;
//     });
//     req.on('end',function(data){
//       console.log(body);
//     });
//     res.writeHead(200,{'Content-Type':'text/html'});
//     res.end('');
//   }
//   else{
//     console.log('wrong method');
//     res.writeHead(200,{'Content-Type':'text/html'});
//     res.end('wrong method');
//   }
// });




// console.log('token url: '+ tokenUrl);






// server.listen(7788,'0.0.0.0');
app.listen(7788)
console.log('server started.');


