var crypto = require('crypto');

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
    req.token) {
    var str = query.nonce + query.timestamp + res.token;

    var sha1 = hashSHA1(str);
    if (sha1 === query.signature) {
      console.log("access");
      res.send(query.echostr);
    }
    else{
      console.log("denined");
      next('verify failed');
    }

  }
  else{
    next("varify input error.");
  }
}