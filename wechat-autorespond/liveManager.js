var request = require('request');
var config = require('./config');
var _ = require('lodash');

var LiveManager = function(){
  this.bag = {};
  this._baseAPI = 'http://' + config['tentoumu-chu-server'] +'/api';
  this.scheduleAPI = this._baseAPI + '/list';
  this.roomAPI = this._baseAPI + '/room';
  var self = this;


  LiveManager.prototype.refreshRoom = function(){
    console.log(self.roomAPI)
    request(self.roomAPI,function(err,res,data){

      if (err) {
        console.log(err);
        return;
      }
      else{
        var room = JSON.parse(data);
        self.bag.room = _.filter(room,{show_status:1});
      }

      setTimeout(self.refreshRoom,300*1000);
    });
  };

  LiveManager.prototype.refreshSchedule = function(){
    console.log(self.scheduleAPI)
    request(self.scheduleAPI,function(err,res,data){

      if (err) {
        console.log(err);
        return;
      }
      else{
        var schedule = JSON.parse(data);
        self.bag.schedule = schedule;
      }

      setTimeout(self.refreshRoom,300*1000);
    });
  };

  LiveManager.prototype.startRefresh = function(){
    this.refreshSchedule();
    this.refreshRoom();
  }

  LiveManager.prototype.getLiveData = function(){
    return this.bag;
  }

};


module.exports = new LiveManager();