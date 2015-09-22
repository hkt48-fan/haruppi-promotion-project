var request=require('request');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');

var metaUrl = 'http://7gogo.jp/api/talk/info?talkIds=XDXHrpvEVMS9GtN76wEuUm%3D%3D';
var postUrlBase = 'http://7gogo.jp/api/talk/post/list?direction=PREV&limit=30&postId='

var deadLineTime = moment(0,"HH").add(-1,'s');

// todo better implement
if (process.argv[2]) {
  console.log(process.argv[2])
  var time = moment(process.argv[2])

  if (time.isValid()) {
    deadLineTime = time;
  }
}
var deadLine = deadLineTime.valueOf()/1000;
console.log(deadLineTime.format("YYYY-MM-DD"));


request(metaUrl,function(err,res){
  if (err) {
    throw err;
  }

  var meta = JSON.parse(res.body);


  var lastPostId = meta.talks[0].lastPostId;


  var postUrl = postUrlBase + lastPostId + "&talkId=XDXHrpvEVMS9GtN76wEuUm%3D%3D";

  console.log("ok");

  console.log(postUrl);

  request(postUrl,function(err,res){
    console.log("err?");
    if (err) {
      throw err;
    }

    console.log("try");

    var postData = JSON.parse(res.body);
    var posts = postData.posts;



    console.log("last");
    console.log(deadLine);


    // get todays post
    var filtered = _.filter(posts,function(p){

      delete p.talkId;
      delete p.good;
      delete p.sender;
      delete p.sendUserImage;
      delete p.userOfficialStatus;
      delete p.rtCount;
      delete p.shareUrl;
      delete p['delete'];

      if (p.time> deadLine) {
        _.each(p.body,function(b){
          //retalk
          if (b.bodyType === 7) {
            var post = _.find(postData.sourcePosts,{talkId:b.talkId});
            console.log("---------")
            console.log(post.body.thumbnailUrl)
            b.thumbnailUrl=post.body[0].thumbnailUrl;
            b.talkName = post.talkName;
            b.sendUserName = post.sendUserName;
            b.timeOrDay = post.timeOrDay;
            b.sendUserImage = post.sendUserImage;
          }
          else if (b.bodyType === 4) {
            var c= b.comment;
            delete c.talkId;
            delete c.commentId;
            delete c.sender;
            delete c.sendUserImage;
            delete c.userOfficialStatus;
            delete c.time;
            delete c['delete'];

            c.translate = '';
            return;
          }
          else if (b.bodyType === 2 ) {

          }
          else if (b.bodyType === 1) {
            b.translate = '';
          }

        });

        return true;
      }

    });

    filtered = {
      posts:filtered,
      sourcePosts:postData.sourcePosts
    };


    console.log(posts.length);
    console.log(filtered.posts.length);
    fs.writeFileSync('posts.json',JSON.stringify(filtered,null,2));

  });


  console.log("done");
});
