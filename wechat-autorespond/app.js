var http = require('http');
var https = require('https');

server = http.createServer(function(req,res){
	if(req.method === 'POST'){
		var body ='';
		req.on('data',function(data){
			body += data;
		});
		req.on('end',function(data){
			console.log(body);
		});
		res.writeHead(200,{'Content-Type':'text/html'});
		res.end('');
	}
	else{
		console.log('wrong method');
		res.writeHead(200,{'Content-Type':'text/html'});
		res.end('wrong method');
	};
});
    
    
    
    

var credential = {appid:'wxad5b7c1413177124',secret:'083812aa3f3a41f7b0a977886f3619ae'};

var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + credential.appid + '&secret=' + credential.secret;
console.log('token url: '+ tokenUrl);



var requestToken = function(){
	var req = https.request(tokenUrl,function(res){
		res.on('data',function(data){
			console.log('token string: ' + data);
			console.log(data);
		});
	});

	req.end();

	req.on('error',function(e){
		console.err(e);
	});
}



server.listen(7788,'0.0.0.0');
console.log('server started.');


