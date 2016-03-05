/*eslint no-console:0*/
import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import session from 'express-session';

import login from '../modules/api/login';

function renderDocument(props, cb) {
  cb(null, <Document {...props}/>);
}

function renderApp(props, cb) {
  cb(null, <RouterContext {...props}/>);
}

function getApp(req, res, cb) {
  cb(null, { renderDocument, routes, renderApp });
}

const server = createServer(getApp);
server.use(session({ secret: 'harurun', cookie: { maxAge: 60000 } }));

server.post('/api/login', login);

server.start();

