import fs from 'fs';
import path from 'path';

var postPath = '../posts/google-plus'
var searchPath = path.join(__dirname, postPath)
console.log(searchPath);
var dirs = fs.readdirSync(searchPath);

var htmlString = '<!DOCTYPE html><head><style>html{font-size:12px;}</style></head><body><div class="waterfall">';
var bodyHtml = '';

dirs.forEach(d=>{
    var postDirPath = path.join(searchPath, d);
    var files = fs.readdirSync(postDirPath);
    files.forEach(f=>{
        var filePath = path.join(postDirPath, f);
        var fileData = fs.readFileSync(filePath);
        var fileObj = JSON.parse(fileData);
        var fileHtml = `<div><p><b>${fileObj.published}</b></p><p><blockquote>${fileObj.content}</blockquote></p></div>`;
        bodyHtml += fileHtml;
    })
})

htmlString += bodyHtml;
htmlString += '</div></body></html>';

fs.writeFileSync('./fullGooglePlus.html', htmlString);