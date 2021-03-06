var xml2js = require('xml2js');
var builder = new xml2js.Builder({
  cdata:true,
  headless:true,
  xmldec:{
    allowSurrogateChars: true
  }
});

module.exports = function(req,res,next){
  if(!req.body.xml || 
    req.body.xml.msgtype[0] !== 'event' || 
    req.body.xml.event[0] !== 'subscribe'){
    return next();
  }

  var respd= {
    xml:{
      ToUserName: req.body.xml.fromusername,
      FromUserName: req.body.xml.tousername,
      CreateTime: Date.now(),
      MsgType: ['text'],
      Content: '欢迎关注 兒玉派\n请输入 \'?\' 获取帮助'
    }
  };
  console.log('new follower.');
  var xml = builder.buildObject(respd);
  res.end(xml);
};
