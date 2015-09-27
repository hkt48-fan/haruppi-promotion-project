// var http = require('http');
var tokenManager = require('./tokenManager');
var liveManager = require('./liveManager');

var config = require('./config');
var verify = require('./middleware/verify');
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');
var express = require('express');
var app = express();

tokenManager.startRefresh();
liveManager.startRefresh();


app.use(xmlparser());

// attach token to all incoming request
app.use(function(req,res,next){
  req.token = tokenManager.getToken();
  next();
});

app.get('/',verify);


app.post('/',function(req,res,next){
  console.log(req.body)
  console.log(liveManager.getLiveData());
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


