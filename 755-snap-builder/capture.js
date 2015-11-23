var fs = require('fs');
var full = require('./full.json');
var savePath = 'snapshots/' + full.postDate + '.png';


var WebPage = require('webpage');

page = WebPage.create();
page.open('template.html');
page.onLoadFinished = function() {
  page.render(savePath, {
    format: 'png'
  });

  console.log(savePath + '.png saved.');
  phantom.exit();
};