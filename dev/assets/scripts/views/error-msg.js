'use strict';

export default errorMsg;

import hg from 'mercury';
import {h} from 'mercury';

export function errorMsg(state) {
  if (!state.errorMsg) {
    return null;
  }

  return h('span', state.errorMsg());
}
