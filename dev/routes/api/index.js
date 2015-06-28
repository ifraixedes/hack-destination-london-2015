'use strict';

export default apiRouter;

import {Router as router} from 'express';
import {expressAsyncWrapper as wrap} from '../../lib/util';
import {request} from '../../lib/http';
import dg from 'debug';

function apiRouter(config) {
  let debug = dg(`${config.get('debug').namespace}:route:home`);
  let apiRoute = router();

  apiRoute.get('/search', wrap(async (req, res) => {
    debug('get request');
    let sabre = await sabreAPI();
    let sElem = sabre.EnhancedSeatMapRS.SeatMap[0];
    let seatGuru = await seatGuruAPI(sElem.Flight.Operating.carrier, sElem.Equipment);
    let seatsInfo = combine(sabre, seatGuru);

    res.json({ status: 'ok', flights: [{
      airline: 'American Airlines',
      aircraftType: sElem.Equipment,
      destination: 'LHR => JFK',
      price: '358 £',
      ratingAvailability: seatsInfo.ratingAvailability,
      seats: seatsInfo.seats
    }]});
  }));

  return apiRoute;
}

function sabreAPI() {
  return request({
    method: 'POST',
    host: 'api.test.sabre.com',
    path: '/v3.0.0/book/flights/seatmaps?mode=seatmaps',
    scheme: 'https',
    headers: {
      'Authorization': 'Bearer Shared/IDL: IceSess\\/SessMgr:1\\.0.IDL/Common/!ICESMS\\/ACPCRTD!ICESMSLB\\/CRT.LB!-0123456789012345678!123456!0!ABCDEFGHIJKLM!E2E-1'
    }
  }, {
    'EnhancedSeatMapRQ': {
      'SeatMapQueryEnhanced': {
        'RequestType': 'Payload',
        'Flight': {
          'destination': 'JFK',
          'origin': 'LHR',
          'DepartureDate': {
            'content': '2015-10-10'
          },
          'ArrivalDate': {
            'content': '2015-10-18'
          },
          'Operating': {
            'carrier': 'AA',
            'content': '105'
          },
          'Marketing': [{
            'carrier': 'AA',
            'content': '105'
          }]
        },
        'CabinDefinition': {
          'RBD': 'Y'
        }
      }
    }
  });
}

function seatGuruAPI(airline, aircraft) {
  return request('http://www.seatguru.com/api/aircraftconfigurations/1', {
    key: 'sabrehack',
    airline: airline,
    aircraft: aircraft
  });
}

function combine(sabre, seatGuru) {
  let cabin = sabre.EnhancedSeatMapRS.SeatMap[0].Cabin;
  let aircraft = seatGuru.aircraft[0];

  // Get the standard seat row number ranges
  let seatRowsRanges = [];
  for (let sClass of aircraft.seat_classes) {
    if (sClass.premium === 'standard') {
      seatRowsRanges.push(sClass);
    }
  }

  // Get all the standard seats row numbers
  let standardSeatRows = new Set();
  for (let s of seatRowsRanges) {
    let {start, end} = s;
    for (let i = start; i <= end; i++) {
      standardSeatRows.add(i);
    }
  }

  // Get all the available standar seats
  let availableSeats = new Map();
  for (let seatsRange of cabin) {
    let {firstRow: start, lastRow: end} = seatsRange;
    for (let i = start; i <= end; i++) {
      // Iterate rows for the chunk
      if (standardSeatRows.has(i)) {
        for (let row of seatsRange.Row) {
          for (let rs of row.Seat) {
            availableSeats.set(`${row.RowNumber} ${rs.Number}`, rs);
          }
        }

        break;
      }
    }
  }

  // Take the rating information of the available standard seats
  let numOfSeatsByRating = {};
  for (let seat of aircraft.seats) {
    if (availableSeats.has(seat.seats)) {
      availableSeats.get(seat.seats).rating = seat.rating;
      if (numOfSeatsByRating[seat.rating]) {
        numOfSeatsByRating[seat.rating]++;
      } else {
        numOfSeatsByRating[seat.rating] = 1;
      }
    }
  }

  return {
    ratingAvailability: numOfSeatsByRating,
    seats: Array.from(availableSeats)
  };
}
