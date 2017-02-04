
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

export default {
  getTweets: getTweetsPromise,
};
