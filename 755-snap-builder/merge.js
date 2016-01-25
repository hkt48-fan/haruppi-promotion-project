var posts = require('./posts');
var tranScript = require('./transcript');
var emoji = require('emojione');
var fs = require('fs');


assetTranslate = function(target){
  if (target.tid !== void 0) {
    target.translate = emoji.unicodeToImage(tranScript[target.tid].trans).replace(/\/\/cdn.jsdelivr.net\/emojione\//g,'');
    target.text = emoji.unicodeToImage(target.text).replace(/\/\/cdn.jsdelivr.net\/emojione\//g,'');
    delete target.tid;
  }
  else if (target.comment){
    assetTranslate(target.comment);
  }
  else if (target.body){
    travelBody(target.body);
  }
  else if (target.sourceBody){
    travelBody(target.sourceBody);
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

var metadataPath = 'metadata/' + posts.postDate + '.json'
fs.writeFileSync(metadataPath, JSON.stringify(posts,null,2));