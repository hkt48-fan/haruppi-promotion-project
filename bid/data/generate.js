var fs = require('fs');

var files = fs.readdirSync('./thumbnail/');

files.forEach(function(file){
    if (!file.includes('.jpg')) {
        return;
    }

    var fileId = file.replace(/.jpg$/, '');
    var filename = './thumbnail/' + fileId;

    if (fs.existsSync(filename)) {
        return;
    }

    var fileContent = {
        id: fileId,
        tags: ['']
    };

    fs.writeFileSync( filename +'.json', JSON.stringify(fileContent, null, 2));
    console.log(file);
})