'use strict';

export default homeRouter;

import {Router as router} from 'express';
import {expressAsyncWrapper as wrap} from '../lib/util';
import dg from 'debug';

function homeRouter(config) {
  let debug = dg(`${config.get('debug').namespace}:route:home`);
  let homeRoute = router();

  homeRoute.get('/', wrap(async function (req, res) {
    debug('get request');
    res.render('home', { msg: 'Message from Server' });
  }));

  homeRoute.post('/', wrap(async function (req, res) {
    debug('post request');
    console.log(req.body);
    res.redirect(303, '/');
  }));

  return homeRoute;
}
