'use strict';

export default resultsTable;

import hg from 'mercury';
import {h} from 'mercury';

export function resultsTable(state) {
  if (!state.results.length) {
    return null;
  }

  return h('table', [
    h('thead', [
      h('tr', [
        h('th', 'Airline'),
        h('th', 'Aircraft Type'),
        h('th', 'Seat Rating'),
        h('th', 'Destination'),
        h('th', 'Price')
      ])
    ]),
    h('tbody', [row(state), showSeats(state)])
  ]);
}


function row(state) {
  let results = [];

  let counter = 0;
  for (let f of state.results) {
    results.push(h('tr', {
      'ev-click': hg.sendClick(state.channels.showSeatsDetails)
    }, [
      h('td', f.airline),
      h('td', f.aircraftType),
      //h('td', seatRating(f.ratingAvailability)),
      h('td', selectBestSeat(state, counter++)),
      h('td', f.destination),
      h('td', f.price)
    ]));
  }

  return results;
}

function seatRating(ratings) {
  let rElems = [];
  for (let r of Object.keys(ratings)) {
    rElems.push(h('span', `${r} - ${ratings[r]}`), h('br'));
  }

  return rElems;
}

function showSeats(state) {
  if (state.selectedFlight < 0) {
    return null;
  }

  let seats = state.results[state.selectedFlight].seats;
  let sRatings = [];
  for (let s of seats) {
    sRatings.push(h('tr', [
      h('td', s[1].rating),
      h('td', s[0])
    ]));
  }

  return sRatings;
}

function selectBestSeat(state, idx) {
  let seats = state.results[idx].seats;
  let seat = null;
  let preferences = ['gree', 'green_yellow', 'yellow', 'white', 'red'];

  for (let p of preferences) {
    for (let s of seats) {
      if (s[1].rating === p) {
        if (p === 'green_yellow') {
          p = '#EBFF2F';
        }

        return h('p', { style: { 'background-color' : p, 'text-align': 'center' }}, s[0]);
      }
    }
  }

  return null;
}
