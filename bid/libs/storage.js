import photoData from './photos';
import tdb from './transactions';
import udb from './users';

class Storage {
  constructor() {
    let { categories, photos } = photoData;

    let transactions = tdb('transactions').value();
    console.log(transactions);
    this.pids = photos.map(p=>p.pid);
    this.categories = categories;
    this.tdb = tdb;

    this.photos = photos.map(p=>{
      let outOfStock = !!transactions.find(t=>t.pid === p.pid);
      let _photo = Object.assign(p, { outOfStock });
      return _photo;
    });

    this.stockStatus = photos.map(p=>{
      return p.outOfStock?1:0;
    });

  }

  getUser(uid) {
    let user = udb('users').find({ uid });
    if (user) {
      user = {
        uid: user.uid,
        pp: user.pp
      };
    }

    return user;
  }

  redeem(uid, pid) {
    // error status code
    // 0 success
    // 1 corrupted pid
    // 2 out of stock
    // 3 insufficient pp
    let result ={
      state: 0
    };

    let pIndex = this.pids.indexOf(pid);
    if (pIndex === -1) {
      // corrupted pid
      result.state = 1;
      return result;
    }

    let lastStockState = this.stockStatus[pIndex];
    if (lastStockState === '1') {
      // already out of stock
      result.state = 2;
      return result;
    }

    // find current user
    let photo = this.photos[pIndex];
    let user = udb('users').find({ uid });
    if (user.pp < photo.cost) {
      result.state = 3;
      return result;
    }

    user.pp -= photo.cost;
    photo.outOfStock = true;
    this.stockStatus[pIndex] = '1';
    result.stockStatus = this.stockStatus.join('');
    result.pp = user.pp;

    // save to db
    tdb('transactions').push({
      pid,
      uid,
      date: Date.now()
    });
    tdb.write();
    udb.write();

    return result;
  }

  getAll() {
    let result = {
      // stockStatus: this.stockStatus.join(''),
      categories: this.categories,
      photos: this.photos
    };
    return result;
  }
}

export default new Storage();
