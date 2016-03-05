const isAuthenticated = (uid, tid)=>{
  if (uid === 'aaa' && tid === 'bbb') {
    return true;
  }

  return false;
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
    profile: null
  };

  if (isAuthenticated(uid, tid)) {
    result.result = 'ok',
    result.token = 'tokentoken';
    result.profile = getProfileByUid(uid);
  }
  res.send(result);
};

