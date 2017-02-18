import moment from 'moment-timezone';
import {TWITTER_API} from './constants';
import cheerio from 'cheerio';

/**
 * compare date for current tweet date
 * if earier return -1
 * if later return 1
 * if in range return 0
 * if parameter illegal return null
 * @param  {[type]} tweet   [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
const compareTweetDate = (tweet, dateRange) => {
  let result = null;

  if (!tweet) {
    return result;
  }

  const {created_at} = tweet;
  const {start, end} = dateRange;

  const date = new Date(created_at);
  const currentDate = moment(date);

  const isEarly = (currentDate.diff(start) > 0);
  const isLate = (currentDate.diff(end) < 0);

  if (!isEarly && !isLate) {
    result = 0;
  }
  else if (isEarly) {
    result = -1;
  }
  else if (isLate) {
    result = 1;
  }
  return result;
};

// remove useless properties
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

/**
 * check the tweet is in the range of provided date range
 * @param  {[type]} tweet     [description]
 * @param  {[type]} dateRange [description]
 * @return {[type]}           [description]
 */
const isInDateRange = (tweet, dateRange) => {
  if (!tweet) {
    return false;
  }

  const {created_at} = tweet;
  const {start, end} = dateRange;

  const date = new Date(created_at);
  const currentDate = moment(date);

  // console.log(currentDate.format('YYYY-MM-DD'), 'in', dateRange);
  const result = currentDate.diff(start) > 0 &&
    end.diff(currentDate) > 0;

  return result;
};

const filterTweetsInDateRange = (tweets, dateRange) => {
  const result = tweets.filter((t) => isInDateRange(t, dateRange));
  return result;
};

const shouldFetchNextTweetList = (tweets, lastTweet, dateRange) => {
  const hasNextPage = (tweets.length === TWITTER_API.USER_TIMELINE_COUNT);
  const earlierThanDateRange = (compareTweetDate(lastTweet, dateRange) !==1);

  return (hasNextPage && earlierThanDateRange);
};

const parseTweetEntity = (tweetTextElement) => {
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
      && child.attribs.class.includes('twitter-hashtag')) {
      // hashtag
      _text = $(child).text();
      entities.hashtags.push({
        text: _text,
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
    }

    text += _text;
    entities.lastIndices += _text.length;
  });

  return {
    text,
    entities,
  };
};

// todo split to two parts: parseInReplyToTweets, parseUserReplyTweets
const parseRelatedTweetsHTML = (html, sourceTweet, friends) => {

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
    const parsedTweetTextObject = parseTweetEntity(tweetTextElement);


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

    // todo extract following code to createTweetEntity()
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
  });

  // fetch current tweet info
  // replace current tweet.text
  // todo: ??? why overwrite current tweet object
  {
    const tweetElement = $('.permalink-tweet-container');
    const tweetTextElement = tweetElement.find('.tweet-text');
    const parsedTweetTextObject = parseTweetEntity(tweetTextElement);

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
    if (sourceTweet.retweeted_status) {
      // isRetweet add the media to the source tweet
      sourceTweet.retweeted_status.extended_entities = sourceTweet.retweeted_status.extended_entities || extended_entities;
    }
    else {
      sourceTweet.extended_entities = sourceTweet.extended_entities || extended_entities;
    }
    // replace full text when exceed 140 char
    sourceTweet.text = parsedTweetTextObject.text;
  }

  // todo reuse following code with inreplyto
  // fetch permalink replies(other user replies)
  // for now, the function only can get the first reply and may lost useful replies
  {
    // todo fix bug cannot get correct exteded_entities
    // inner block
    const permalinkReplies = $('.permalink-replies .stream');
    const hotThreaded = permalinkReplies.first('.ThreadedConversation .stream-item');
    const hotThreadedTweet = hotThreaded.find('.tweet');

    if (hotThreadedTweet.html() === null) {
      return {};
    }

    const name = hotThreadedTweet.data('name');
    const screen_name = hotThreadedTweet.data('screen-name');
    const id_str = hotThreadedTweet.data('tweet-id').toString();

    const avatarElement = hotThreadedTweet.find('.avatar');
    const profile_image_url = avatarElement.attr('src').replace(/^https:/, 'http:');
    const timestampElement = hotThreadedTweet.find('.tweet-timestamp ._timestamp');
    const _time_ms = timestampElement.data('time-ms');
    const created_at = new Date(+_time_ms).toString();

    const tweetTextElement = hotThreadedTweet.find('.tweet-text');
    const parsedTweetTextObject = parseTweetEntity(tweetTextElement);

    const extended_entities = {
      media: [],
    };

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
    tweet.in_reply_to_status_id_str = sourceTweet.id_str;

    if (friends.includes(screen_name)) {
      replySourceTweets.push(tweet);
      console.log('parsed a tweet from friend', screen_name);
    }
    else {
      console.log('unknow screen_name:', screen_name);
    }
  }
  return replySourceTweets;
};


export {
  // isInDateRange,
  // compareTweetDate,
  trimTweets,
  filterTweetsInDateRange,
  shouldFetchNextTweetList,
  parseRelatedTweetsHTML,
};
