var TranslateScriptGenerator = function(){
  this.currentTid = 0;
  this.tranScript = [];
};

// TranlateScriptGenerator.prototype.requestTid=function(){
//   return ++this.currentTid;
// };

// TranslateScriptGenerator.prototype.add = function(text){
//   this.currentTid++;
//   var ts = {
//     text: text,
//     trans: ''
//   };
//   this.tranScript.push(ts);
//   return ++this.currentTid;
// };

TranslateScriptGenerator.prototype.wrapTranslate = function(node){
  // this.currentTid++;

  if (!node.text) {
    return;
  }

  var ts = {
    text: node.text,
    trans: ''
  };
  this.tranScript.push(ts);

  node.tid = this.currentTid;
  this.currentTid++;
  // return ++this.currentTid;
};

TranslateScriptGenerator.prototype.getTranScript = function(){
  return this.tranScript;
};


module.exports = TranslateScriptGenerator;