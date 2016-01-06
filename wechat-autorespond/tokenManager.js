var https = require('https');
var credential = require('./.credential');
credential.token = '';


var TokenManager = function(){
  this.credential = credential;
  this.credential.token = '';
  this.tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + credential.appid + '&secret=' + credential.secret;
  var self = this;

  this._startRefresh = function(){
    var req = https.request(self.tokenUrl,function(res){
      res.on('data',function(data){
        var token = JSON.parse(data);
        if (!token) {
          throw new Error("cant parse token object");
        }
        self.credential.token = token.access_token;
        setTimeout(self._startRefresh,token.expires_in*1000);
      });
    });

    req.end();

    req.on('error',function(e){
      //throw e;
      console.log('exception on refresh token of wechat server, retry later...')
      console.log(e);
      setTimeout(self._startRefresh, token.expires_in * 1000);
    });
  };

  TokenManager.prototype.startRefresh = this._startRefresh;
  TokenManager.prototype.getToken = function(){
    return this.credential.token;
  };
};

module.exports = new TokenManager();
