require('babel-polyfill');

import fetchPosts from './lib/tieba/fetcher';
import configManager from './lib/configManager';
import fs from 'fs';
import path from 'path';
import moment from 'moment';



(async ()=>{
    // console.log('test');
    // console.log(configManager.configs.tieba);
    var config = configManager.configs.tieba;
    var posts = await fetchPosts(config);
    // console.log(posts.length);
    if (posts.length === 0) {
        console.log('no new post');
        return;
    }
    config.lastPostId = posts[posts.length-1].tiebaId;

    // console.log(posts[0].tiebaId);
    // console.log(configManager.configs.tieba);

    // console.log(configManager.configs.tieba.lastPostId);
    // var outdir = configManager.configs.googlePlus.outputPath;

    // console.log(posts.length);
    posts.forEach(post =>{
        // var dirname =
        // var filename =
        //

        // var outputPath = path.join();
        // console.log(post);
        // console.log("try");
        // console.log(post.published);
        var dirname = post.published.match(/\d+-\d+/)[0]
        // console.log(path.join(__dirname ,config.outputPath, dirname));

        try{
            fs.mkdirSync(path.join(__dirname ,config.outputPath, dirname));
        }
        catch(e){
            // console.log(e);
        }


        // console.log('test');

        var filepath = `${config.outputPath}/${dirname}/${post.published}.json`;
        filepath = path.join(__dirname, filepath)
        // console.log(filepath);

        fs.writeFileSync(filepath, JSON.stringify(post, null, 4));
        // console.log("done");
    })

    console.log(posts.length);
    configManager.save()
    console.log('saved');

})();