/*eslint no-console:0*/
import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import session from 'express-session';
// import express from 'express';
import cookieParser from 'cookie-parser';
// import bodyParser from 'body-parser';
import compression from 'compression';

import { login, logout } from '../modules/api/auth';
import { transact } from '../modules/api/transact';
import { profile } from '../modules/api/profile';
import storage from '../libs/storage';
// import users from '../libs/users';

let photoData = storage.getAll();
// console.log(photoData);

function renderDocument(props, cb) {
  cb(null, <Document photoData={photoData} title="每日Happy哈鲁P♪" {...props}/>);
}

function getApp(req, res, cb) {
  let renderApp = (props, cb)=>{
    let user = {};
    let cart = [];
    // console.log(req.sessionID);
    // console.log(req.session);
    if (req.session.user) {
      user = storage.getUser(req.session.user.uid);
      cart = storage.getUserCart(req.session.user.uid);
      // console.log('in server');
      // console.log(user);
    }
    cb(null, <RouterContext {...props}/>, { photoData, user, cart });
  };

  cb(null, { renderDocument, routes, renderApp });
}

const server = createServer(getApp);
server.use(compression());
server.use(cookieParser());
server.use(session({
  secret: 'harurun',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: null
  }
}));
// server.use(express.static('static'));

server.use((req, res, next)=>{
  next();
});

server.post('/api/login', login);
server.get('/api/logout', logout);
server.post('/api/transact', transact);
server.post('/api/profile', profile);

server.start();

