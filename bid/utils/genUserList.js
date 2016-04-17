import parse from 'csv-parse/lib/sync';
import fs from 'fs';
const BASE_PATH = __dirname + '/../data/';

let inputString = fs.readFileSync(BASE_PATH+'rawtrans.csv', 'utf-8');
inputString = 'uid,tid,amount\n' + inputString.replace(/^\uFEFF/, '');
let userDataRaw = parse(inputString, { columns: true });

const uniq = (array) => {
  return array.filter((elem, pos, arr) => {
    return arr.indexOf(elem) == pos;
  });
};

let userList = [];

userDataRaw.forEach(user=>{
  let u = userList.find(uu=>uu.uid === user.uid);

  let pp = user.amount/77;
  // let tid = user.tid;

  if (u) {
    u.pp += pp;
    u.tid.push(user.tid);
  }
  else {
    u={
      uid: user.uid,
      tid: [].concat(user.tid),
      pp: pp
    };
    userList.push(u);
  }


});
fs.writeFileSync(BASE_PATH+'users.json', JSON.stringify({users: userList}, null, 2));

// console.log(userList);

// let categories = uniq(photoDataRaw.map(p=>p.category.trim()));
// let photos = photoDataRaw.map(p=>{
//   return {
//     pid: p.pid.replace(/.jpg$/, ''),
//     members: p.members.replace(/\r/g, ''),
//     category: p.category.trim(),
//     details: p.details.trim(),
//     cost: parseInt(p.cost)
//   };
// });


// export default {
//   categories,
//   photos
// };
