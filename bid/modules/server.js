/*eslint no-console:0*/
import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import session from 'express-session';
import express from 'express';
import cookieParser from 'cookie-parser'

import login from '../modules/api/login';
import photoData from '../libs/photoData';

function renderDocument(props, cb) {
  cb(null, <Document photoData={photoData}  {...props}/>);
}

function getApp(req, res, cb) {
  console.log(cb.toString());
  let renderApp = (props, cb)=>{
    console.log('in render app');
    let user = null;
    if (req.session.user) {
      user = req.session.user;
    }
    cb(null, <RouterContext {...props}/>, { photoData, user });
  };

  cb(null, { renderDocument, routes, renderApp });
}

const server = createServer(getApp);
server.use(cookieParser());
server.use(session({
  secret: 'harurun',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
server.use(express.static('data'));

server.use((req, res, next)=>{
  next();
});

server.post('/api/login', login);

server.start();

