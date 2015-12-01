import requestBase from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import config from './lib/tieba/config';

import loadGooglePlusPosts from './lib/google-plus/loader';

var request = requestBase.defaults({
    host: 'tieba.baidu.com',
    headers: {
        Cookie: config.cookiesRaw
    }
});

var fromPostId ='79631415504';
var fromPageNum = 201;

var gplusPosts = [];
loadGooglePlusPosts('./posts/google-plus').then();

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

    var lines = postObj.html.split('<br>');
    postObj.html = lines[0]
    console.log(postObj);

}

var parsePostContent=(raw)=>{

}


var parsePostDataActived = false;
var parsePostData =(post)=>{

    var img = post.find('img');
    var imgUrl = img.attr('src');
    img.remove();

    // var imageSavePath = config.postSavePath;
    // downloadPostImage(imgUrl, imageSavePath);
    var html = post.html();

    var id = post.attr('id').replace('post_content_','');
    if (id === fromPostId) {
        parsePostDataActived = true;
    };

    if (!parsePostDataActived) {
        return;
    };

    var raw = {
        id: id,
        img: imgUrl,
        html: html
    };

    var obj = parsePostContent(raw)
    // postsData.push(obj);

    // writeSinglePost(obj);

    return obj;
}

var parsePageData = ($)=>{
    console.log('in parsePostData');
    var postsData = [];
    var posts = $('.d_post_content');
    posts.each((i,ele)=>{
        var post = $(ele);
        var obj = parsePostData(post);

        postsData.push(obj);
    });

    fs.writeFileSync('./temp.json',JSON.stringify(postsData,null,4));
    console.log('write done');
}


var getLastPageNum = ()=>{
    return new Promise((resolve,reject)=>{
        var url = buildPageUrl(1);

        request(url,function(err,res,body){
            if (err) {
                reject(err);
            }
            else{
                var $ = cheerio.load(body,{decodeEntities: false});
                var href = $('.p_thread .l_pager>a:last-child').first().attr('href');
                var lastPage = parseInt(href.match(/pn=(\d+)/)[1]);
                resolve(lastPage);
            }
        });
    })
}

var start = async function(){
    var lastPage = await getLastPageNum();
    for (var i = fromPageNum; i <= lastPage; i++) {
        console.log(`page: ${i}`);
        await getPageData(i).then(parsePageData);
    }
}

start()

