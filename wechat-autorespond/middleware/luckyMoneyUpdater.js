var luckyMoneyStore = require('../lib/luckyMoneyStore');

module.exports = function(req,res,next){
  if (req.method === 'GET') {
    res.end('<!DOCTYPE html><html lang="en"><body><div>' + luckyMoneyStore.token + '<div><form method="POST" action="luckymoney"><input type="text" name="token" value="'+luckyMoneyStore.token+'"><input type="submit" value="update"></form></body></html>');
  }
  else if(req.method === 'POST') {
    console.log(req.body)
    luckyMoneyStore.token = req.body.token;
    res.end('<!DOCTYPE html><html lang="en"><body><div>' + luckyMoneyStore.token + '<div><form method="POST" action="luckymoney"><input type="text" name="token" value="'+luckyMoneyStore.token+'"><input type="submit" value="update"></form></body></html>');
  }
  else {
    res.end('unknown');
  }

};
