var moment = require('moment-timezone');

var _getTimeRange = function(){
  var m = moment().utcOffset(9);

  var ret = {
    min: m.year() + '-' + (m.month()+1) + '-' + m.date() + 'T00:00:00.000Z',
    max: m.year() + '-' + (m.month()+1) + '-' + m.date() + 'T23:59:59.000Z',
  };
  return ret;
};

var PerformanceManager = function(){
  this.google = null;
  this.perfs = {};
  var self = this;

  this._startRefresh = function(){
    if(!self.google){
      console.log('no google');
      return;
    }
    console.log("performanceManager startRefresh");
    var calendar = self.google.calendar({version:'v3'});


    var range = _getTimeRange();
    var params={
      calendarId: 'j34r8005pb9n75i2gf266j2lo8@group.calendar.google.com',
      timeMax: range.max,
      timeMin: range.min,
      timeZone:7
    };
    calendar.events.list(params,function(err,events){
     // console.log("callback in calendar.list");
      if (err) {
        console.log(err);
        //return;
      }
      else{

        if(events.items.length !== 0){

           self.perfs = events.items.map(function(p){

             return {
               start: p.start,
               summary: p.summary
             };
           });
        }
        //console.log(events);
      }

      setTimeout(self.startRefresh,60*60*1000);
    });
  };

  PerformanceManager.prototype.setGoogle = function(google){
    this.google = google;
  };
  PerformanceManager.prototype.getPerfs = function(){
    return this.perfs;
  };
  PerformanceManager.prototype.startRefresh = this._startRefresh;
};


module.exports = new PerformanceManager();
