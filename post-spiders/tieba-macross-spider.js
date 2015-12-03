import requestBase from 'request';
import cheerio from 'cheerio';
import fs from 'fs';

import config from './lib/tieba/config';

import parser from './lib/tieba/postParser';
import moment from 'moment';

var request = requestBase.defaults({
    host: 'tieba.baidu.com',
    headers: {
        Cookie: config.cookiesRaw
    }
});

var fromPostId ='79631415504';
var fromPageNum = 201;


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
        tiebaId: id,
        img: imgUrl,
        html: html
    };

    var result = parser.tryParse(raw)

    if (result.match) {
        // console.log(result.source);
        var published = moment(result.body.published).format('YYYY-MM-DD HH:mm:ss')
        var filePath = `./posts/tieba-macross/${published}-${result.source}.json`
        // console.log(filePath);
        fs.writeFileSync(filePath,JSON.stringify(result.body,null,4))


    }
    else{
        console.log("!!!!!!!!nomatch!!!!!!!!");
    }



    return result;
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

