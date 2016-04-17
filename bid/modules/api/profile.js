import storage from '../../libs/storage';

export function profile(req, res) {
  let user = req.session.user;

  if (!user) {
    return {
      // not auth
      state: -1
    };
  }
  // console.log('transact');
  // console.log(user);
  let { address } = req.body;

  let result = storage.updateUserProfile(user.uid, { address });

  res.send(result);
}
