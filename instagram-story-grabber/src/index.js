// import readline from 'readline';
const fs = require('fs');
const url = require('url');
const request = require('request');
const moment = require('moment');
const { V1 } = require('instagram-private-api');
const config = require('../config');

const INSTAGRAM_HARUPPI_ID = 3469541695;
const SAVED_MEDIA_PATH = 'saved_media';
// const PROXY = 'http://127.0.0.1:8119';
const PROXY = null;
//
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

const CONST_ENDPOINT = {
  USER_STORY: 'feed/reels_media/',
  STORY_TRAY: 'feed/reels_tray/',
};



const Client = V1;
// const { Session, Request,  } = V1;
const device = new Client.Device(config.username);
const storage = new Client.CookieFileStorage(`${__dirname}/cookies.json`);

// const answerQuestionPromise = (challenge, question) => new Promise((resolve, reject) => {
//   rl.question(question, (answer) => {
//     resolve({
//       answer,
//       challenge,
//     });
//     rl.close();
//   });
// });

// const challengeMe = (error) => {
//   return Client.Web.Challenge.resolve(error)
//     .then((challenge) => {
//       // challenge instanceof Client.Web.Challenge
//       console.log('challenge type', challenge.type);
//       // can be phone, email, or captcha
//       // let's assume we got email
//       if (!challenge.type !== 'email') return;
//       // Will send request to send email to you
//       // email will be one associated with your account
//       console.log('send ');
//       return challenge.email();
//     })
//     .then((challenge) => {

//       // let user answer the verification code
//       const questionText = 'Input the verification you received.';
//       return answerQuestionPromise(challenge, questionText);
//     })
//     .then((result) => {
//       const { answer, challenge } = result;
//       console.log('the answer is ', answer);
//       return challenge.code(answer);
//     })
//     .then((challenge) => {
//       // Yey Instagram accepted the code
//       // now we confirmed that Instagram is happy, weird :P
//       console.log('start confirmation');
//       return challenge.confirmate();
//     })
//     .then((challenge) => {
//       // And we got the account confirmed!
//       // so let's login again
//       console.log('challenged');
//       console.log(challenge);
//       // return loginAndFollow(device, storage, user, password);
//     });
// };

// console.log('test');
// Client.Session.create(device, storage, USER_ID, USER_PWD)
//   .then((session) => {
//     // console.log(session);
//     // return [session, Client.Account.se]
//     console.log('session successed');
//   })
//   .catch(Client.Exceptions.CheckpointError, (error) => {
//     console.log('CheckpointError, do challengeMe');
//     return challengeMe(error);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// const StoryTray = (session) => {
//   this.session = session;
// };

// StoryTray.prototype.get = () => {
//   console.log('test');
//   return new Client.Request(this.session)
//     .setMethod('GET')
//     .setResource('StoryTray')
//     .send()
//     .then((data) => {
//       console.log('StoryTray result; ', data);
//       const media = data.items.map((medium) => {
//         return new Client.Media(this.session, medium);
//       });
//       return media;
//     });
// }

// class StoryTray {
//   constructor(session) {
//     this.session = session;
//   }

//   get() {
//     console.log('test');
//     return new Client.Request(this.session)
//       .setMethod('GET')
//       // .setResource('StoryTray')
//       .setUrl(CONST_ENDPOINT.STORY_TRAY)
//       .then((data) => {
//         console.log('StoryTray result; ', data);
//         const media = data.items.map((medium) => {
//           return new Client.Media(this.session, medium);
//         });
//         return media;
//       });
//   }
// }

const getStoryTray = (session) => {
  // build url
  const u = `https://i.instagram.com/api/v1/${CONST_ENDPOINT.STORY_TRAY}`;
  // console.log('seturl', url);

  return new Client.Request(session)
    .setMethod('GET')
    .setUrl(u)
    .send()
    .then((data) => {
      if (data.tray.length === 0) {
        return [];
      }
      console.log('story success');
      const stories = data.tray[0].items.filter(s => {
        return true;
      });
      return stories;
    });
};



// console.log('test');
// Client.Session.create(device, storage, USER_ID, USER_PWD, PROXY)
//   .then((session) => {
//     return getStoryTray(session);
//   })
//   .then((stories) => {
//     // get the high quality videos
//     const hqs = stories.map(s => {
//       const hq = s.video_versions
//         .sort((a, b) => b.width - a.width);
//       const result = hq[0];
//       result.id = s.id;
//       return result;
//     });

//     console.log(hqs);
//   })
//   .catch(Client.Exceptions.CheckpointError, (error) => {
//     console.log('CheckpointError, please allow the access on your other device');
//   })
//   .catch((e) => {
//     console.log(e);
//   });

const perserveMedia = (media) => {
  const path = `${__dirname}/../${SAVED_MEDIA_PATH}`;
  media.forEach(m => {
    console.log(m.url);
    const d = moment(m.takenAt);
    // console.log(m.takenAt);
    const datePerfix = d.format('YYYY-MM-DD');
    const u = url.parse(m.url);
    const match = u.pathname.match(/\.(\w+)$/);
    // console.log(match);
    const ext = match[1];
    const mediaPath = `${path}/${datePerfix}_${m.id}.${ext}`;
    // console.log(mediaPath);
    // check media exists
    if (fs.existsSync(mediaPath)) {
      console.log('exists\n');
      return;
    }
    console.log('download\n');
    // download
    // console.log(m.url);
    request(m.url).pipe(fs.createWriteStream(mediaPath));
  })
}

(async() => {
  try {
    const session = await Client.Session.create(device, storage, config.username, config.password, PROXY);
    const timer = setInterval(async () => {
      try {
        const stories = await getStoryTray(session);
        // get the high quality videos
        // console.log(stories);
        const hqs = stories.filter(s => s.user.pk === INSTAGRAM_HARUPPI_ID).map(s => {
          console.log(JSON.stringify(s.image_versions2, null, 2));
          // there are two types media of story
          // 1. video: video_versions
          // 2. picture: image_versions2
          let hq = null;
          if (s.video_versions) {
            hq = s.video_versions.sort((a, b) => b.width - a.width);
          }
          else if(s.image_versions2){
            hq = s.image_versions2.candidates.sort((a, b) => b.width - a.width);
          }

          const result = hq[0];
          result.id = s.id;
          result.takenAt = s.taken_at*1000;
          return result;
        });
        // console.log(hqs);
        perserveMedia(hqs);
        console.log('output stories: ', new Date());


        const feed = new Client.Feed.UserMedia(session, INSTAGRAM_HARUPPI_ID);
        const tl = await feed.get();
        const images = tl.map(media => {
          const hq = media._params.images.sort((a, b) => b.width - a.width);
          const result = hq[0];
          result.id = media._params.id;
          result.takenAt = media._params.takenAt;
          return result;
        })
        // console.log('tl',images);

        perserveMedia(images);
        console.log('output images: ', new Date());
      }
      catch(e){
        console.log(e);
      }
    }, 1000 * 60 * 15);

    // while(true){};
  }
  catch(e){
    console.log(e);
  };

})();


