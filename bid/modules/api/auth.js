// import userdef from '../../data/userdef';
import udb from '../../libs/users';
import storage from '../../libs/storage';

const authenticate = (uid, tid)=>{
  let user = udb('users').find(u=>{
    return u.uid === uid && u.tid.indexOf(tid) !== -1;
  });

  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    pp: user.pp,
    address: user.address
  };
};

const getProfileByUid = (uid)=>{
  return {
    name: '',
    address: '',
    tel: ''
  };
};

export function login(req, res) {
  let { uid, tid } = req.body;

  let result = {
    result: null,
    // token: null,
    profile: null,
    cart: null,
    user: null
  };

  let user = authenticate(uid, tid);
  if (user) {
    let cart = storage.getUserCart(uid);
    req.session.regenerate(()=>{
      req.session.user = user,
      // console.log('auth!');
      // console.log(user);
      result.user = user;
      result.cart = cart;
      result.result = 'ok';
      result.profile = getProfileByUid(uid);
      // console.log(req.session);
      res.send(result);
    });

  }
  else {
    res.send(result);
  }

}

export function logout(req, res) {
  req.session.destroy(err=>{
    let result ={
      err: err,
      result: err? 'fail':'ok'
    };
    res.send(result);
  });
}
