import express from 'express';
import passport from 'passport';
import path from 'path';

const app = express();

const staticPath = 'static/';

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));


app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.use('/',express.static(path.join(__dirname,staticPath)));

app.use('/',function(req,res,next){
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});





const server = app.listen(5463,function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});