import userdef from '../../data/userdef';

const authenticate = (uid, tid)=>{
  let user = userdef.find(user=>user.uid === uid);
  if (!user) {
    return null;
  }

  if (user.tids.indexOf(tid) === -1) {
    return null;
  }

  return user;
};

const getProfileByUid = ()=>{
  return {
    nickname: null,
    address: null,
    bids:[],
    credit: 0
  };
};

export default (req, res)=>{
  let { uid, tid } = req.body;

  let result = {
    result: null,
    token: null,
    // setCookie: null,
    profile: null,
    user: null
  };

  let user = authenticate(uid, tid);
  if (user) {
    req.session.regenerate(()=>{
      req.session.user = user,
      // console.log('auth!');
      // console.log(user);
      result.user = user;
      result.result = 'ok';
      result.profile = getProfileByUid(uid);
      res.send(result);
    });

  }
  else {
    res.send(result);
  }

};

