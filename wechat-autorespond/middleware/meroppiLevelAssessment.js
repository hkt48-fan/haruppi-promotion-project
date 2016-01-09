var questions = require('./meroppiLevelAssessmentQuestions');

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
var testTime = 60 * 1000;

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

var respond = function(xml, respdContent){
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
  var correctAnswer = _.chain(paper.answer).map(function(qid){return _.find(questions,{id: qid}).answer}).value();
  var score = 0;
  for(var i=0; i<paper.answer.length; i++){
    if (paper.answer[i] == correctAnswer[i]) {
      switch(i) {
        case 0,1:
          score += 15;
          break;
        case 2,3:
          score += 20;
          break;
        case 4:
          score += 30;
          break;
      }
    }
  }
  paper.score = score;
  paper.status = testStatus.finished;
};

var paperResult = function(paper){
  var result = '你的答卷是:\n';
  _.chain(paper.answer).forEach(function(ansId,index){
    var question = _.find(questions, {id: paper.questions[index]});
    result += question.question + '\n';
    var answer = question.options[ansId];
    result += answer + '\n';
  });
  return result;
}

var getNextQuestion = function(paper){
  var qId = paper.questions(paper.progress);
  var question = _.find(questions, {id: qid});
  var result = questions.questions;
  result += _.map(questions.options,function(ans, index){return (index+1) + '.' + ans; }).join('\n')
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

  var content = xml.content[0];
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
      startTime: createtime,
      questions: getRandomQuestions(),
      answer: [],
      progress: 0,
      score: 0
    }

    db('paper').push(paper);
  }

  if ([testStatus.init, testStatus.frozen].indexOf(paper.state) !== -1) {
    if (content === trigger) {
      // skip while test frozen and not start
      return next();
    }
    else{
      // start new session
      paper.state = testStatus.prepare;
      db.write();
      // respond(xml, 'instruction:\n');
      var nextQuestion = getNextQuestion(paper);
      respond(xml, nextQuestion);
    }
  }


  if ([testStatus.testing].indexOf(paper.state) !== -1 ) {
    if ([1,2,3,4].indexOf(content) !== -1) {
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
        respond(xml, result);
      }
      else{
        // respond next question
        db.write();
        var nextQuestion = getNextQuestion(paper);
        respond(xml, nextQuestion);
      }

    }
    else{
      // skip
      respond(xml, 'incorrect answer please input 1, 2, 3 or 4\n');
    }
  }

};
