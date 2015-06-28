'use strict';

export {searchSend, searchSet, searchCheck, showSeatsDetails};

import * as api from '../api';

export function searchSend(state, data) {
 api.search(state.search())
 .then(function (res) {
   if (res.status != 'ok') {
     state.errorMsg.set(res.message);
     return;
   }

   state.results.set(res.flights);
 })
 .catch(function (err) {
   state.errorMsg.set(err.message);
 });
}

export function searchSet(state, data) {
  for (let p of Object.keys(data)) {
    state.search.put(p, data[p]);
  }
}

export function searchCheck(checkName, state) {
  state.search.put(checkName, !state.search[checkName]);
}

function showSeatsDetails(state) {
  state.selectedFlight.set(0);
}
