import Twitter from 'twitter';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import path from 'path';
import { TEMPLATE_VERSION, OUTPUT_BASE_PATH } from './common/constant';
import twitterConfig from './authorization.js';
import Agent from 'socks5-https-client/lib/Agent';
import baseRequest from 'request';

import cheerio from 'cheerio';

const friends = [
  'Rie_Kitahara3',
  '345__chan',
  'lovetannnnnn',
  'ooyachaaan1228',
  'KeiZee_Dosue',
  'WRHMURAMOTO',
  '0220nicole'
];

const request_options = {
  agentClass: Agent,
  agentOptions: {
    socksPort: 8484,
  },
  timeout: 5000,
};

const requestOptions = Object.assign(twitterConfig, { request_options });
const client = new Twitter(requestOptions);
const request = baseRequest.defaults(request_options);

const options = {
  screen_name: 'haruka_kdm919',
  count: 200,
};
// options.screen_name = 'mikinishino4';

const getTweetsPromise = (lastTweet) => new Promise((resolve, reject) => {
  const opts = Object.assign({}, options);
  if (lastTweet) {
    opts.max_id = lastTweet.id;
  }

  client.get('statuses/user_timeline.json', opts, (err, tweets, res) => {
    // console.log(res);
    if (err) {
      console.log(err);
      return reject(err);
    }
    resolve(tweets);
  });
});


const isInDateRange = (tweet, fetchDate) => {
  if (!tweet) {
    return false;
  }

  const { created_at } = tweet;
  const { starttime, deadline } = fetchDate;

  const date = new Date(created_at);
  const currentDate = moment(date);

  const result = currentDate.diff(starttime) > 0 &&
    deadline.diff(currentDate) > 0;

  return result;
};

const trimTweets = (tweets) => {
  const result = tweets.map(tweet => {
    const {
      id_str,
      created_at,
      text,
      entities,
      extended_entities,
      in_reply_to_status_id_str,
      user,
      is_quote_status,
      quoted_status_id_str,
      quoted_status,
      retweeted_status,
    } = tweet;
    const { name, screen_name, profile_image_url } = user;

    return {
      id_str,
      created_at,
      text,
      entities,
      extended_entities,
      in_reply_to_status_id_str,
      is_quote_status,
      quoted_status_id_str,
      quoted_status,
      retweeted_status,
      user: {
        name,
        screen_name,
        profile_image_url,
      },
    };
  });
  return result;
};

const _parseTweetEntity = (tweetTextElement) => {
  const $ = cheerio;
  const entities = {
    hashtags: [],
    symbols: [],
    user_mentions: [],
    urls: [],
    lastIndices: 0,
  };

  // parse tweet
  let text = '';
  tweetTextElement.get(0).children.forEach((child) => {
    let _text = '';
    if (child.type === 'text') {
      // plain text
      _text = child.data;
    }
    else if (child.type === 'tag'
      && child.name === 'img') {
      // emoji
      _text = child.attribs.alt;
    }
    else if (child.type === 'tag'
      && child.name === 'a'
      && child.attribs['data-query-source'] === 'hashtags_click') {
      // hash tag
      _text = $(child).text();
      entities.hashtags.push({
        text: _text.replace(/^#/, ''),
        indices: [
          entities.lastIndices,
          (entities.lastIndices + _text.length),
        ],
      });
    }
    else if(child.type === 'tag'
      && child.name === 'a'
      && child.attribs['data-mentioned-user-id']) {
      // mention
      _text = $(child).text();
      entities.user_mentions.push({
        screen_name: _text.replace(/^@/, ''),
        indices: [
          entities.lastIndices,
          (entities.lastIndices + _text.length),
        ],
      });
    }
    else if (child.type === 'tag'
      && child.name === 'a'
      && !child.attribs.class.includes('u-hidden')) {
      //  normal link
      _text = $(child).find('.js-display-url').text();

      entities.urls.push({
        display_url: _text,
        indices: [
          entities.lastIndices,
          (entities.lastIndices + _text.length),
        ],
      });
    }
    else if (child.type === 'tag'
      && child.name === 'a'
      && child.attribs.class.includes('u-hidden')) {
      // extendable link
    }
    else {

      console.log('unknow child type:', child.type, child.name);
      console.log(child);
    }

    text += _text;
    entities.lastIndices += _text.length;
  });

  // console.log('-----------');
  // console.log(entities);
  // console.log(text);
  return {
    text,
    entities,
  };
};

// start of parse related tweets
const _parseRelatedTweetsHTML = (html, sourceTweet, lastReplyId) => {
  const lastId = sourceTweet.id_str + '_' + lastReplyId;
  fs.writeFileSync('tmp/' + lastId + '.html', html);
  console.log('extract related tweets: ', lastId);

  // fetch in reply to
  const $ = cheerio.load(html);
  // const repliesContainer = $('.permalink-in-reply-tos .stream-container');
  const repliesElements = $('.permalink-in-reply-tos .stream-container .stream-item');

  const replySourceTweets = [];
  let lastTweetIdStr;
  repliesElements.each((idx, re) => {
    const _re = $(re);
    const profileElement = _re.find('.js-profile-popup-actionable');
    const name = profileElement.data('name');
    const screen_name = profileElement.data('screen-name');
    const id_str = profileElement.data('tweet-id').toString();

    const avatarElement = _re.find('.avatar');
    const profile_image_url = avatarElement.attr('src').replace(/^https:/, 'http:');
    const timestampElement = _re.find('.tweet-timestamp ._timestamp');
    const _time_ms = timestampElement.data('time-ms');
    const created_at = new Date(+_time_ms).toString();

    const tweetTextElement = _re.find('.tweet-text');
    const parsedTweetTextObject = _parseTweetEntity(tweetTextElement);


    const adaptiveMedia = _re.find('.AdaptiveMedia');
    const imageElements = adaptiveMedia.find('img');
    const extended_entities = {
      media: [],
    };
    imageElements.each((imgidx, img) => {
      extended_entities.media.push({
        media_url: img.attribs.src,
      });
    });

    const tweet = {
      id_str,
      created_at,
      extended_entities,
      user: {
        name,
        screen_name,
        profile_image_url,
      },
    };

    Object.assign(tweet, parsedTweetTextObject);
    if (lastTweetIdStr) {
      tweet.in_reply_to_status_id_str = lastTweetIdStr;
    }
    lastTweetIdStr = tweet.id_str;


    replySourceTweets.push(tweet);
    // console.log(tweetObject);
    // console.log({name, screen_name, id_str, profile_image_url, created_at});
    console.log();
  });

  // fetch current tweet info
  // replace current tweet.text
  {
    const tweetElement = $('.permalink-tweet-container');
    const tweetTextElement = tweetElement.find('.tweet-text');
    const parsedTweetTextObject = _parseTweetEntity(tweetTextElement);

    const adaptiveMedia = tweetElement.find('.AdaptiveMedia');
    const imageElements = adaptiveMedia.find('img');
    const extended_entities = {
      media: [],
    };
    imageElements.each((imgidx, img) => {
      extended_entities.media.push({
        media_url: img.attribs.src,
      });
    });

    // do not replace extend_entities
    sourceTweet.extended_entities = sourceTweet.extended_entities || extended_entities;
    // replace full text when exceed 140 char
    sourceTweet.text = parsedTweetTextObject.text;

    console.log(sourceTweet);
  }

  // todo reuse following code with inreplyto
  // fetch reply to
  {
    // todo fix bug cannot get correct exteded_entities
    // inner block
    const permalinkReplies = $('.permalink-replies .stream');
    const hotThreaded = permalinkReplies.first('.ThreadedConversation .stream-item');
    const hotThreadedTweet = hotThreaded.find('.tweet');

    const name = hotThreadedTweet.data('name');
    const screen_name = hotThreadedTweet.data('screen-name');
    const id_str = hotThreadedTweet.data('tweet-id').toString();

    const avatarElement = hotThreadedTweet.find('.avatar');
    const profile_image_url = avatarElement.attr('src').replace(/^https:/, 'http:');
    const timestampElement = hotThreadedTweet.find('.tweet-timestamp ._timestamp');
    const _time_ms = timestampElement.data('time-ms');
    const created_at = new Date(+_time_ms).toString();

    const tweetTextElement = hotThreadedTweet.find('.tweet-text');
    const parsedTweetTextObject = _parseTweetEntity(tweetTextElement);

    // const adaptiveMedia = hotThreadedTweet.find('.AdaptiveMedia');
    // const imageElements = adaptiveMedia.find('img');
    const extended_entities = {
      media: [],
    };
    // todo uncomment it if bug fixed
    // imageElements.each((imgidx, img) => {
    //   extended_entities.media.push({
    //     media_url: img.attribs.src,
    //   });
    // });

    const tweet = {
      id_str,
      created_at,
      extended_entities,
      in_reply_to_status_id_str: sourceTweet.id_str,
      user: {
        name,
        screen_name,
        profile_image_url,
      },
    };

    Object.assign(tweet, parsedTweetTextObject);
    if (lastTweetIdStr) {
      tweet.in_reply_to_status_id_str = lastTweetIdStr;
    }
    lastTweetIdStr = tweet.id_str;

    if (friends.includes(screen_name)) {
      replySourceTweets.push(tweet);
    }
    else {
      console.log('unknow screen_name:', screen_name);
    }
  }
console.log('replySourceTweets: ', replySourceTweets.length);
console.log('(((((((((((((())))))))))))))');

  return replySourceTweets;
};

const getRelatedTweetsPromise = (tweet, lastReplyId) => new Promise((resolve, reject) => {
  // if (!tweet.in_reply_to_status_id_str) {
  //   resolve(null);
  // }

  let url = `https://twitter.com/${options.screen_name}/status/${tweet.id_str}`;

  const headers = {
    'x-overlay-request': true,
  };

  if (lastReplyId) {
    url += '?max_position=${lastReplyId}';
  }

  console.log('try get replies: ', url);

  request({
    url,
    headers,
  }, (err, res, body) => {
    if (err) {
      return reject(err);
    }
    const obj = JSON.parse(body);
    const tweets = _parseRelatedTweetsHTML(obj.page, tweet, (lastReplyId || 'first'));
    return resolve(tweets);
  });
});

const _findSourceTweet = (targetTweet, tweets) => {
  let replyToId = targetTweet.in_reply_to_status_id_str;
  let currentTweet = targetTweet;
  while (replyToId) {
    currentTweet = tweets.find(t => t.id_str === replyToId);
    if (!currentTweet) {
      console.log('Can not find reply to tweet');
      console.log(targetTweet);
      // throw new Error('Can not find reply to tweet');
      replyToId = '';
      return;
    }
    replyToId = currentTweet.in_reply_to_status_id_str;
  }
  return currentTweet;
}

const parseInstagramImages = (tweet) => new Promise((resolve, reject) => {
  const { entities } = tweet;
  if (entities && entities.urls) {
    const instagramUrl = entities.urls.find(url => url.expanded_url && url.expanded_url.includes('www.instagram.com'));
    if (!instagramUrl) {
      console.log('not instagramUrl resolve');
      return resolve();
    }
    console.log('try get detail from instagram');

    request({
      url: instagramUrl.expanded_url,
    }, (err, res, body) => {
      if (err) {
        return reject(e);
      }
      const matches = body.match(/"display_src":\s"([^"]*)/);
      if (matches.length !== 2) {
        return reject(new Error('failed get instagramUrl'))
      }
      const media = [{
        media_url: matches[1],
      }];

      const newUrls = entities.urls.filter(url => url !== instagramUrl);
      tweet.extended_entities = tweet.extended_entities || {};
      tweet.extended_entities.media = media;
      tweet.entities.urls.forEach(u=>{
        tweet.text = tweet.text.replace(u.url, '');
      })
      // tweet.entities.urls = newUrls;
      return resolve();
    })
  }
})

const aggregateConversations = (tweets) => {
  let manipulatedIds = [];
  const _tweets = [];
  tweets.forEach(tweet => {
    if (manipulatedIds.includes(tweet.id_str)) {
      return;
    }

    // find all replies
    const conversation = tweets.filter(t => {
      const sourceTweet = _findSourceTweet(t, tweets);
      const sourceTweetId = sourceTweet.id_str;
      return (tweet.id_str === sourceTweetId);
    }).sort((a,b)=> {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return ta - tb;
    });

    if (conversation.length === 1) {
      // not a conversation
      console.log('not conversation');
      _tweets.push(tweet);
      return;
    }
    else {
      console.log('is conversation');
    }

    const repliesId = conversation.map(rp => rp.id_str);
    manipulatedIds = manipulatedIds.concat(repliesId);

    // let conversation = [];
    // conversation.push(tweet);
    // conversation = conversation.concat(replies);
    _tweets.push(conversation);
  });
  return _tweets;
};

console.log(2);
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
      // console.log(JSON.stringify(filtered, null, 2));
      tweets = tweets.concat(filtered);
    } while (_tweets.length === 200 && isInDateRange(lastTweet, fetchDate));
  }
  catch (e) {
    console.log(e);
  }

  tweets = tweets.reverse();
  tweets = trimTweets(tweets);

  //  find all reply source status
  let _tweets = [];
  try {
    for (const tweet of tweets) {

      // if (tweet.in_reply_to_status_id_str) {
      //   const inReplyTweets = await getRelatedTweetsPromise(tweet);
      //   _tweets = _tweets.concat(inReplyTweets);
      // }
      // else {
      //   console.log('not reply skip');
      // }
      const inReplyTweets = await getRelatedTweetsPromise(tweet);
      _tweets = _tweets.concat(inReplyTweets);
      _tweets.push(tweet);
    }
  }
  catch (e) {
    console.log(e);
  }

  tweets = [];

  // add the private tweet that cant be fetch correctly
  // const hankTweet = {
  //     "id_str": "782049779232538624",
  //     "created_at": "Sat Oct 01 2016 11:15:50 GMT+0800 (CST)",
  //     "user": {
  //         "name": "Mako",
  //         "screen_name": "KazuUem",
  //         "profile_image_url": "https://pbs.twimg.com/profile_images/782057910356455424/zttCctMD_bigger.jpg"
  //     },
  //     "text": "@haruka_kdm919 他のメンバーの握手券を当日はるっぴに変える事が可能になった(完売してないメンバーのみ)。\n逆にはるっぴの券を他のメンバーに変えて握手するのも可能。",
  //     "entities": {
  //         "hashtags": [],
  //         "symbols": [],
  //         "user_mentions": [
  //             {
  //                 "screen_name": "haruka_kdm919",
  //                 "indices": [
  //                     0,
  //                     14
  //                 ]
  //             }
  //         ],
  //         "urls": [],
  //         "lastIndices": 65
  //     },
  //     "in_reply_to_status_id_str": "782048265353080832"
  // }
  // tweets.push(hankTweet);

  _tweets.forEach(tweet => {
    if (!tweets.find(t => {

      return t.id_str === tweet.id_str;
    })) {
      tweets.push(tweet);
    }
  });

  // begin replace instagram with tweet media image
  try {
    for (const tweet of tweets) {
      console.log('try parse instagramUrl');
      // modify the tweet object directly
      await parseInstagramImages(tweet);
    }
  }
  catch (e) {
    console.log(e);
  }

  // begin generate transcript template
  console.log('try generate transcript');
  const transcript = tweets.reduce((a, b) => {
    try{
      if (b.is_quote_status) {
        a.push({
          id_str: b.quoted_status_id_str,
          text: b.quoted_status.text,
          trans: '',
        });
      }

      if (b.retweeted_status) {
        a.push({
          id_str: b.retweeted_status.id_str,
          text: b.retweeted_status.text,
          trans: '',
        });
      }

      a.push({
        id_str: b.id_str,
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

  try {
    tweets = aggregateConversations(tweets);
  }
  catch (e) {
    console.log(e);
  }


  if (tweets.length === 0) {
    console.log('!!!!!!!!!! empty');
    return;
  }

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


