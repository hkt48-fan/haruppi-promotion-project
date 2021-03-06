import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from '../modules/routes';
import 'babel-polyfill';

render(
  <Router history={browserHistory} routes={routes}/>,
  document.getElementById('app')
);

