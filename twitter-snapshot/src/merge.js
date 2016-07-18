import React from 'react';
import ReactDOMServer from 'react-dom/server';
import FullPage from './components/FullPage';
import fs from 'fs';
import path from 'path';
import phantom from 'phantom';
import moment from 'moment';

import { TEMPLATE_VERSION, OUTPUT_BASE_PATH } from './common/constant';


const sleep = (timeout) => new Promise((resolve, reject ) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});

const loadTranslateScripts = (dateString, dayCount) => {
  const importTagName = `${dateString}_${dayCount}`;
  const importDirPath = path.join(OUTPUT_BASE_PATH, importTagName);

  try {
    const metadataPath = path.join(importDirPath, 'metadata.json');

    fs.accessSync(metadataPath, fs.F_OK);
    const metadataString = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataString);

    const tweetsPath = path.join(importDirPath, metadata.source_entry);
    const transPath = path.join(importDirPath, metadata.translate_entry);

    fs.accessSync(tweetsPath, fs.F_OK);
    fs.accessSync(transPath, fs.F_OK);

    const tweetsString = fs.readFileSync(tweetsPath, 'utf8');
    // load translate script and strip BOM
    const transString = fs.readFileSync(transPath, 'utf8').replace(/^\uFEFF/, '');

    const tweets = JSON.parse(tweetsString);
    const trans = JSON.parse(transString);

    return {
      metadata,
      tweets,
      trans,
    };
  }
  catch (e) {
    console.log(e);
    return null;
  }
};


(async () => {
  console.log('start');

  try {

    const commandline = process.argv.slice(2);
    const todayString = moment().format('YYYY-MM-DD');
    const dateString = commandline[0] || todayString;
    const dayCount = commandline[1] || 1;

    // const transcript = fs.readFileSync('transcript.json', 'utf8');
    // const trans = JSON.parse(transcript);
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

    const { trans, tweets } = transPack;


    // const tweetFileContent = fs.readFileSync('tweets.json');
    // const tweetObjects = JSON.parse(tweetFileContent);

    const tweetsResult = (<FullPage tweets={tweets} trans={trans} />);
    const result = ReactDOMServer.renderToStaticMarkup(tweetsResult);

    fs.writeFileSync('out.html', result);


    const savePath_retina = `snapshots/${dateString}_${dayCount}_retina.png`;

    console.log('Try generate the capture.');

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.setContent(result, '');

    // phantomjs-node can't trigger callback from event fired(onLoadFinshed)
    // wait for all resource are loaded by using setTimeout()
    // see also: https://github.com/amir20/phantomjs-node/issues/396
    await sleep(30000);
    await page.render(savePath_retina, { format: 'png' });

    instance.exit();
    console.log('exit');

  }
  catch (e) {
    console.log(e);
  }
})();
