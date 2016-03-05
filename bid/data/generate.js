var fs = require('fs');

var files = fs.readdirSync('./thumbnail/');

files.forEach(function(file){
    if (!file.includes('.jpg')) {
        return;
    }

    var filename = file.replace(/.jpg$/, '');
    filename = './thumbnail/' + filename;

    if (fs.existsSync(filename)) {
        return;
    }

    var fileContent = {
        id: filename,
        tags: ['']
    };

    fs.writeFileSync( filename +'.json', JSON.stringify(fileContent, null, 2));
    console.log(file);
})