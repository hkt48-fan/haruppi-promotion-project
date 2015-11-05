var _ = require('lodash');
//var OpenCC = require('opencc');
//var opencc = new OpenCC('t2s.json');
var gossip = require('./hkt-gossip');
var xml2js = require('xml2js');
var liveManager = require('../liveManager');
var performanceManager = require('../performanceManager');

var luckyMoneyStore = require('../lib/luckyMoneyStore');

var builder = new xml2js.Builder({
  cdata:true,
  headless:true,
  xmldec:{
    allowSurrogateChars: true
  }
});

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
        content += '📺'  +
          s.begin +'\n' +
          s.end + '\n' +
          s.description + '\n';
      }

      if(liveData.room.length !== 0){
        content +="\n直播中:\n";
      }
      for(var j=0;j<liveData.room.length;j++){
        var r = liveData.room[j];
        content += r.room_name + '\n';
      }

      respd.xml.Content=content;
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
        }
      };

      var perfData = performanceManager.getPerfs();
      var content = '';
      var moment = require('moment-timezone');

      for(var i=0;i<perfData.length;i++){
        var p = perfData[i];
        var d=moment(p.start.dateTime);
        content += d.tz('Asia/Shanghai').format('YYYY-MM-DD hh:mm') + '\n';
        content += p.summary + '\n';
      }

      respd.xml.Content=content;
      return respd;
    }
  },
  {
    key: 'silly',
    keywords: ['我爱你'],
    description: 'hehe',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
        }
      };

      var members= ['奶茶','软软','地狱模块','Dowdeswell','奶茶','沙沙','唯唯','根根','三遥','肉丝','泡泡','特特','果子','snow','zybof','豪豪','小鱼','鱼嫂','cam','奶茶'];
      var r = parseInt(Math.random() * members.length);
      var m = members[r];
      var content = '对不起我已经爱上' + m + '了';

      respd.xml.Content = content;
      return respd;
    }
  },
  {
    key: 'gossip',
    keywords: ['hkt','开踢'],
    description: 'HKT48\'s gossip',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
        }
      };

      var r = parseInt(Math.random() * gossip.length);
      var g = gossip[r];
      var content = g;

      respd.xml.Content = content;
      return respd;
    }
  },
  {
    key: 'help',
    keywords: ['?','？','help','帮助'],
    description: 'help content',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
        }
      };
      var content = '兒玉派 指令说明\n';
      content += '▪️?/help/帮助: 本信息\n';
      content += '▪️ev/live/直播: 48系番组直播间节目表\n';
      // content += '▪️ (http://www.zhanqi.tv/akb49)\n';
      content += '▪️perf/公演: 当日HKT48公演信息\n';
      content += '▪️hkt/开踢: HKT48冷知识\n';
      content += '▪️haruppi/儿玉遥: 兒玉遥迷你档案\n';
      content += '▪️有任何建议请在这里留言';

      respd.xml.Content = content;
      return respd;
    }
  },
  {
    key: 'profile',
    keywords: ['haruppi','儿玉遥','兒玉遥','profile'],
    description: 'haruppi profile',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
        }
      };
      var content = '兒玉遥迷你档案\n';
      content += '▪️昵称: 哈鲁P\n';
      content += '▪️生年月日: 1996年9月19日（凌晨3点46分）\n';
      content += '▪️血液型: O\n';
      content += '▪️出身地: 福冈县\n';
      content += '▪️身高: 158cm\n';
      content += '▪️兴趣: 观赏电影・吃东西・拉伸运动\n';
      content += '▪️特技: 享受每一天\n';
      content += '▪️魅力点: 眼珠的颜色\n';
      content += '▪️将来的梦想： 多栖艺人、在吉尼斯纪录中留名\n';
      content += '今天的心情是happy－happy－“哈鲁鲁P－” 每天happy！博多的精灵，昵称哈鲁P的儿玉遥\n';

      respd.xml.Content = content;
      return respd;
    }
  },
  {
    key: 'luckyMoney',
    keywords: ['红包'],
    description: 'lucky money token',
    respondBuilder: function(userMsg){
      var respd= {
        xml:{
          ToUserName: userMsg.xml.fromusername,
          FromUserName: userMsg.xml.tousername,
          CreateTime: Date.now(),
          MsgType: ['text'],
        }
      };
      var content = '今天的红包密令是:\n';
      content += luckyMoneyStore.token;

      respd.xml.Content = content;
      return respd;
    }
  },
];

var getMatchedCommand = function(userMsg){
  var result = _.find(userMsgCommands,function(cmd){
    if(!userMsg.xml.content){
      return false;
    }

    var msg = userMsg.xml.content.toString().trim().toLowerCase();
    //msg = opencc.convertSync(msg);
    return _.includes(cmd.keywords,msg);
  });
  return result;
};

module.exports = function(req,res,next){
  console.log(req.body.xml)
  if (!req.body.xml || req.body.xml.msgtype[0] !== 'text') {
    return next();
  }

  var cmd = getMatchedCommand(req.body);
  if (!cmd) {
    console.log("not match any keyword");
    if(req.body.xml.content){

      console.log(req.body.xml.content.toString());
    }
    else{
      console.log('cant parse content');
    }
      // TODO export unrecognized text to log file
    return res.end();
  }

  // reply user command
  var respond = cmd.respondBuilder(req.body);

  if (!respond) {
    console.log("respond is empty");
    return res.end();
  }

  console.log("Replied: " + cmd.description);
  var xml = builder.buildObject(respond);

  res.end(xml);

};
