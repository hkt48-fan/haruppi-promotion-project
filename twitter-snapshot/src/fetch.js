import Twitter from 'twitter';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import path from 'path';
import { TEMPLATE_VERSION, OUTPUT_BASE_PATH } from './common/constant';
import twitterConfig from './authorization.js';
import Agent from 'socks5-https-client/lib/Agent';
import baseRequest from 'request';
console.log(process.argv);


const request_options = {
  agentClass: Agent,
  agentOptions: {
    socksPort: 8484,
  },
};

const requestOptions = Object.assign(twitterConfig, { request_options });
const client = new Twitter(requestOptions);
const request = baseRequest.defaults(request_options);

const options = {
  screen_name: 'haruka_kdm919',
};

// options.screen_name = 'mikinishino4';


const getTweetsPromise = (lastTweet) => new Promise((resolve, reject) => {
  const opts = Object.assign({}, options);
  if (lastTweet) {
    opts.max_id = lastTweet.id;

    console.log('fetch tweets from: ', lastTweet.id);
  }

  client.get('statuses/user_timeline.json', opts, (err, tweets, res) => {
    // console.log(res);
    console.log('get tweets: ', tweets.length);
    resolve(tweets);
  });
});


const isInDateRange = (tweet, fetchDate) => {
  if (!tweet) {
    console.log('undefIned???');
  }

  const { created_at } = tweet;
  const { starttime, deadline } = fetchDate;

  const date = new Date(created_at);
  const currentDate = moment(date);

  const result = currentDate.diff(starttime) > 0 &&
    deadline.diff(currentDate) > 0;

  return result;
};

const getRelatedTweetsPromise = (tweetId, maxPosition) => new Promise((resolve, reject) => {
  const url = `https://twitter.com/${options.screen_name}/status/${tweetId}`;
  console.log('try request', url);
  request({
    url,
    headers: {
      'x-overlay-request': true,
    },
  }, (err, res, body) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    const obj = JSON.parse(body);
    return resolve(obj.page);
  });
});


(async () => {
  // parse arguments
  const commandline = process.argv.slice(2);
  const todayString = moment().format('YYYY-MM-DD');
  const dateString = commandline[0] || todayString;
  const dayCount = commandline[1] || 1;
  const starttime = moment(dateString, 'YYYY-MM-DD');
  if (!starttime.isValid()) {
    console.log('Wrong date format, it should be yyyy-mm-dd');
    return;
  }

  const deadline = moment(dateString, 'YYYY-MM-DD').add(dayCount, 'day');
  const fetchDate = {
    starttime,
    dayCount,
    deadline,
  };

  let tweets = [];
  let lastTweet = null;
  try {
    let _tweets;
    do {

        _tweets = await getTweetsPromise(lastTweet);
        lastTweet = _tweets.slice(-1)[0];
        const filtered = _tweets.filter(t => isInDateRange(t, fetchDate));

        tweets = tweets.concat(filtered);
        if (!lastTweet) {
         console.log('test############');
        }
        else {
          console.log('okokok');
        }
    } while (_tweets.length === 200 && isInDateRange(lastTweet, fetchDate));
  }
  catch (e) {
    console.log(e);
  }

  tweets = tweets.reverse();

  // tweets.forEach(t => {
  //   if (t.in_reply_to_status_id_str) {
  //     console.log(t.text);
  //     const pageHTML = yield getRelatedTweetsPromise();
  //   }
  // })

  for(const t of tweets){
    if (t.in_reply_to_status_id_str) {
      const pageHTML = await getRelatedTweetsPromise(t.in_reply_to_status_id_str);
      console.log('jheiieiieieie');
      fs.writeFileSync(t.in_reply_to_status_id_str, pageHTML);
    }
  }


  return

  // begin generate transcript template
  const transcript = tweets.reduce((a, b) => {
    try{
      if (b.is_quote_status) {
        a.push({
          text: b.quoted_status.text,
          trans: '',
        });
      }

      a.push({
        text: b.text,
        trans: '',
      });
    }
    catch (e) {
      console.log(e);
      console.log(b);
      console.log();
      console.log();
    }
    return a;
  }, []);

  console.log(transcript.length);

  const outputTagName = `${dateString}_${dayCount}`;
  fs.mkdirsSync(OUTPUT_BASE_PATH);

  const outputDirPath = path.join(OUTPUT_BASE_PATH, outputTagName);
  fs.mkdirsSync(outputDirPath);

  const transFileName = `${outputTagName}_twtter.json`;
  const metadata = {
    source_entry: 'tweets.json',
    translate_entry: transFileName,
    commandline: commandline.join(' '),
    template_version: TEMPLATE_VERSION,
  };

  const metadataPath = path.join(outputDirPath, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  const tweetsPath = path.join(outputDirPath, 'tweets.json');
  fs.writeFileSync(tweetsPath, JSON.stringify(tweets, null, 4));

  const transPath = path.join(outputDirPath, transFileName);
  fs.writeFileSync(transPath, JSON.stringify(transcript, null, 4).replace(/\n/g, '\r\n'));

  // fs.writeFileSync(`${dateString}.json`, JSON.stringify(transcript, null, 4));
  // fs.writeFileSync('transcript.json', JSON.stringify(transcript, null, 4));
  // fs.writeFileSync('tweets.json', JSON.stringify(tweets, null, 4));
})();


