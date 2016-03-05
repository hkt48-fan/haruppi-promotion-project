import fs from 'fs';

const photoList = fs.readdirSync('../data/thumbnail')
    .filter(filename=>/.json$/.test(filename));

export default ()=>{
    console.log(photoList);

};

