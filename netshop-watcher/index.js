import request from 'request'
import jfs from 'jsonfile'
import fs from 'fs'
import cheerio from 'cheerio'
import path from 'path'
import Agent from 'socks5-http-client/lib/Agent';

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const filename = url.match(/[A-Z]+-\d+-\d+-\d+_p\d+_\d+\.jpg/)[0]
    const filepath = path.join('images', filename)
    // let dontSave = false
    // console.log(filepath)
    request({
      url,
      encoding: 'binary',
      agentClass: Agent,
      agentOptions: {
        socksPort: 8484
      }
    }, (err, res, body) => {
      if (err) {
        reject(err)
      } else if (res.statusCode !== 200) {
        reject('Not image')
      } else {
        fs.writeFileSync(filepath, body, 'binary')
        resolve(filename)
      }
    })
  })
}

const readProductMetadata = (productId) => {
  return new Promise((resolve, reject) => {
    const url = `http://shopping.akb48-group.com/products/detail.php?product_id=${productId}`
    request({
      url,
      agentClass: Agent,
      agentOptions: {
        socksPort: 8484
      }
    }, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        const $ = cheerio.load(body)
        const title = $('meta[name="title"]').attr('content')
        // console.log(title)
        let isHaruppi = false
        let img
        if (typeof title !== 'undefined') {
          isHaruppi = title.includes('兒玉')
          img = $('meta[property="og:image"]').attr('content')
        }

        if (title === 'AKB48グループショップ −AKB48グループ グッズ通販サイト−') {
          // reject('End of Productions')
        }

        const result = {
          isHaruppi,
          title,
          imgUrl: `http:${img}`
        }
        console.log(result)
        resolve(result)
      }
    })
  })
}

(async () => {
  const config = jfs.readFileSync('./config.json')
  let currentProductId = config.product_id
  while (true) {
    console.log('Load: ', currentProductId)
    let img
    try {
      img = await readProductMetadata(currentProductId)
      currentProductId++

      if (!img.isHaruppi) {
        continue
      }

      let currentImageIndex = 1
      while (true) {
        try {
          let url = img.imgUrl.replace(/p\d+/, `p0${currentImageIndex}`)
          currentImageIndex++

          // console.log(url)
          const imagefilename = await downloadImage(url)
          console.log(imagefilename)
        } catch (e) {
          console.log()
          break
        }
      }
    } catch (e) {
      console.log('Break at Production: ', currentProductId)
      break
    }
  }
})()
