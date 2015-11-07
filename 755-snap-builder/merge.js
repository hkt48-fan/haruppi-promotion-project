var posts = require('./posts');
var tranScript = require('./transcript');
var fs = require('fs');


assetTranslate = function(target){
  console.log(target)
  console.log('-----------')
  if (target.tid !== void 0) {
    target.translate = tranScript[target.tid].trans;
    delete target.tid;
  }
  else if (target.comment){
    assetTranslate(target.comment);
  }
  else if (target.body){
    travelBody(target.body);
  }
};

travelBody = function(body){
  body.forEach(function(b){
    assetTranslate(b);
  });
};

// console.log(posts)
posts.posts.forEach(function(body){
  // console.log(k);
  // body.body.forEach(function(b){
  //   // console.log(b)
  //   // if (b.tid !== void 0) {
  //   //   b.translate = tranScript[b.tid].trans;
  //   //   delete b.tid;
  //   // }
  //   // else if (b.comment){
  //   //   // console.log(b.comment)
  //   //   if (b.comment.tid !== void 0) {
  //   //     b.comment.translate = tranScript[b.comment.tid].trans;
  //   //     delete b.comment.tid;
  //   //   }
  //   // }
  //   assetTranslate(b);
  // });
  travelBody(body.body);
});

fs.writeFileSync('full.json',JSON.stringify(posts,null,2));