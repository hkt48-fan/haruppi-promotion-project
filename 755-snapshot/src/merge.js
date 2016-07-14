import phantom from 'phantom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import FullPage from './components/FullPage';
import moment from 'moment';

// import posts from '../posts.json';
// import transcript from '../transcript.json';
import request from 'request';

import { TEMPLATE_VERSION, OUTPUT_BASE_PATH } from './common/constant';

const sleep = (timeout) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});

// let isUrl = /https?:\/\/[^\s\.]+\.\S{2}\S*/.exec(body.text);
const goolgeFetchBaseUrl = 'https://ogcdn.7gogo.jp/api/og?url=';
const fetchGooglePlusInfo = (googlePlusUrl) => new Promise((resolve, reject) => {
  const url = `${goolgeFetchBaseUrl}${encodeURIComponent(googlePlusUrl)}`;
  request(url, (err, res, body) => {
    if (err) {
      console.log(err);
      reject(err);
    }
    else {
      const result = {
        url: googlePlusUrl,
        content: JSON.parse(body),
      };
      resolve(result);
    }
  });
});


const loadTranslateScripts = (dateString, dayCount) => {
  const importTagName = `${dateString}_${dayCount}`;
  const importDirPath = path.join(OUTPUT_BASE_PATH, importTagName);

  try {
    const metadataPath = path.join(importDirPath, 'metadata.json');

    fs.accessSync(metadataPath, fs.F_OK);
    const metadataString = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataString);

    const postsPath = path.join(importDirPath, metadata.source_entry);
    const transPath = path.join(importDirPath, metadata.translate_entry);

    fs.accessSync(postsPath, fs.F_OK);
    fs.accessSync(transPath, fs.F_OK);

    const postsString = fs.readFileSync(postsPath, 'utf8');
    const transString = fs.readFileSync(transPath, 'utf8');

    const posts = JSON.parse(postsString);
    const trans = JSON.parse(transString);

    return {
      metadata,
      posts,
      trans,
    };
  }
  catch (e) {
    console.log(e);
    return null;
  }
};


(async () => {
  const commandline = process.argv.slice(2);
  const todayString = moment().format('YYYY-MM-DD');
  const dateString = commandline[0] || todayString;
  const dayCount = commandline[1] || 1;

  console.log(process.argv);
  console.log(dateString);
  console.log(dayCount);
  const mergeDate = moment(dateString, 'YYYY-MM-DD');
  if (!mergeDate.isValid()) {
    console.log('Wrong date format, it should be yyyy-mm-dd');
    return;
  }

  const transPack = loadTranslateScripts(dateString, dayCount);

  if (!transPack) {
    console.log('failed to load transcript pack');
    return;
  }

  const { trans, posts } = transPack;

  try {
    let entryIndex = 0;
    const mergeTranslateText = (bodies) => {
      bodies.forEach(b => {
        if (b.bodyType === 1) {
          b.trans = trans[entryIndex].trans;
          entryIndex++;
        }
        else if(b.bodyType === 4){
          b.comment.comment.trans = trans[entryIndex].trans;
          entryIndex++;
        }
        else if(b.bodyType === 7){
          mergeTranslateText(b.post.body);
        }
      });
    }

    // refactory with Promise.all()
    let extendUrls = trans.map(ts=>{
      const urlMatch = /https?:\/\/[^\s\.]+\.\S{2}\S*/.exec(ts.text);
      if (urlMatch) {
        const matchedUrl = urlMatch[0]
        // return ts.text;
        return matchedUrl;
      }
    }).filter(ts=>ts);

    let extendContents = [];
    for (const exu of extendUrls){
      const result = await fetchGooglePlusInfo(exu);
      extendContents.push(result);
    }

    // console.log(JSON.stringify(extendContents, null, 2));
    // fetch google plus infos
    // process.exit();

    let post = (
      <FullPage posts={posts.reverse()} trans={trans} extendContents={extendContents} />);
    let result = ReactDOMServer.renderToStaticMarkup(post);
    let resultRetina = result.replace('custom.css', 'custom.retina.css');
    console.log('output html');
    fs.writeFileSync('./out.html', resultRetina);

    // console.log(result);
    // export to png via phantomjs
    // page.viewportSize in phantomjs 2.0 was broken,
    // build two version of html for render normal size and retina size
    let unixTime = posts[0].post.time;
    let date = new Date(unixTime*1000);
    let dateString = [
      date.getFullYear(),
      (date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1),
      date.getDate()>9?date.getDate():'0'+date.getDate()
    ].join('-');

    let savePath_retina = 'snapshots/' + dateString + '_retina.png';


    console.log('Try generate the capture.');

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.setContent(resultRetina, '');

    // phantomjs-node can't trigger callback from event fired(onLoadFinshed)
    // wait for all resource are loaded by using setTimeout()
    // see also: https://github.com/amir20/phantomjs-node/issues/396
    await sleep(20000);
    await page.render(savePath_retina, {format: 'png'})

    instance.exit();
    console.log('exit');
  }
  catch(e){
    console.log(e);
  }


})();
