import fs from 'fs';
import path from 'path';

var loadGooglePlusPosts =(postsPath)=>{

    return new Promise((resolve,reject)=>{



        var posts = [];
        var fileCounter = 0;
        fs.readdir(path.join(postsPath),(err,dirs)=>{
            // console.log(dirs);

            dirs = dirs.filter(f=>/\d+-\d+-\d+\s\d+:\d+:\d+/.test(f));

            fileCounter = dirs.length;
            dirs.forEach(f=>{
                var filePath = path.join(postsPath,f);
                fs.readFile(filePath,'utf8',(err,data)=>{
                    if (err) {
                        reject(err);
                        return;
                    }
                    var post = JSON.parse(data);
                    posts.push(post);
                    fileCounter--;

                    if (fileCounter === 0) {
                        resolve(posts);
                    }
                    else{
                        // console.log(`remains: ${fileCounter}`);
                    }
                })
            })

        })

    });

}


export default loadGooglePlusPosts;
