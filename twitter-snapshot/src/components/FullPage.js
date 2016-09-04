import React from 'react';
import Tweet from './Tweet';

const renderSingleTweet = (tweet, trans) => {
  return (
    <li className="stream-item">
      <Tweet key={tweet.id} tweet={tweet} trans={trans} />
    </li>
  );
};

const renderConversation = (tweets, trans) => {
  const result = tweets.map((t, i) => {
    let tweetWrapperClassName = 'conversation-tweet-item';
    if (i === 0) {
      tweetWrapperClassName += ' conversation-root';
    }
    else if (i === (tweets.length - 1)) {
      tweetWrapperClassName = 'original-tweet-item';
    }
    return (
      <li className="stream-item">
        <ol className="conversation-module stream-items">
          <li className={tweetWrapperClassName}>
            <Tweet key={t.id} tweet={t} trans={trans} />
          </li>
        </ol>
      </li>
    );
  });
  return result;
};

const FullPage = (props) => (
  <html>
    <head>
      <link href={`file://${__dirname}/../../twitter_core.bundle.css`} rel="stylesheet" />
      <link href={`file://${__dirname}/../../custom.css`} rel="stylesheet" />
    </head>

    <body>
      <div className="Grid">
        <div className="Grid-cell">
          <div className="ProfileTimeline">
            <div className="stream-container">
              <div className="stream">
                <ol className="stream-items">
                  {props.tweets.map((tObj, i) => {
                    if (Array.isArray(tObj)) {
                      return renderConversation(tObj, props.trans);
                    }
                    else {
                      return renderSingleTweet(tObj, props.trans);
                    }
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
);

FullPage.propTypes = {
  tweets: React.PropTypes.array,
  trans: React.PropTypes.array,
};

export default FullPage;

