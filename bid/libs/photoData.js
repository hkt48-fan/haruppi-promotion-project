import fs from 'fs';

const BASE_PATH = __dirname + '/../data/thumbnail/';

const photoMetadata = fs.readdirSync(BASE_PATH)
    .filter(filename=>/.json$/.test(filename));

const photoData = photoMetadata.map(metaPath=>{
  const json = fs.readFileSync(BASE_PATH + metaPath, 'utf-8');
  const meta = JSON.parse( json);
  return meta;
})

export default photoData;
