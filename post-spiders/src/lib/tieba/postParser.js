import loadGooglePlusPosts from '../google-plus/loaderSync';
import moment from 'moment';
import _ from 'lodash';
import similarity from 'string-similarity'

var googlePosts=loadGooglePlusPosts('../../../posts/google-plus',60)
console.log("------------");
console.log(googlePosts.length);
console.log();
// async function loadG(){
//     googlePosts =  ;
//     console.log(this.googlePosts.length);
var currentMoment = moment();
// googlePosts = googlePosts.filter(p=>{
//     return currentMoment.diff(moment(p.published),'days')<10
// });
console.log("filtered");
console.log(googlePosts.length);
//     ;
//     console.log("googleposts loaded");
//     console.log(this.googlePosts.length);
// }
// loadG();

class PostParser{
    constructor(){
        this.parsers = [];
    }



    registerParser(id,parser){
        var func = function(post){
            var result = parser(post);
            result.source = id;
            return result;
        }
        this.parsers.push(func);
    }

    tryParse(post){

        for (var i = this.parsers.length - 1; i >= 0; i--) {
            var parser= this.parsers[i];
            var result = parser(post);
            if (result.match) {
                return result;
            }
        };


        // failed match any parser
        //
        console.log("not match any parser", post)
        console.log(post.plain || '');
        // console.log(post.html);
        // throw new Error("post.html error")
        return {
            id: 'default',
            match: false,
            body: {}
        }
    }

}

var postParser = new PostParser();

postParser.registerParser('mobile-mail',function(post){
    var result = {
        body:{},
        match: false
    }
    var lines = post.html.split('<br>');

    // console.log("try mm: " + lines[0]);
    if (lines[0].indexOf('hakata_haruppi@sp.hkt48.jp')===-1) {
        // console.log("mobile mail fail");
        return result;
    }
    // console.log("success mobile-mail");
    var secondLine = lines[1];
    var matchs = secondLine.match(/(\d+年\d+月\d+日 \d+:\d+:\d+)/);
    if (!matchs) {
        console.log('secondLine: ', secondLine);
        throw new Error('parse error')
    }

    var dateString = matchs[1] + ' +0900'

    var m = moment(dateString,'YYYY年MM月DD日 HH:mm:ss Z');

    post.published = m.utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss');

    var content =[];
    lines.slice(2).forEach(line=>{
        var line = line.trim();
        if (line.length > 0) {
            content.push(line);
        };
    })
    // dont delete
    // post.content = content;

    result.body = post;
    result.match =true;
    return result;


});

postParser.registerParser('google-plus', function(post){
    var result = {
        body:{},
        match: false
    }
    var lines = post.html.split('<br>');

    // console.log("try gp: " + lines[0]);
    if (lines[0].trim().indexOf('兒玉遥公开分享')===-1
        && lines[0].trim().indexOf('儿玉遥公开分享')===-1
        && lines[0].trim().indexOf('兒玉遥一般公開で共有しました')===-1
        && lines[0].trim().indexOf('兒玉遥  一般公開')===-1
        && lines[0].trim().indexOf('兒玉遥 一般公開')===-1) {
        // console.log("google+ fail");
        return result;
    }


    // console.log(this);
    // console.log(googlePosts.length);
    var plainHtml = post.html.replace(/<strong>(.*?)<\/strong>/g, '')
    var matched = similarity.findBestMatch(plainHtml, googlePosts.map(p=>p.content));
    console.log("google+ rating: " + matched.bestMatch.rating);
    if (matched.bestMatch.rating < 0.45 ) {
        return result;
    };

    // console.log("google+ success");

    var target = _.find(googlePosts,{content: matched.bestMatch.target})

    // console.log(target);

    // console.log("5%%%%%%%%%%");
    // console.log(post.html);
    // throw new Error("errrrrrrrrrr")

    // post.content = post.html;
    post.published = target.published.replace(/\.\d+$/, '');
    post.images= target.images;
    post.videos= target.videos;
    post.sourceUrl =target.url;

    result.body = post;
    result.match =true;

    return result;
});

export default postParser;
