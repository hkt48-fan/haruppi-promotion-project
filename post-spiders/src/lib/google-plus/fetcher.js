// require("babel-polyfill");

import google from 'googleapis';
import tokens from './.token';
import credential from './.credential';

// import config from './config';

import moment from 'moment';
import fs from 'fs';

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
    credential.client_id,
    credential.client_sectret,
    'urn:ietf:wg:oauth:2.0:oob',
)
oauth2Client.setCredentials(tokens);
var plus = google.plus({version:'v1',auth: oauth2Client});

var haruppiUserId = '111907069956262615426'
var akbChildrenRoomUserId = '106758056094193397775'
var hktChildrenRoomUserId = '111799140715858863784'

var listParams = {
    userId: haruppiUserId,
    collection: 'public',
    maxResults: '100'
}

var isBreak = false;
var postPool = [];

var fetchGooglePlusPosts = (config)=>{
    return new Promise((resolve,reject)=>{
        var fetchPages = async (nextPageToken)=>{
            console.log(`fetch page: ${nextPageToken}`);
            var pageRequestParam = Object.assign({}, listParams);
            if (nextPageToken) {
                pageRequestParam.pageToken = nextPageToken;
            }

            plus.activities.list(pageRequestParam, (err, posts)=>{
                posts.items.some(item=>{
                    var published = moment(item.published).utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss.SSS');
                    var updated = moment(item.updated).utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss.SSS');
                    var images = [];
                    var videos = [];

                    // if (!/HKT48(.*?)(?=兒玉遥)/.test(item.object.content)) {
                    //     if(!/HKT48(.*?)(?=こだまはるか)/.test(item.object.content)){
                    //         return;
                    //     }
                    // }

                    if (item.object.attachments) {
                        item.object.attachments.forEach(attachment=>{
                            switch(attachment.objectType){
                                case 'album':
                                    images = attachment.thumbnails.map(thumbnail=>{
                                        // todo convert tmumbnail url to hi-res url
                                        return thumbnail.image.url;
                                    });
                                    break;
                                case 'photo':
                                    images.push(attachment.fullImage.url);
                                    break;
                                case 'video':
                                    videos.push(attachment.image.url);
                                    break;
                                case 'article':
                                    images.push(attachment.fullImage.url);
                                    break;
                                default:
                                    console.log(JSON.stringify(attachment, null, 4));
                                    throw new Error('failed get post media item.');
                            }
                        })
                    }

                    var postId = item.id;
                    if (config.lastPostId === postId) {
                       return isBreak = true;
                    }

                    var post = {
                        id: postId,
                        published,
                        updated,
                        description: item.title,
                        content: item.object.content,
                        url: item.url,
                        images,
                        videos
                    };

                    // if (isFirstPost) {
                    //     cm.configs.googlePlus.lastPostId = postId;
                    //     isFirstPost = false;
                    // }

                    postPool.push(post);
                });

                if (isBreak) {
                    resolve(postPool);
                }
                else if(posts.nextPageToken){
                    fetchPages(posts.nextPageToken);
                }
                else{
                    resolve(postPool);
                }
            });
        }

        fetchPages();
    })
}

export default fetchGooglePlusPosts;


