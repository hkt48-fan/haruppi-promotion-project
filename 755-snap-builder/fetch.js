var request=require('request');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');

var TranScriptGen = require('./libs/TranslateScriptGenerator');

var tgen = new TranScriptGen();

// haruppi
var talkId ='XDXHrpvEVMS9GtN76wEuUm==';

// meru
// talkId = 'r0_jQdkiNAS9GtN76wEuUm==';

// harutan
// talkId = 'p1aRwszeN0u9GtN76wEuUm==';

// hazuki
// talkId = 'XfFwaWXBN9b9GtN76wEuUm==';

// mirashige
// talkId = 'AkENC_TJ_aS9GtN76wEuUm%3D%3D';

// chihiro
// talkId ='UQgkwvL3xAu9GtN76wEuUm%3D%3D';

//t8
// talkId = 'i27bnW405mi9GtN76wEuUm==';

var metaUrl = 'http://7gogo.jp/api/talk/info?talkIds=' + talkId;
var postUrlBase = 'http://7gogo.jp/api/talk/post/list?direction=PREV&limit=100&postId=';

var deadLineTime = moment(0,"HH").add(-1,'s');


var buildTimeOrDay = function(timestamp){
  var ts= timestamp * 1000;
  var d = new Date(ts);
  var h = d.getHours();
  var m = d.getMinutes();
  var tod = (h<10?'0':'') + h + ':' + (m<10?'0':'') + m;
  return tod;
};

// todo better implement
if (process.argv[2]) {

  var time = moment(process.argv[2]);
  console.log("Parsed Time:" + time.format("YYYY-MM-DD"));

  if (time.isValid()) {
    deadLineTime = time;
  }
}
var deadLine = deadLineTime.valueOf()/1000;
console.log("Deadline Time: " + deadLineTime.format("YYYY-MM-DD"));



request(metaUrl,function(err,res){
  if (err) {
    throw err;
  }

  var meta = JSON.parse(res.body);
  var lastPostId = meta.talks[0].lastPostId;
  var postUrl = postUrlBase + lastPostId + "&talkId=" + talkId;

  // console.log(postUrl);

  request(postUrl,function(err,res){
    if (err) {
      throw err;
    }

    var postData = JSON.parse(res.body);
    var posts = postData.posts;

    // get todays post
    var filtered = _.chain(posts).filter(function(p){

      delete p.talkId;
      delete p.good;
      delete p.sender;
      delete p.sendUserImage;
      delete p.userOfficialStatus;
      delete p.rtCount;
      delete p.shareUrl;
      delete p['delete'];

      p.timeOrDay = buildTimeOrDay(p.time);

      // console.log(p.time)
      // if (p.time> deadLine ) {
      if (p.time > deadLine && p.time < deadLine + 86400) {
        _.each(p.body,function(b){
          //retalk
          if (b.bodyType === 7) {
            // merge data to retalk object
            var post = _.find(postData.sourcePosts,{talkId:b.talkId,postId:b.postId});

            // common
            b.postType=p.postType;
            b.sourceBodyType = post.body[0].bodyType;
            b.talkName = post.talkName;
            b.sendUserName = post.sendUserName;
            b.timeOrDay = buildTimeOrDay(post.time);
            b.sendUserImage = post.sendUserImage;

            // for video
            switch(b.sourceBodyType){
              case 1:
                // text
                // b.translate = "";
                b.text = post.body[0].text;
                tgen.wrapTranslate(b);

                // b.tid = tgen.add(post.body[0].text);
                break;
              case 3:
                // image
                b.image = post.body[0].image;
                break;
              case 4:
                // QUOTATION
                // console.log(post);
                b.body = post.body;

                _.each(b.body,function(innerBody){
                  if (innerBody.bodyType===4) {
                    // innerBody.comment.translate = '';
                    // innerBody.comment.tid = tgen.add(innerBody.comment.text);
                    tgen.wrapTranslate(innerBody.comment);
                  }
                  else{
                    // innerBody.translate ="";
                    // innerBody.tid = tgen.add(innerBody.text);
                    tgen.wrapTranslate(innerBody);
                  }

                });

                break;
              case 8:
                // movie
                b.thumbnailUrl=post.body[0].thumbnailUrl;
                break;

              case 9:
                // news
                b.image = post.body[0].image;
                b.title = post.body[0].title;
                b.detail = post.body[0].detail;
                break;
            }

          }
          else if (b.bodyType === 4) {
            var c= b.comment;
            delete c.talkId;
            delete c.commentId;
            delete c.sender;
            delete c.sendUserImage;
            delete c.userOfficialStatus;
            delete c['delete'];
            c.timeOrDay = buildTimeOrDay(c.time);
            delete c.time;

            // c.translate = '';
            tgen.wrapTranslate(c);
            return;
          }
          else if (b.bodyType === 2 ) {

          }
          else if (b.bodyType === 1) {
            // b.translate = '';
            tgen.wrapTranslate(b);
          }

        });

        return true;
      }

    }).reverse().value();

    filtered = {
      postTitle: meta.talks[0].name,
      postDate: process.argv[2],
      posts:filtered
      // sourcePosts:postData.sourcePosts
    };


    console.log("Post Total: " + posts.length);
    console.log("Filtered: " + filtered.posts.length);
    fs.writeFileSync('posts.json',JSON.stringify(filtered,null,2));
    fs.writeFileSync('transcript.json',JSON.stringify(tgen.getTranScript(),null,2));

  });


  console.log("done");
});
