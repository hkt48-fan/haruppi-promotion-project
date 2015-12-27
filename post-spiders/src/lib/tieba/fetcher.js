import requestBase from 'request';
import cheerio from 'cheerio';
import parser from './postParser';

var postPool = [];

var  fetchTiebaPosts = (config)=>{

    var lastPageNumber = null;
    var currentPageNumber = null;
    var request = requestBase.defaults({
        host: 'tieba.baidu.com',
        headers: {
            Cookie: config.cookiesRaw
        }
    })

    /**
     * get page url
     * if no page number asset return page url of current post id
     * @param  {[type]} pageNumber [description]
     * @return {[type]}            [description]
     */
    var buildPageUrl =(pageNumber)=>{
        var baseUrl = 'http://tieba.baidu.com/p/1681906249'
        if (pageNumber) {
            return `${baseUrl}?pn=${pageNumber}`;
        }
        return `${baseUrl}?pid=${config.lastPostId}`;
    }

    return new Promise((resolve, reject)=>{

        var parsePostData =(post)=>{
            var img = post.find('img');
            var imgUrl = img.attr('src');
            img.remove();

            var video = post.find('.video_src_wrapper');
            video.remove();

            var html = post.html();
            var id  = post.attr('id').replace('post_content_', '');

            var raw = {
                tiebaId: id,
                img: imgUrl,
                html: html
            };

            var result = parser.tryParse(raw);
            if (!result.match) {
                return null;
            }
            return result.body;
        }

        var fetchPages = async (nextPageNumber)=>{
            // create fetch url
            var url = buildPageUrl(nextPageNumber);
            console.log('fetch: ' + url);

            request(url, (err, res, body)=>{
                if (err) {
                    reject(err);
                }
                else{
                    var $ = cheerio.load(body, {decodeEntities: false});
                    var skipPost = false;

                    if (!lastPageNumber && !currentPageNumber) {
                        // lastPageNumber is not available try to get it
                        var href = $('.p_thread .l_pager>a:last-child').first().attr('href');

                        var span = $('.p_thread .l_pager>span.tP').first();
                        currentPageNumber = parseInt(span.text());

                        if (href) {
                            var lastPage = parseInt(href.match(/pn=(\d+)/)[1]);
                            lastPageNumber = lastPage;
                        }
                        else{
                            lastPageNumber = currentPageNumber;
                        }

                        skipPost = true;
                    }

                    var posts = $('.d_post_content');
                    posts.each((i, ele)=>{
                        var post = $(ele);
                        var postObj = parsePostData(post);
                        if (postObj) {
                            if (!skipPost) {
                                // console.log('push');
                                postPool.push(postObj);
                            }

                            // console.log(postObj);
                            if (postObj.tiebaId === config.lastPostId) {
                                skipPost = false;
                            }
                        }
                    });
                }

                if (++currentPageNumber <= lastPageNumber) {
                    fetchPages(currentPageNumber);
                }
                else{
                    // console.log('resolve');
                    // console.log(postPool);
                    resolve(postPool);
                }
            })
        }

        fetchPages();
    })
}

export default fetchTiebaPosts;
