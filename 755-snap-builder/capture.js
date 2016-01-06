var fs = require('fs');
var full = require('./full.json');
var savePath_retina = 'snapshots/' + full.postDate + '_retina.png';
var savePath = 'snapshots/' + full.postDate + '.png';


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

page.open('template.html', function(status){
    if (status !== 'success') {
        console.log('failed to load template.html');
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