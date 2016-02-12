import phantom from 'phantom';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import FullPage from './components/FullPage';

import posts from '../posts.json';
import transcript from '../transcript.json';

var entryIndex = 0;
posts.forEach(p=>{
    p.post.body.forEach(b=>{
        if (b.bodyType === 1) {
            // text
            b.trans = transcript[entryIndex].trans;
            entryIndex++;
        }
        else if(b.bodyType === 4){
            b.comment.comment.trans = transcript[entryIndex].trans;
            entryIndex++;
        }
    });
});

var post = (<FullPage posts={posts}/>)
var result = ReactDOMServer.renderToStaticMarkup(post)
// fs.writeFileSync('./out.html', result);
// process.exit();


// export to png via phantomjs
var unixTime = posts[0].post.time;
var date = new Date(unixTime*1000);
var dateString = [
    date.getFullYear(),
    (date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1),
    date.getDate()>9?date.getDate():'0'+date.getDate()
].join('-');

var savePath_retina = 'snapshots/' + dateString + '_retina.png';
var savePath = 'snapshots/' + dateString + '.png';

phantom.create(ph=>{
    ph.createPage(page=>{
        page.setContent(result);

        setTimeout(()=>{
            page.render(savePath, {format: 'png'});
            console.log('try output normal size.');

            page.evaluate(()=>{
                document.body.style.webkitTransform = 'scale(2)';
                document.body.style.webkitTransformOrigin = '0% 0%';
                document.body.style.width = '100%';
                // document.body.style.height = '100%';
            });

            setTimeout(()=>{
                console.log('try output retina size.');
                page.render(savePath_retina, {format: 'png'});
                ph.exit();
            }, 2000);
        }, 2000);
    })
})
