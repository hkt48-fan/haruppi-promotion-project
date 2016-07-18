import React from 'react';
import Tweet from './Tweet';

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
                  {props.tweets.map(t => <Tweet key={t.id} tweet={t} trans={props.trans} />)}
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

