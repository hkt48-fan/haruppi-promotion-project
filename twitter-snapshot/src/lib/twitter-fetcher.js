import Twitter from 'twitter';
import moment from 'moment-timezone';
import baseRequest from 'request';
import {TWITTER_API} from './constants';
import {
  filterTweetsInDateRange,
  shouldFetchNextTweetList,
  parseRelatedTweetsHTML,
  trimTweets,
} from './utils';


/**
 * Twitter Fetcher module
 */
class TwitterFetcher {
  constructor(options) {
    this.options = options;
    this.client = new Twitter(options.requestOptions);
    this.request = baseRequest.defaults(options.requestOptions.request_options);

    if (!this.options.uid) {
      throw new Error('invalid uid for fetch tweets.');
    }
  }

  _verifyFetchOptions(fetchOptions) {
    // parse arguments
    let {
      start: startString,
      end: endString,
      duration,
    } = fetchOptions;

    const result = {
      status: 'success',
      error: false,
    };

    startString = startString || '';
    endString = endString || '';
    duration = +duration || 1;

    // parse start date
    const start = moment(startString, 'YYYY-MM-DD');
    if (!start.isValid()) {
      result.error = 'invalid start string';
      result.status = 'error';
    }

    // parse end date
    let end = moment(endString, 'YYYY-MM-DD');
    if (!end.isValid()) {
      end = moment(startString, 'YYYY-MM-DD').add(duration, 'day');
    }

    result.data = {
      start,
      end,
    };

    return result;
  }

  _findSourceTweet(targetTweet, tweets) {
    let replyToId = targetTweet.in_reply_to_status_id_str;
    let currentTweet = targetTweet;
    while (replyToId) {
      currentTweet = tweets.find(t => t.id_str === replyToId);
      if (!currentTweet) {
        // console.log(targetTweet);
        // throw new Error('Can not find reply to tweet');
        replyToId = '';
        return;
      }
      replyToId = currentTweet.in_reply_to_status_id_str;
    }
    return currentTweet;
  }

  // call twitter timeline api to get
  _getTweetsPromise(options = {}) {
    return new Promise((resolve, reject) => {
      const {lastTweet, screen_name} = options;
      const opts = {
        screen_name,
        count: TWITTER_API.USER_TIMELINE_COUNT,
      };
      if (lastTweet) {
        opts.max_id = lastTweet.id;
      }

      this.client.get(TWITTER_API.USER_TIMELINE, opts, (err, tweets, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(tweets);
      });
    });
  };

  _getRelatedTweetPromise(tweet) {
    return new Promise((resolve, reject) => {
      const {screen_name, friends} = this.options;
      const url = `https://twitter.com/${screen_name}/status/${tweet.id_str}`;
      const headers = {
        'x-overlay-request': true,
      };

      this.request({
        url,
        headers,
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }
        const obj = JSON.parse(body);
        const html = obj.page;
        const tweets = parseRelatedTweetsHTML(html, tweet, friends);
        return resolve(tweets);
      });
    });
  }

  _fetchConversations(tweets, lastResultTweetsWithReplies = [], lastReplyId) {
    const tweet = tweets.shift(1);
    if (!tweet) {
      return Promise.resolve(lastResultTweetsWithReplies);
    }
    // add current tweet
    lastResultTweetsWithReplies.push(tweet);

    // only fetch the related tweets for first tweet in the given tweets
    // and pass the rest to the next call
    return this._getRelatedTweetPromise(tweet).then((relatedTweets) => {
      // add replies tweets
      const result = lastResultTweetsWithReplies.concat(relatedTweets);
      return this._fetchConversations(tweets, result);
    });
  }

  _getTweetListPromise(dateRange, lastResultTweets = [], lastTweet) {
    const getTweetsOptions = {
      screen_name: this.options.uid,
    };
    if (lastTweet) {
      getTweetsOptions.lastTweet = lastTweet;
    }

    return this._getTweetsPromise(getTweetsOptions).then((tweets) => {
      const lastTweet = tweets.slice(-1)[0];
      const rangedTweets = filterTweetsInDateRange(tweets, dateRange);
      const currentResultTweets = lastResultTweets.concat(rangedTweets);

      // determine should fetch next page
      if (shouldFetchNextTweetList(tweets, lastTweet, dateRange)) {
        getTweetsOptions.lastTweet = lastTweet;
        return this._getTweetListPromise(dateRange, currentResultTweets, lastTweet);
      }
      else {
        const result = trimTweets(currentResultTweets).reverse();
        // return this._fetchConversations(result);
        return Promise.resolve(result);
      }
    });
  }

  _parseInstragramImages(tweets, lastResultTweets = []){
    const tweet = tweets.shift(1);
    if (!tweet) {
      return Promise.resolve(lastResultTweets);
    }
    // the tweet is pushed as an reference
    // after the url update there is no need to do the extra update for lastResutTweets
    lastResultTweets.push(tweet);

    const {entities} = tweet;
    if (entities && entities.urls) {
      const instagramUrl = entities.urls.find((url) => url.expanded_url && url.expanded_url.includes('www.instagram.com'));
      if (!instagramUrl) {
        // not a instragram url try next tweet
        return this._parseInstragramImages(tweets, lastResultTweets);
      }
      this.request({
        url: instagramUrl.expanded_url,
      }, (err, res, body) => {
        if (err) {
          return reject(e);
        }
        const matches = body.match(/"display_src":\s"([^"]*)/);
        if (matches.length !== 2) {
          return reject(new Error('failed get instagramUrl'));
        }
        const media = [{
          media_url: matches[1],
        }];
        tweet.extended_entities = tweet.extended_entities || {};
        tweet.extended_entities.media = media;
        tweet.entities.urls.forEach((u) => {
          tweet.text = tweet.text.replace(u.url, '');
        });
        return this._parseInstragramImages(tweets, lastResultTweets);
      });
    }
  }

  _aggregateConversations(tweets) {
    let manipulatedIds = [];
    const _tweets = [];
    tweets.forEach((tweet) => {
      if (manipulatedIds.includes(tweet.id_str)) {
        return;
      }

      // find all replies
      const conversation = tweets.filter((t) => {
        const sourceTweet = this._findSourceTweet(t, tweets);
        const sourceTweetId = sourceTweet.id_str;
        return (tweet.id_str === sourceTweetId);
      }).sort((a, b)=> {
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        return ta - tb;
      });

      if (conversation.length === 0) {
        // first tweet of conversation, skip it
        console.log('is first tweet of conversation');
      }
      if (conversation.length === 1) {
        // not a conversation
        console.log('not conversation');
        _tweets.push(tweet);
        return;
      }
      else {
        console.log('is conversation');
        const repliesId = conversation.map((rp) => rp.id_str);
        manipulatedIds = manipulatedIds.concat(repliesId);
        _tweets.push(conversation);
      }
    });
    return _tweets;
  }

  _buildTranscript(tweets) {
    // build conversations, remove useless data
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
      }
      return a;
    }, []);
    return transcript;
  }

  /**
   * fetch tweetlist by date range
   * it SHOULD returned as Promise
   * @param  {[type]} fetchOptions [description]
   * @return {[type]}              [description]
   */
  fetch(fetchOptions) {
    const fetchOptionsVerifyResult = this._verifyFetchOptions(fetchOptions);
    if (fetchOptionsVerifyResult.status !== 'success') {
      return Promise.reject(fetchOptionsVerifyResult);
    }
    const dateRange = fetchOptionsVerifyResult.data;
    return this._getTweetListPromise(dateRange)
      .then((tweets) => {
        return this._fetchConversations(tweets);
      })
      .then((tweets) => {
        return this._parseInstragramImages(tweets);
      })
      .then((tweets) => {
        const transcript = this._buildTranscript(tweets);
        const aggregatedTweets = this._aggregateConversations(tweets);
        return Promise.resolve({
          transcript,
          tweets: aggregatedTweets,
        });
      });
  }
}

export default TwitterFetcher;
