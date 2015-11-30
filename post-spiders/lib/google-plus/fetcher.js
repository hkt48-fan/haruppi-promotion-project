import google from 'googleapis';
import tokens from './.token';
import credential from './.credential';
import moment from 'moment';
import fs from 'fs';
import config from './config';

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
    credential.client_id,
    credential.client_sectret,
    'urn:ietf:wg:oauth:2.0:oob'
)
oauth2Client.setCredentials(tokens);

var haruppiUserId = '111907069956262615426'
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

        // console.log(posts, null, 4)

        posts.items.forEach(item=>{
            var published = moment(item.published).utcOffset('+0600').format('YYYY-MM-DD HH:mm:ss.SSS');
            var updated = moment(item.updated).utcOffset('+0600').format('YYYY-MM-DD HH:mm:ss.SSS');
            var filename = moment(item.published).utcOffset('+0600').format('YYYY-MM-DD HH:mm:ss');
            console.log(`processing: ${published}`);

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
                descript: item.title,
                content: item.object.content,
                url: item.url,
                images
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
