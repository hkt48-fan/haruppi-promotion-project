var posts = require('./posts');
var tranScript = require('./transcript');
var fs = require('fs');


assetTranslate = function(target){
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
  travelBody(body.body);
});

fs.writeFileSync('full.json',JSON.stringify(posts,null,2));