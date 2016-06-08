import fs from 'fs';
import parse from 'csv-parse/lib/sync';

let dirs = fs.readdirSync('./');


let votes = []
dirs.forEach(dir=>{
  if (!dir.endsWith('.csv')) {
    return;
  }

  const content = fs.readFileSync(dir, 'utf8');
  const records = parse(content, {columns: true});
  votes = votes.concat(records);
  // console.log(records);
  console.log(dir + ': ' + records.length);
})

console.log('Total: ', votes.length);
