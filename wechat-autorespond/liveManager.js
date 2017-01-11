var request = require('request');
var config = require('./config');
var _ = require('lodash');

var LiveManager = function(){
  this.bag = {};
  this._baseAPI = 'http://' + config['tentoumu-chu-server'] +'/api';
  this.scheduleAPI = this._baseAPI + '/miichan/haruppi-ha-consumer';
  // this.roomAPI = this._baseAPI + '/room';
  var self = this;


  LiveManager.prototype.refreshRoom = function(){
    // console.log(self.roomAPI);
    request(self.roomAPI,function(err,res,data){

      if (err) {
        console.log(err);
        //return;
      }
      else{
        try{
          var room = JSON.parse(data);
          self.bag.room = _.filter(room,{show_status:1});
        }
        catch(e){
          console.log('parse live info failed.');
          console.log(e);
        }

      }

      setTimeout(self.refreshRoom,5*60*1000);
    });
  };

  LiveManager.prototype.refreshSchedule = function(){
    // console.log(self.scheduleAPI);
    request(self.scheduleAPI,function(err,res,data){

      if (err) {
        console.log(err);
        //return;
      }
      else{

        try{
          
            var schedule = JSON.parse(data);
            self.bag.schedule = schedule.data;
        }
        catch(e){
            console.log(e);
            //return;
        }
      }

      setTimeout(self.refreshSchedule,15*60*1000);
    });
  };

  LiveManager.prototype.startRefresh = function(){
    this.refreshSchedule();
    // this.refreshRoom();
  };

  LiveManager.prototype.getLiveData = function(){
    return this.bag;
  };

};


module.exports = new LiveManager();
