import requestBase from 'request';
import fs from 'fs';
import Agent from 'socks5-https-client/lib/Agent';
import moment from 'moment';
import path from 'path';
import _ from 'lodash';

var plusRequest = requestBase.defaults({
    agentClass: Agent,
    strictSSL: true,
    agentOptions:{
        socksHost: '127.0.0.1',
        socksPort: 8484
    }
});

var tiebaRequest = requestBase.defaults({});




var m = moment(process.argv[2],'YYYY-MM-DD');

var dateString = m.format('YYYY-MM-DD');

const postsPath = path.join(__dirname,'posts','tieba-macross');
var dest = path.join(__dirname,'upcoming',dateString);
fs.access(dest,(err)=>{
    if (true ||err) {
        try{
            fs.mkdirSync(dest);
        }
        catch(e){
            console.log(e)
        }


        console.log("created")

        try{

            var plain = '';

            var dirs = fs.readdirSync(postsPath);
            dirs = _.chain(dirs).filter(filename=>{
                var parts = filename.split(' ');
                if (parts.length == 2) {
                    if (parts[0] === dateString) {
                        return true;
                    };
                };
                return false
            }).sortBy('published').value();

            _.forEach(dirs,f=>{
                console.log(f)
                var filePath = path.join(postsPath,f);
                var fileData = fs.readFileSync(filePath, 'utf8');
                var post = JSON.parse(fileData);

                var m = moment(post.published,'YYYY-MM-DD HH:mm:ss');
                if (post.images) {
                    post.images.forEach((imgurl,idx)=>{
                        var imgPath = path.join(dest, `${m.format('HH:mm:ss')}-${(idx+1)}.jpg`);
                        plusRequest.get(imgurl).pipe(fs.createWriteStream(imgPath));
                    })
                }
                else if(post.img){
                    var imgPath = path.join(dest,m.format('HH:mm:ss') + '-1' +'.jpg');
                    tiebaRequest.get(post.img).pipe(fs.createWriteStream(imgPath));
                }

                plain += '<blockquote><span style="font-size: 14px;">';
                plain += post.html.trim().replace(/(<br>){3,}/g,'<br>').replace(/\n/g,'');
                plain += '</span></blockquote>';
                plain += '<p><br/></p>';
            });

        }
        catch(e){
            console.log(e)
        }

        var plainPath = path.join(dest,'plain.txt');
        fs.writeFileSync(plainPath, plain);
        // console.log(dirs)




    }
    else{
        console.log(`target: ${dest} is already existed, please remove it and retry.`);

    }
});






