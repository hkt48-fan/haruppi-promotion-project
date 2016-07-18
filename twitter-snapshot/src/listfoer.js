import Twitter from 'twitter';
import fs from 'fs';
import moment from 'moment-timezone';


const client = new Twitter({
  consumer_key: 'V8UKgjXG53U3N11wjHPxCpk8X',
  consumer_secret: 'kqXO6D7XzI0d1RYNV5Lzs2gxSAsGrbM0zqmFwnWCbFVCwk1IYh',
  access_token_key: '720503109324304384-Em9EaCVZjtg9WcJqGZm8FNLTXRdxNRX',
  access_token_secret: 'WE5qkcfwSwKmgF8tSrQJJAA4m7p4QudKFF2XjJBL8Llta',
});

const options = {
  screen_name: 'haruka_kdm919',
};

const getFollowerPromise = (cursor) => new Promise((resolve, reject) => {


  const opts = Object.assign({}, options, {
    count: 5000,
    cursor,
  });

  client.get('followers/ids.json', opts, (err, followers, res) => {
    const fo = JSON.parse(res.body);
    console.log();
    resolve(fo);
  });
});

(async () => {
  // let followers = [];

  let nextCursor = null;
  try {
    do {
      console.log('current cursor: ', nextCursor);
      const fo = await getFollowerPromise(nextCursor);
      console.log(fo);
      console.log('get fids: ', fo.ids.length);
      nextCursor = fo.next_cursor;
      console.log('next cursor: ', nextCursor);
      console.log();
    } while(true);
  }
  catch(e) {
    console.log(e);
  }

  console.log('done');
  // console.log(followers.length);
})();
