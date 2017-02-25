import fs from 'fs-extra';
import path from 'path';
import moment from 'moment-timezone';
import TwitterFetcher from './lib/twitter-fetcher';
import Agent from 'socks5-https-client/lib/Agent';
import {
  TEMPLATE_VERSION,
  OUTPUT_BASE_PATH,
} from './common/constant';


const requestOptions = {
  consumer_key: 'p8CeAdqIioNYkN3TZ7UAjjVfX',
  consumer_secret: 'EMogyhANbHXPloIolmOUCMzpfiltWFr5tcURdY9Xmg7z3PQAeO',
  access_token_key: '29909923-C0ylT0CZTzSU6xONDJmDlkNUvq0Jum4gTECgB99pn',
  access_token_secret: '3qSj31VI9PI1FLmLfMZZfVltRxSKr30AZhpaCeNyLOCB8',


  request_options: {
    agentClass: Agent,
    agentOptions: {
      socksPort: 8484,
    },
    timeout: 5000,
  },
};

const options = {
  uid: 'haruka_kdm919',
  friends: [
    'Rie_Kitahara3',
    '345__chan',
    'lovetannnnnn',
    'ooyachaaan1228',
    'KeiZee_Dosue',
    'WRHMURAMOTO',
    '0220nicole',
    '39saku_chan',
  ],
  requestOptions,
};

const twitterFetcher = new TwitterFetcher(options);

// parse command line arguments
// parse arguments
const commandline = process.argv.slice(2);
const todayString = moment().format('YYYY-MM-DD');
const dateString = commandline[0] || todayString;
const dayCount = commandline[1] || 1;
const starttime = moment(dateString, 'YYYY-MM-DD');
if (!starttime.isValid()) {
  console.log('Wrong date format, it should be yyyy-mm-dd');
  process.exit(1);
}

const fetchArguments = {
  start: dateString,
  duration: dayCount,
};

twitterFetcher
  .fetch(fetchArguments)
  .then((result) => {
    const {tweets, transcript} = result;

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
    console.log('done', fetchArguments);
  })
  .catch((err) => {
    console.log('twitterFetcher error: ', err);
  });

