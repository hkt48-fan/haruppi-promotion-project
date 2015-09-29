var crypto = require('crypto');
var credential = require('../.credential');
var _ = require('lodash');

function hashSHA1(data) {
  var generator = crypto.createHash('sha1');
  generator.update(data);
  return generator.digest('hex');
}


module.exports = function(req,res,next){

  var query = req.query;
  if (query.signature &&
    query.timestamp &&
    query.nonce &&
    query.echostr &&
    credential.api_token) {
    var arr = [query.nonce , query.timestamp , credential.api_token];
    var str = _.sortBy(arr).join('');
    var sha1 = hashSHA1(str);
    if (sha1 === query.signature) {
      console.log("access");
      res.send(query.echostr);
    }
    else{
      console.log("denined");
      console.log(req.query);

      next('verify failed');
    }

  }
  else{
    next("varify input error.");
  }
};