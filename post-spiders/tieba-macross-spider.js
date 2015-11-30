import requestBase from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import config from './lib/tieba/config';

import loadgplus from './lib/google-plus/loader';

var request = requestBase.defaults({
    host: 'tieba.baidu.com',
    headers: {
        Cookie: config.cookiesRaw
    }
});

var invalidPostData = [];

var buildPageUrl = (pageIndex)=>{
    return `${config.baseUrl}?pn=${pageIndex}&ajax=1&t=${Date.now()}`;
};

var getPageData = (pageIndex)=>{
    return new Promise((resolve,reject)=>{
        var url = buildPageUrl(pageIndex);

        request(url,function(err,res,body){
            if (err) {
                reject(err);
            }
            else{
                var $ = cheerio.load(body,{decodeEntities: false});
                resolve($);
            }
        });
    });
}

var writeSinglePost =(postObj)=>{
    var lines = postObj.split('<br>');
    var postBody = [];
    var postLine = '';

    // 0: title
    var parseState = 0;
    for (var i = 0; i< lines.length; i++) {
        var line = lines[i];
        if (line.length === 0) {
            continue;
        }


    }

}

var parsePostData =(post)=>{

    var img = post.find('img');
    var imgUrl = img.attr('src');
    img.remove();

    // var imageSavePath = config.postSavePath;
    // downloadPostImage(imgUrl, imageSavePath);
    var html = post.html();

    var id = post.attr('id').replace('post_content_','');
    var obj = {
        id: id,
        img: imgUrl,
        html: html
    };
    writeSinglePost(obj);
    postsData.push(obj);
}

var parsePageData = ($)=>{
    console.log('in parsePostData');
    var postsData = [];
    var posts = $('.d_post_content');
    posts.each((i,ele)=>{
        var post = $(ele);
        parsePostData(post);
    });

    fs.writeFileSync('./temp.json',JSON.stringify(postsData,null,2));
    console.log('write done');
}

var start = async function(){
    for (var i = 197; i < 200; i++) {
        await getPageData(i).then(parsePageData);
    }
}

start()

