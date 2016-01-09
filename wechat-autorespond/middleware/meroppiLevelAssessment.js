var questions = require('./meroppiLevelAssessmentQuestions');
var _ = require('lodash');

var xml2js = require('xml2js');
var builder = new xml2js.Builder({
  cdata:true,
  headless:true,
  xmldec:{
    allowSurrogateChars: true
  }
});

var low = require('lowdb');
var storage = require('lowdb/file-sync');
var db = low('assessmentDb.json', {storage: storage});

var permitEvent = ['subscribe', 'unsubscribe'];
var trigger = 'meroppi';
var testTime = 60;

var testStatus = {
  init: 0,
  prepare: 1,
  testing: 2,
  finished: 3,
  frozen: 4
}

function getRandomQuestions(){
  var result = _.chain(questions).groupBy('level').map(function(qs,level){

    var sample=0;
    switch(level){
      case "0":
        sample=2;
        break;
      case "1":
        sample=2;
        break;
      case "2":
        sample=1;
        break;
    }
    return _.sample(qs,sample);
  }).flatten().pluck('id').value();

  return result;
}

var respond = function(res, xml, respdContent){
  var respd= {
    xml:{
      ToUserName: xml.fromusername,
      FromUserName: xml.tousername,
      CreateTime: Date.now(),
      MsgType: ['text'],
      Content: respdContent
    }
  };
  // console.log('new follower.');
  var xml = builder.buildObject(respd);
  res.end(xml);
}

var paperMarking = function(paper){
  var correctAnswers = _.chain(paper.questions).map(function(qid){return _.find(questions,{id: qid}).answer}).value();
  var score = 0;
  for(var i=0; i<paper.answer.length; i++){
    if (paper.answer[i] == correctAnswers[i]) {
      switch(i) {
        case 0:
          score += 15;
          break;
        case 1:
          score += 15;
          break;
        case 2:
          score += 20;
          break;
        case 3:
          score += 20;
          break;
        case 4:
          score += 30;
          break;
      }
    }
  }
  paper.score = score;
  // set to testStatus.frozen if test can not be redo
  paper.status = testStatus.finished;
};

var paperResult = function(paper){
  //console.log('in paperResult');
  //console.log(paper)
  var result = '你的答卷是:\n';
  _.chain(paper.answer).forEach(function(ansId,index){
    var question = _.find(questions, {id: paper.questions[index]});
    result += question.question ;
    var answer = question.options[ansId];
    result += ' (' + answer + ')' + '\n\n';
  }).value();
  result += 'score:' + paper.score;
  return result;
}

var getNextQuestion = function(paper){
  var qId = paper.questions[paper.progress];
  //console.log('paper;');
  //console.log(paper);
  //console.log(qId);

  var question = _.find(questions, {id: qId});
  //console.log(question);
  var result = question.question + '\n';
  result += _.map(question.options,function(ans, index){return (index+1) + '.' + ans; }).join('\n')
  result += '\n\n剩余: ' + (testTime - parseInt(Date.now()/1000 - paper.startTime)) +' 秒';
  //console.log(paper.startTime)
  //console.log(Date.now())
  return result;
}

module.exports = function(req,res,next){
  var xml = req.body.xml;
  if (!xml) {
    return next();
  }

  var msgtype = xml.msgtype[0];
  if (msgtype !== 'text') {
    return next();
  }

  var content = xml.content[0].toLowerCase();
  var userId = xml.fromusername[0];
  var createTime = xml.createtime[0];
  var paper = db('paper').find({userId: userId});

  if (!paper) {
    // create paper object
    paper = {
      userId: userId,

      // 0 init
      // 1 prepare
      // 2 started
      // 3 finished
      // 4 frozen
      status: testStatus.init,
      startTime: createTime,
      questions: [],
      answer: [],
      progress: 0,
      score: 0
    }

    db('paper').push(paper);
  }

  //console.log('current paper.status' + paper.status);
  if ([testStatus.init, testStatus.finished].indexOf(paper.status) !== -1) {
    if (content !== trigger) {
      // skip while test frozen and not start
      return next();
    }
    else{
      // start new session
      paper.startTime = createTime;
      paper.questions = getRandomQuestions();
      paper.progress = 0;
      paper.status = testStatus.testing;
      paper.answer = [];
      paper.score = 0;
      db.write();
      // respond(xml, 'instruction:\n');
      var nextQuestion = getNextQuestion(paper);
      return respond(res, xml, nextQuestion);
    }
  }


  if ([testStatus.testing].indexOf(paper.status) !== -1 ) {
    if (['1', '2', '3', '4'].indexOf(content) !== -1) {
      // save status and go to next question

      var isTimeout = createTime - paper.startTime > testTime;
      if (!isTimeout) {
        paper.answer.push(--content);
        paper.progress++;
      }

      if (isTimeout || paper.progress === 5) {
        // marking paper
        paperMarking(paper);
        db.write();
        var result = paperResult(paper);
        return respond(res, xml, result);
      }
      else{
        // respond next question
        db.write();
        var nextQuestion = getNextQuestion(paper);
        return respond(res, xml, nextQuestion);
      }

    }
    else{
      // skip
      return respond(res, xml, 'incorrect answer please input 1, 2, 3 or 4\n');
    }
  }

  if(paper.status === testStatus.frozen){
    return respond(res, xml, 'you have already finished your test\nyour score is: ' + paper.score);
  }

  next();

};
