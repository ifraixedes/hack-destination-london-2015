'use strict';

export {app};

import hg from 'mercury';
import {h} from 'mercury';
import * as actions from './actions';
import errorMsg from './views/error-msg';
import searchBox from './views/search-box';
import searchResults from './views/search-results';

export function app() {
  return hg.state({
    search: hg.varhash({
      from: '',
      to: '',
      departure: '',
      return: '',
      aisle: false,
      window: false,
      exit: false
    }),
    results: hg.array([]),
    errorMsg: hg.value(''),
    selectedFlight: hg.value(-1),
    channels: {
      searchSet: actions.searchSet,
      searchSend: actions.searchSend,
      searchCheckAisle: actions.searchCheck.bind(null, 'aisle'),
      searchCheckWindow: actions.searchCheck.bind(null, 'window'),
      searchCheckExit: actions.searchCheck.bind(null, 'exit'),
      showSeatsDetails: actions.showSeatsDetails
    }
  });
}

app.render = function (state) {
  return h('div', [
    h('h1.center-align', {style: { color: '#FF0000', 'font-weight': 'bold' }}, 'AirSeat'),
    errorMsg(state),
    searchBox(state),
    searchResults(state)
  ]);
}
