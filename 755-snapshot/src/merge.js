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




// fs.writeFileSync('./merged.json', JSON.stringify(posts, null, 4));
var post = (<FullPage posts={posts}/>)


var result = ReactDOMServer.renderToStaticMarkup(post)

fs.writeFileSync('./out.html', result);

// console.log(result);