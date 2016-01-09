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
var testTime = 30;

var testStatus = {
  init: 0,
  prepare: 1,
  testing: 2,
  finished: 3,
  frozen: 3
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
  var correctAnswers = _.chain(paper.questions).map(function(qid){var q = _.find(questions,{id: qid}); console.log(qid); return q.answer}).value();
  var score = 0;
  for(var i=0; i<paper.answer.length; i++){
    if (paper.answer[i] == correctAnswers[i]) {
      console.log('correct')
      switch(i) {
        case 0,1:
         console.log(15)
          score += 15;
          break;
        case 2,3:
          console.log(20)
          score += 20;
          break;
        case 4:
          console.log(30)
          score += 30;
          break;
      }
    }
    else{
      console.log('wrong')
    }
  }
  paper.score = score;
  paper.status = testStatus.finished;
};

var paperResult = function(paper){
    console.log('in paperResult');
    console.log(paper)
  var result = '你的答卷是:\n';
  _.chain(paper.answer).forEach(function(ansId,index){
    var question = _.find(questions, {id: paper.questions[index]});
    result += question.question + '\n';
    var answer = question.options[ansId];
    result += answer + '\n';
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
  result += '\nremains: ' + (Date.now()/1000 - paper.startTime) + '\n';
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

  console.log('current paper.status' + paper.status);
  if ([testStatus.init, testStatus.frozen].indexOf(paper.status) !== -1) {
    console.log('`111');
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
      console.log(nextQuestion)
      respond(res, xml, nextQuestion);
    }
  }


  if ([testStatus.testing].indexOf(paper.status) !== -1 ) {
    if (['1', '2', '3', '4'].indexOf(content) !== -1) {
      // save status and go to next question

      console.log('createTime:' + createTime);
      console.log('startTime:'+ paper.startTime);
      var isTimeout = createTime - paper.startTime > testTime;
      console.log('isTimeout:' + isTimeout);
      if (!isTimeout) {
        paper.answer.push(--content);
        paper.progress++;
      }

      if (isTimeout || paper.progress === 5) {
        // marking paper
        paperMarking(paper);
        db.write();
        var result = paperResult(paper);
        respond(res, xml, result);
      }
      else{
        // respond next question
        db.write();
        var nextQuestion = getNextQuestion(paper);
        respond(res, xml, nextQuestion);
      }

    }
    else{
      // skip
      respond(res, xml, 'incorrect answer please input 1, 2, 3 or 4\n');
    }
  }

};
