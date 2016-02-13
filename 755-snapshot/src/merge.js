import phantom from 'phantom';
import React from 'react';
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
var result = ReactDOMServer.renderToStaticMarkup(post);
var resultRetina = result.replace('custom.css', 'custom.retina.css');

// fs.writeFileSync('./out.html', result);
// process.exit();


// export to png via phantomjs
// page.viewportSize in phantomjs 2.0 was broken,
// build two version of html for render normal size and retina size
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
            console.log('try output normal size.');
            page.render(savePath, {format: 'png'});
            ph.exit();
        }, 50);
    })
})

phantom.create(ph=>{
    ph.createPage(page=>{
        page.setContent(resultRetina);
        setTimeout(()=>{
            console.log('try output retina size.');
            page.render(savePath_retina, {format: 'png'});
            ph.exit();
        }, 50);
    })
})
