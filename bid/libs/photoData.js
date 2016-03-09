import parse from 'csv-parse/lib/sync';
import fs from 'fs';
const BASE_PATH = __dirname + '/../data/';

// const photoMetadata = fs.readdirSync(BASE_PATH)
//     .filter(filename=>/.json$/.test(filename));

// const photoData = photoMetadata.map(metaPath=>{
//   const json = fs.readFileSync(BASE_PATH + metaPath, 'utf-8');
//   const meta = JSON.parse( json);
//   return meta;
// })

let inputString = fs.readFileSync(BASE_PATH+'photos.csv');
inputString = '"pid","members"\n' + inputString;
// console.log(inputString);
let photoData = parse(inputString, { columns: true });

photoData = photoData.map(pd=>{
  return {
    pid: pd.pid.replace(/.jpg$/, ''),
    members: pd.members.replace(/\r/g, '')
  };
});

// console.log(photoData);


export default photoData;
