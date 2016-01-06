
var xml2js = require('xml2js');
var builder = new xml2js.Builder({
  cdata:true,
  headless:true,
  xmldec:{
    allowSurrogateChars: true
  }
});

var low = require('lowdb');
var storage = require('lowdb/file-sync');
var db = low('userDb.json', {storage: storage});

var permitEvent = ['subscribe', 'unsubscribe'];
module.exports = function(req,res,next){
  var xml = req.body.xml;
  if (!xml) {
    return next();
  }

  var msgtype = xml.msgtype[0];
  var event = xml.event[0];
  if(msgtype !== 'event' ||
    !permitEvent.includes(event)){
    return next();
  }

  var userId = xml.fromusername[0];
  var createTime = xml.createtime[0];
  var user = db('users').find({userId: userId});

  if (!user) {
    // create user object
    user = {
      userId: userId,
      subscribe: false,
      subscribeLog: []
    }
  }
  user.subscribeLog.push({
    event: event,
    date: createTime
  });
  user.subscribe = (event === 'subscribe')?true:false;

  db('users').push(user);
  db.write();

  return next();

  // var respd= {
  //   xml:{
  //     ToUserName: req.body.xml.fromusername,
  //     FromUserName: req.body.xml.tousername,
  //     CreateTime: Date.now(),
  //     MsgType: ['text'],
  //     Content: '欢迎关注 兒玉派\n请输入 \'?\' 获取帮助'
  //   }
  // };
  // console.log('new follower.');
  // var xml = builder.buildObject(respd);
  // res.end(xml);
};
