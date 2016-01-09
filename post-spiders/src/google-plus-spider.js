require('babel-polyfill');

import fetchPosts from './lib/google-plus/fetcher';
import configManager from './lib/configManager';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';

(async ()=>{
    var posts = await fetchPosts(configManager.configs.googlePlus);
    configManager.configs.googlePlus.lastPostId = posts[0].id;
    var outdir = configManager.configs.googlePlus.outputPath;

    posts.forEach(post =>{
        var dirname = moment(post.published).utcOffset('+0800').format('YYYY-MM');
        var filename = moment(post.published).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss') + '.json';

        var outPath = path.join(__dirname, outdir, dirname);

        fs.mkdirsSync(outPath);
        fs.writeFileSync(outPath + '/'+ filename, JSON.stringify(post, null, 4));
    });

    configManager.save();
    console.log('done');
})()