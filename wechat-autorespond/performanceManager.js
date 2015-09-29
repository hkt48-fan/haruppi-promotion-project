var PerformanceManager = function(google){
  this.google = googleAPI;

  PerformanceManager.prototype.startRefresh = function(){
    console.log("performanceManager startRefresh");
    var calendar = google.calendar;

    var params={
      timeMax:'2015-9-29T00:00:00.000Z',
      timeMin: '2015-9-28T00:00:00.000Z',
      timeZone:7
    };
    calendar.list(params,function(err,events){
      console.log("callback in calendar.list");
      if (err) {
        console.log(err);
        return;
      }

      console.log(events);

    });
  };
};


module.exports = PerformanceManager;