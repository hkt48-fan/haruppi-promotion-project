import google from 'googleapis';
import tokens from './.token';
import Agent from 'socks5-https-client/lib/Agent';
import credential from './.credential';
import moment from 'moment';
import fs from 'fs';
import config from './config';

// google.options({
//     proxy: 'http://127.0.0.1:8119/'
// });

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
    credential.client_id,
    credential.client_sectret,
    'urn:ietf:wg:oauth:2.0:oob',

)
oauth2Client.setCredentials(tokens);

var haruppiUserId = '111907069956262615426'
var akbChildrenRoomUserId = '106758056094193397775'
var hktChildrenRoomUserId = '111799140715858863784'

var listParams = {
    userId: haruppiUserId,
    collection: 'public',
    maxResults: '100'
}

var plus = google.plus({version:'v1',auth: oauth2Client});

var fetchPosts = (nextPageToken)=>{
    console.log(`fetch: ${nextPageToken}`);
    var p = Object.assign({}, listParams);
    if (nextPageToken) {
        p.pageToken = nextPageToken;
    }

    plus.activities.list(p, (err,posts)=>{
        if (err) {
            console.log(err);
            return;
        }

        posts.items.forEach(item=>{
            var published = moment(item.published).utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss.SSS');
            var updated = moment(item.updated).utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss.SSS');
            var filename = moment(item.published).utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss');
            // console.log(`processing: ${published}`);

            // if (!/HKT48(.*?)(?=兒玉遥)/.test(item.object.content)) {
            //     if(!/HKT48(.*?)(?=こだまはるか)/.test(item.object.content)){
            //         return;
            //     }
            // }

            var images = [];
            var videos = [];
            // console.log(JSON.stringify(item,null,4));
            if (item.object.attachments) {
                item.object.attachments.forEach(attachment=>{
                    if (attachment.objectType === 'album') {
                        images = attachment.thumbnails.map(thumbnail=>{
                            return thumbnail.image.url;
                        });
                    }
                    else if(attachment.objectType === 'photo'){
                        images.push(attachment.fullImage.url);
                    }
                    else if(attachment.objectType === 'video'){
                        videos.push(attachment.image.url);
                    }
                    else if(attachment.objectType === 'article'){
                        if (!attachment.fullImage) {
                            console.log(attachment);
                            throw new Error()
                        };
                        images.push(attachment.fullImage.url);
                    }
                    else{
                        console.log(JSON.stringify(attachment,null,4));
                    }
                });
            }

            var post = {
                published,
                updated,
                description: item.title,
                content: item.object.content,
                url: item.url,
                images,
                videos
            };

            var filePath = `${config.postSavePath}/${filename}.json`;
            fs.writeFileSync(filePath ,JSON.stringify(post,null,4));
        });

        if (posts.nextPageToken) {
            fetchPosts(posts.nextPageToken);
        }

    });
}

export default fetchPosts;
