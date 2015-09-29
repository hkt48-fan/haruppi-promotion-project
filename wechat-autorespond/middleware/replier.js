var _ = require('lodash');
var xml2js = require('xml2js');
var liveManager = require('./liveManager');
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
          Content: ['hei!']
        }
      };
      return respd;
    }
  }
];

var getMatchedCommand = function(userMsg){
  var result = _.find(userMsgCommands,function(cmd){
    if(!userMsg.xml.content){
      return false;
    }

    return _.includes(cmd.keywords,userMsg.xml.content.toString());
  });
  return result;
};

module.exports = function(req,res,next){

  var cmd = getMatchedCommand(req.body);
  if (!cmd) {
    console.log("not match any keyword");
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
  var xml = builder.buildObject(req.respond);

  res.end(xml);

};
