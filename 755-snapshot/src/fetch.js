import requestLegacy from 'request';
import moment from 'moment';
import fs from 'fs';
import path from 'path';

import { TEMPLATE_VERSION, OUTPUT_BASE_PATH } from './common/constant';

// const TEMPLATE_VERSION = 1;
let fetchId = 'kodama-haruka';
// fetchId = 'kodamaharuka-anaichihiro';
// fetchId = 'anai-chihiro';
// 枕
// fetchId = 'q3J7NRXCT9Dz';
// 48cafe
// fetchId = 'slRMDMXtyEtl';

const apiUrlBase = `https://api.7gogo.jp/web/v2/talks/${fetchId}/posts?limit=200`;

const request = (url) => {
  return new Promise((resolve, reject) => {
    requestLegacy(url, (err, res) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(res.body);
      }
    });
  });
};


(async () => {
  const commandline = process.argv.slice(2);
  const todayString = moment().format('YYYY-MM-DD');
  const dateString = commandline[0] || todayString;
  const dayCount = commandline[1] || 1;

  console.log(process.argv);
  console.log(dateString);
  console.log(dayCount);
  const fetchDate = moment(dateString, 'YYYY-MM-DD');
  if (!fetchDate.isValid()) {
    console.log('Wrong date format, it should be yyyy-mm-dd');
    return;
  }

  try{
    var responseBody = await request(apiUrlBase);
    var result = JSON.parse(responseBody);
    var matched = result.data.filter(d=>{
      let postDate = moment.unix(d.post.time).startOf('day');
      let duration = moment.duration(postDate.diff(fetchDate));
      let inDateRange = duration.asDays()<dayCount && duration.asDays()>=0;
      return inDateRange;

      let postString = JSON.stringify(d);

      let containsHaruppi = ['はるっぴ', '兒玉', '児玉'].some(k=>{
        return postString.includes(k)
      });

      if (!containsHaruppi) {
        // console.log(postString);
      }

      return inDateRange && containsHaruppi
    });

    var transcript = [];

    var extractTranslateText = (body)=>{
      body.forEach(b=>{
        var ts = {
          text: '',
          trans: ''
        };
        if (b.bodyType === 1) {
          // text
          ts.text = b.text;
          // ts.trans = b.text;
        }
        else if(b.bodyType === 2){
          // stame
          return;
        }
        else if(b.bodyType === 3){
          // image
          return;
        }
        else if(b.bodyType === 4){
          // quotation
          ts.text = b.comment.comment.body;
        }
        else if(b.bodyType === 7){
          // retalk
          extractTranslateText(b.post.body);
          return;
        }
        else if(b.bodyType === 9){
          // news
          return;
        }

        if (ts.text === '' && ts.trans === '') {
          console.log(b.bodyType);
        }
        transcript.push(ts);
      })
    }

    // extract text for translate
    matched.forEach(m=>{
      extractTranslateText(m.post.body);
    });

    const outputTagName = `${dateString}_${dayCount}`;
    // const OutputDirBaseName = 'postMetadata';
    try {
      fs.accessSync(OUTPUT_BASE_PATH, fs.F_OK);
    }
    catch(e){
      fs.mkdirSync(OUTPUT_BASE_PATH);
    }

    const outputDirPath = path.join(OUTPUT_BASE_PATH, outputTagName);
    try {
      fs.accessSync(outputDirPath, fs.F_OK);
    }
    catch(e) {
      fs.mkdirSync(outputDirPath);
    }

    const transFileName = `${outputTagName}_755.json`;
    const metadata = {
      source_entry: 'posts.json',
      translate_entry: transFileName,
      commandline: commandline.join(' '),
      template_version: TEMPLATE_VERSION,
    };

    const metadataPath = path.join(outputDirPath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    const postsPath = path.join(outputDirPath, 'posts.json');
    fs.writeFileSync(postsPath, JSON.stringify(matched, null, 4));

    const transPath = path.join(outputDirPath, transFileName);
    fs.writeFileSync(transPath, JSON.stringify(transcript, null, 4).replace(/\n/g, '\r\n'));

    // fs.writeFileSync('./posts.json', JSON.stringify(matched, null, 4));
    // fs.writeFileSync(`./${dateString}.json`, JSON.stringify(transcript, null, 4).replace(/\n/g, '\r\n'));
    // fs.writeFileSync('./transcript.json', JSON.stringify(transcript, null, 4));

  }
  catch(e) {
    console.log(e);
  }
})();


