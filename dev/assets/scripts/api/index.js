'use strict';

export {search};

import {window} from 'global';
import {request as http} from '../lib/http/http';

export function search(params) {
  return http({
    method: 'GET',
    host: window.location.host,
    path: '/api/search'
  }, params);
}
