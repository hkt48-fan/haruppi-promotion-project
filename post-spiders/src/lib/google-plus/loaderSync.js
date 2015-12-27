import fs from 'fs';
import path from 'path';
import moment from 'moment';

var loadGooglePlusPosts = (postsPath, maxDays)=>{

        var posts = [];
        // console.log(postsPath);
        // var dirs = fs.readdirSync(path.join(postsPath))

        // dirs = dirs.filter(f=>/\d+-\d+-\d+\s\d+:\d+:\d+/.test(f));

        var files = [];

        // console.log(__dirname);

        // var dirs = await
        // fs.walk(postsPath).on('data',(item)=>{
        //     dirs.push(item.path);
        // });

        var dirsByMonth = fs.readdirSync(path.join(__dirname, postsPath));
        dirsByMonth.forEach(dir=>{
            var scanPath = path.join(__dirname, postsPath, dir);
            var filesInDir = fs.readdirSync(scanPath);
            // console.log(filesInDir);
            files = files.concat(filesInDir);
            // console.log(files.length);
        });


        if (maxDays) {
            var currentMoment = moment();
            files = files.filter(f=>currentMoment.diff(moment(f,'YYYY-MM-DD HH:mm:ss'), 'days')<maxDays);
        }

        // console.log(files);
        // console.log(maxDays);


        files.forEach(f=>{
            var dirname = f.match(/\d+-\d+/)[0];
            var filePath = path.join(__dirname, postsPath, dirname, f);
            // console.log(filePath);
            var fileData = fs.readFileSync(filePath,'utf8');

            var post = JSON.parse(fileData);
            posts.push(post);
        })
        return posts;
    }

export default loadGooglePlusPosts;