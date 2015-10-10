var request=require('request');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');


var talkId ='XDXHrpvEVMS9GtN76wEuUm%3D%3D';
// talkId = 'AkENC_TJ_aS9GtN76wEuUm%3D%3D';
// talkId ='UQgkwvL3xAu9GtN76wEuUm%3D%3D';

var metaUrl = 'http://7gogo.jp/api/talk/info?talkIds=' + talkId;
var postUrlBase = 'http://7gogo.jp/api/talk/post/list?direction=PREV&limit=30&postId=';

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


  var postUrl = postUrlBase + lastPostId + "&talkId=" + talkId;

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

      if (p.time> deadLine) {
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
                b.translate = "";
                b.text = post.body[0].text;
                break;
              case 3:
                // image
                b.image = post.body[0].image;
                break;
              case 4:
                // QUOTATION
                console.log(post);
                b.body = post.body;

                _.each(b.body,function(innerBody){
                  if (innerBody.bodyType===4) {
                    innerBody.comment.translate = '';
                  }
                  else{
                    innerBody.translate ="";
                  }

                });

                // b.translate = '';
                break;
              case 8:
                // movie
                b.thumbnailUrl=post.body[0].thumbnailUrl;
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

    }).reverse().value();

    filtered = {
      postTitle: meta.talks[0].name,
      posts:filtered
      // sourcePosts:postData.sourcePosts
    };


    console.log(posts.length);
    console.log(filtered.posts.length);
    fs.writeFileSync('posts.json',JSON.stringify(filtered,null,2));

  });


  console.log("done");
});
