import phantom from 'phantom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import FullPage from './components/FullPage';

import posts from '../posts.json';
import transcript from '../transcript.json';
import request from 'request';


// console.log(transcript);

// let isUrl = /https?:\/\/[^\s\.]+\.\S{2}\S*/.exec(body.text);
const goolgeFetchBaseUrl = 'https://ogcdn.7gogo.jp/api/og?url='
const fetchGooglePlusInfo = (googlePlusUrl) => new Promise((resolve, reject)=>{
    const url = `${goolgeFetchBaseUrl}${encodeURIComponent(googlePlusUrl)}`;
    request(url, (err, res, body)=>{
        if (err) {
            console.log(err);
            reject(err);
        }
        else{
            const result = {
                url: googlePlusUrl,
                content: JSON.parse(body)
            };
            resolve(result);
        }
    });
});


(async ()=>{

    try{
        var entryIndex = 0;
        let mergeTranslateText = (bodies)=>{
            bodies.forEach(b=>{
                if (b.bodyType === 1) {
                    b.trans = transcript[entryIndex].trans;
                    entryIndex++;
                }
                else if(b.bodyType === 4){
                    b.comment.comment.trans = transcript[entryIndex].trans;
                    entryIndex++;
                }
                else if(b.bodyType === 7){
                    mergeTranslateText(b.post.body);
                }
            });
        }

        let extendUrls = transcript.map(ts=>{
            const isUrl = /https?:\/\/[^\s\.]+\.\S{2}\S*/.exec(ts.text);
            if (isUrl) {
                return ts.text;
            }
        }).filter(ts=>ts);

        let extendContents = [];
        for(const exu of extendUrls){
            const result =  await fetchGooglePlusInfo(exu);
            extendContents.push(result);
        }

        // console.log(JSON.stringify(extendContents, null, 2));

        // fetch google plus infos

        // process.exit();

        var post = (<FullPage posts={posts.reverse()} trans={transcript} extendContents={extendContents} />)
        var result = ReactDOMServer.renderToStaticMarkup(post);
        var resultRetina = result.replace('custom.css', 'custom.retina.css');

        fs.writeFileSync('./out.html', resultRetina);

        // console.log(result);
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

        phantom.create({parameters:{
            proxy: 'socks://127.0.0.1:8484'
        }},ph=>{
            ph.createPage(page=>{
                page.setContent(resultRetina);
                setTimeout(()=>{
                    console.log('try output retina size.');
                    page.render(savePath_retina, {format: 'png'});
                    ph.exit();
                }, 20000);
            })
        })
    }
    catch(e){
        console.log(e);
    }


})();
