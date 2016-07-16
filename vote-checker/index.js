import requestDefault from 'request';
import fs from 'fs';
import path from 'path';
import { Iconv } from 'iconv';
import json2csv from 'json2csv';

const candidate = 4107;
const voteURL = 'http://akb48-sousenkyo.jp/web/akb2016/vote/thanks';
const votePageURL = 'http://akb48-sousenkyo.jp/web/akb2016/vote/show?c=' + candidate;
// const myJar = request.jar();
const request = requestDefault.defaults({
  jar: true,
  // proxy: 'http://127.0.0.1:8887',
});

let myJar;

const checkSingleVote = (sn, { xsrf }) => {
  return new Promise((resolve, reject) => {
    const detect = '%94%BB%92%E8';
    const postBody = `vote_form_candidate_code=${candidate}&detect=${detect}&vote_form_sys.xsrf=${xsrf}&vote_form_serial_code_1=${sn.sna}&vote_form_serial_code_2=${sn.snb}`;

    // console.log(postBody);
    request({
      // jar: myJar,
      method: 'POST',
      url: voteURL,
      body: postBody,
      followAllRedirects: true,
      headers: {
        // Host: 'akb48-sousenkyo.jp',
        // 'Content-Length': 189,
        // Pragma: 'no-cache',
        // 'Cache-Control': 'no-cache',
        // Origin: 'http://akb48-sousenkyo.jp',
        // 'Upgrade-Insecure-Requests': 1,
        // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2729.3 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        // Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        // Referer: 'http://akb48-sousenkyo.jp/web/akb2016/vote/show?c=4107',
        // 'Accept-Encoding': 'gzip, deflate',
        // 'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6,zh-CN;q=0.4,zh;q=0.2',
        // Cookie: null,
      },
      encoding: null,
    }, (err, res, _body) => {
      const body = new Iconv('shift_JIS', 'UTF-8//TRANSLIT//IGNORE')
        .convert(_body)
        .toString();

      // fs.writeFileSync('out.txt', body);
      // console.log(body);

      const result = {
        sna: sn.sna,
        snb: sn.snb,
        tag: sn.fn,
        currentMember: false,
        checked: false,
      };

      // console.log(body);
      if (body.includes('無効なアクセス')) {
        console.log('無効なアクセス');
      }

      if (body.includes('既に投票済みです')) {
        // console.log(body);
        result.checked = true;
        // result.currentMemeber = false;
      } else if (body.includes('既に投票されています')) {
        result.checked = true;
        result.currentMember = true;

        const matches = body.match(/投票日時：(\d+-\d+-\d+\s\d+:\d+:\d+)/);
        // console.log(matches);
        if (matches.length === 2) {
          result.voteDate = matches[1];
        }
      }
      resolve(result);
    });
  });
};

const getXSRF = () => {
  return new Promise((resolve, reject) => {
    request(votePageURL, (err, res, body) => {
      // console.log(res.headers);
      const matchs = body.match(/name=\"vote_form_sys.xsrf\"\svalue=\"(.*)\"/);
      let xsrf;
      if (matchs.length === 2) {
        xsrf = matchs[1];
        // console.log('xsrf: ', xsrf);
        resolve({ xsrf });
      } else {
        // console.log('failed to parse xsrf');
        reject('failed to parse xsrf');
      }
    });
  });
};


const loadSN = (filepath, filename) => {
  // console.log('parse: ', filepath);
  const fileData = fs.readFileSync(filepath, 'utf8');
  const list = fileData.split('\n');
  const result = [];
  list.forEach(line => {
    if (line.length === 0) {
      return;
    }
    const match = /^.{8}\s.{8}/.test(line);
    if (match) {
      const parts = line.split(' ');
      const sn = {
        sna: parts[0].trim(),
        snb: parts[1].trim(),
        fn: filename,
      };
      result.push(sn);
    } else {
      // console.log(match);
      console.log('unknow sn: ', line);
    }
  });

  return result;
};

const listPath = './list';

const sleep = (ts) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ts);
  });
};


async function check(sn) {
  // console.log(sn);
  myJar = requestDefault.jar();
  // console.log('flush cookies.');
  const auth = await getXSRF();
  const result = await checkSingleVote(sn, auth);
  // console.log(result);
  return result;
}

(async () => {
  if (fs.existsSync(listPath)) {
    const dirs = fs.readdirSync(listPath);

    for (const filename of dirs) {
      if (filename.startsWith('.')) {
        console.log(`skip: ${filename}`);
        continue;
      }
      let list = [];
      list = list.concat(loadSN(path.join(listPath, filename), filename));
      console.log(`start: ${filename} (${list.length})`);
      const rresult = [];

      for (const sn of list) {
        // console.log(sn);
        const result = await check(sn);
        await sleep(30000);

        console.log(result);
        console.log('----------------');
        rresult.push(result);
      }

      const fields = ['checked', 'sna', 'snb', 'voteDate', 'currentMember', 'tag'];
      json2csv({ data: rresult, fields }, (err, csv) => {
        fs.writeFileSync(`out/${filename}.csv`, csv);
      });
    }
  }
  console.log('alldone');
})();
