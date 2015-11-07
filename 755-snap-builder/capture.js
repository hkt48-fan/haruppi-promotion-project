var WebPage = require('webpage');
page = WebPage.create();
page.open('template.html');
page.onLoadFinished = function() {
   page.render('googleScreenShot' + '.png',{
    format: 'png'
   });
   phantom.exit();
};