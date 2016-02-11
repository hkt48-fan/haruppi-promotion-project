import requestLegacy from 'request';
import moment from 'moment';
import fs from 'fs';

const apiUrlBase = 'https://api.7gogo.jp/web/v2/talks/kodama-haruka/posts?limit=200';

const request = (url)=>{
    return new Promise((resolve, reject)=>{
        requestLegacy(url, (err, res)=>{
            if (err) {
                reject(err);
            }
            else{
                resolve(res.body);
            }
        })
    });
};


(async ()=>{
    var dateString = process.argv.slice(-1)[0];
    var fetchDate = moment(dateString, 'YYYY-MM-DD');
    if (!fetchDate.isValid()) {
        console.log('Wrong date format, it should be yyyy-mm-dd');
        return;
    }

    try{
        var responseBody = await request(apiUrlBase);
        var result = JSON.parse(responseBody);
        // console.log(result.data.length);
        var matched = result.data.filter(d=>{
            return moment.unix(d.post.time).startOf('day').isSame(fetchDate.startOf('day'));
        });
        // console.log(matched.length);

        // extract text for translate
        var transcript = [];
        matched.forEach(m=>{
            // console.log(m);
            m.post.body.forEach(b=>{
                var ts = {
                    text: '',
                    trans: ''
                };
                if (b.bodyType === 1) {
                    // text
                    ts.text = b.text;
                }
                else if(b.bodyType === 2){
                    // stame
                    return;
                }
                else if(b.bodyType === 3){
                    // image
                    return;
                }
                else if(b.bodyType === 4){
                    // quotation
                    ts.text = b.comment.comment.body;
                }
                transcript.push(ts);
            })
        });

        fs.writeFileSync('./posts.json', JSON.stringify(matched, null, 4));
        fs.writeFileSync('./transcript.json', JSON.stringify(transcript, null, 4));

    }
    catch(e){
        console.log(e);
    }

})()


