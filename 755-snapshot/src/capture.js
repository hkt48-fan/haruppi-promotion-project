// var fs = require('fs');
// var full = require('./full.json');
var source = require('../posts.json');
var unixTime = source[0].post.time;
var date = new Date(unixTime*1000);
var dateString = [
    date.getFullYear(),
    (date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1),
    date.getDate()>9?date.getDate():'0'+date.getDate()
].join('-');

// var full ={postDate: '000-000-000'}
var savePath_retina = 'snapshots/' + dateString + '_retina.png';
var savePath = 'snapshots/' + dateString + '.png';


var WebPage = require('webpage');

page = WebPage.create();
// page.open('template.html');
// page.onLoadFinished = function() {
//   page.render(savePath, {
//     format: 'png'
//   });

//   console.log(savePath + '.png saved.');
//   phantom.exit();
// };
//

page.open('out.html', function(status){
    if (status !== 'success') {
        console.log('failed to load template.html');
        phantom.exit();
    }
    else{
        window.setTimeout(function(){
            page.render(savePath, {format: 'png'});

            console.log('try normal');
            page.evaluate(function(){
                document.body.style.webkitTransform = 'scale(2)';
                document.body.style.webkitTransformOrigin = '0% 0%';
                document.body.style.width = '50%';
            });

            window.setTimeout(function(){
                console.log('try retina');
                page.render(savePath_retina, {format: 'png'});
                phantom.exit()
            }, 200);

        },200);

    }
})