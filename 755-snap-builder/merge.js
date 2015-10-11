var posts = require('./posts');
var tranScript = require('./transcript');
var fs = require('fs');

// console.log(posts)
posts.posts.forEach(function(body){
  // console.log(k);
  body.body.forEach(function(b){
    if (b.tid !== void 0) {
      b.translate = tranScript[b.tid].trans;
      delete b.tid;
    }
    else if (b.comment){
      // console.log(b.comment)
      if (b.comment.tid !== void 0) {
        b.comment.translate = tranScript[b.comment.tid].trans;
        delete b.comment.tid;
      }
    }
  });
});

fs.writeFileSync('full.json',JSON.stringify(posts,null,2));