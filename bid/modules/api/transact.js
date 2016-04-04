import storage from '../../libs/storage';

export function transact(req, res) {
  let user = req.session.user;

  if (!user) {
    return {
      // not auth
      state: -1
    };
  }
  // console.log('transact');
  // console.log(user);
  let { pid } = req.body;

  let result = storage.redeem(user.uid, pid);
  console.log(result);

  res.send(result);
}
