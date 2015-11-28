import requestBase from 'request';
import cheerio from 'cheerio';
import fs from 'fs';

const baseUrl = 'http://tieba.baidu.com';
const imageDirPath = './images/';
const postsJsonPath = './posts.json';
const cooikesRaw = 'userFromPsNeedShowTab=1; BAIDU_DUP_lcr=https://www.google.com/; BAIDUID=D32DA1484F6D1A7F09F29DE280717374:FG=1; BIDUPSID=D32DA1484F6D1A7F09F29DE280717374; TIEBA_USERTYPE=fa1d9a0f62a961a9978c0a44; bdshare_firstime=1427201462602; TIEBAUID=1f2164d14a22a45121d8d1fc; BDRCVFR[-O_nYgebYbt]=I67x6TjHwwYf0; BDRCVFR[Eq5YJLkyeqs]=I67x6TjHwwYf0; BDRCVFR[Uvr6qPpdgBn]=I67x6TjHwwYf0; BDUSS=RMd3pxfkw3Z1ZJSnFBQWlybUtLYmxXTXFUbWxUbzEtRHZiV214OXdCVGpOMTlWQVFBQUFBJCQAAAAAAAAAAAEAAACC1fw0TGFydmF0YcDqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOOqN1XjqjdVcU; PSTM=1432729637; rpln_guide=1; Hm_lvt_f4165db5a1ac36eadcfa02a10a6bd243=1438789556; Hm_lpvt_f4165db5a1ac36eadcfa02a10a6bd243=1438789763; dlBubbleFlag=1; platform_float_hide_ç¾åº¦è´´å§ç²ä¸è=1; IS_NEW_USER=5a13ed6637114210a2da1199; BAIDU_WISE_UID=wapp_1443762608248_572; CLIENTWIDTH=1239; CLIENTHEIGHT=1278; SEENKW=nexus6p; mo_originid=2; USER_JUMP=2; SET_PB_IMAGE_WIDTH=1420; BAIDU_DUP_lcr=https://www.google.com/; H_PS_PSSID=1453_12772_17291_17246_17235_17001_17004_17072_15168_17348_11467_17351_16009_17421_17051; wise_device=0';

var lastPage = 193;
var lastPost = 100;

var postsData = [];

var request = requestBase.defaults({
    host: 'tieba.baidu.com',
    headers: {
        Cookie: cooikesRaw
    }
});


var buildPageUrl = function(pageIndex){
    return `${baseUrl}/p/1681906249?pn=${pageIndex}&ajax=1&t=${Date.now()}`;
};

var getPageData = function(pageIndex,cb){
    var url = buildPageUrl(pageIndex);

    request(url,function(err,res,body){
        if (err) {
            cb(err);
        }
        else{
            var $ = cheerio.load(body,{decodeEntities: false});
            cb(null,$);
        }
    });
};


var downloadPostImage = function(imgUrl){
    if (!imgUrl) {
        return;
    }
    var filename = imgUrl.split('/').slice(-1).toString();
    request(imgUrl).pipe(fs.createWriteStream(imageDirPath + filename));
};

var doInit = function(){
    try{
        fs.accessSync(imageDirPath, fs.F_OK);
    }
    catch(e){
        fs.mkdir(imageDirPath);
    }
};



doInit();

getPageData(lastPage,(err,$)=>{
    if (err) {
        console.log(err);
    }
    else{
        var posts = $('.d_post_content');
        posts.each((i,ele)=>{
            var post = $(ele);
            var img = post.find('img');
            var imgUrl = img.attr('src');
            img.remove();

            downloadPostImage(imgUrl);
            var html = post.html();

            var id = post.attr('id').replace('post_content_','');
            var obj = {
                id: id,
                img: imgUrl,
                html: html
            };

            postsData.push(obj);
        });

        fs.writeFileSync(postsJsonPath,JSON.stringify(postsData,null,2));

    }
});

