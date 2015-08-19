var WebPage = require('webpage');
page = WebPage.create();
page.open('file:///Users/larvata/Projects/haruppi-promotion-project/755-snap-builder/template.html');
page.onLoadFinished = function() {
   page.render('googleScreenShot' + '.png');
   phantom.exit();}