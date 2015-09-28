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
var builder = new xml2js.Builder({cdata:true});
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


app.post('/',function(req,res,next){
  console.log(req.body)
  var result = req.body; 
  var keywords =['ev','live'];
  console.log('content: '+ result.xml.content +'|');
  console.log(typeof result.xml.content);
  console.log(_.includes(keywords,'ev'));
  var isMatch = _.includes(keywords,result.xml.content.toString());
  console.log(isMatch);
  if(isMatch){
    // build xml string
    console.log('matched');
    var respd= {
      xml:{
        ToUserName: result.xml.fromusername,
        FromUserName: result.xml.tousername,
        CreateTime: Date.now(),
        MsgType: ['text'],
        Content: ['hei!']
      }
    };

    var xml = builder.buildObject(respd);
    console.log(xml);
    res.write(xml);
  }
  
  // console.log(liveManager.getLiveData());
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


