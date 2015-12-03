import fs from 'fs';
import path from 'path';
import moment from 'moment';

var loadGooglePlusPosts =(postsPath, maxDays)=>{

        var posts = [];
        var dirs = fs.readdirSync(path.join(postsPath))
        dirs = dirs.filter(f=>/\d+-\d+-\d+\s\d+:\d+:\d+/.test(f));

        if (maxDays) {
            var currentMoment = moment();
            dirs = dirs.filter(f=>currentMoment.diff(moment(f,'YYYY-MM-DD HH:mm:ss'), 'days')<maxDays);
        }


        dirs.forEach(f=>{
            var filePath = path.join(postsPath,f);
            var fileData = fs.readFileSync(filePath,'utf8');

            var post = JSON.parse(fileData);
            posts.push(post);
        })
        return posts;
    }

export default loadGooglePlusPosts;
