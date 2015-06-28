'use strict';

export default searchBox;

import hg from 'mercury';
import {h} from 'mercury';

export function searchBox(state) {
  return h('div.row', [
    h('div.col12', [
      h('div.row', {
        'ev-input': hg.sendChange(state.channels.searchSet)
      }, [
        h('div.col.s6', [
          h('div.row', [
            h('div.col.s12.input-field', [
              h('input#it-from', {
                'value': state.search.from,
                'type': 'text',
                'name': 'from'
              }),
              h('label', { 'htmlFor': 'it-from'}, [ 'From' ])
            ])
          ]),
          h('div.row', [
            h('div.col.s12.input-field', [
              h('input#it-to', {
                'value': state.search.to,
                'type': 'text',
                'name': 'to'
              }),
              h('label', { 'htmlFor': 'it-to'}, [ 'To' ])
            ])
          ])
        ]),
        h('div.col.s6', [
          h('div.row', [
            h('div.col.s12.input-field', [
              h('input', {
                'value': state.search.departure,
                'type': 'date',
                'name': 'departure'
              })
            ])
          ]),
          h('div.row', [
            h('div.col.s12.input-field', [
              h('input.datepicker', {
                'value': state.search.return,
                'type': 'date',
                'name': 'return'
              })
            ])
          ])
        ])
      ])
    ]),
    h('div.row', [
      h('div.col.s2.input-field', [
        h('input#ick-aisle', {
          'type': 'checkbox',
          'ev-click': hg.send(state.channels.searchCheckAisle)
        }),
        h('label', { 'htmlFor': 'ick-aisle'}, [ 'Aisle' ])
      ]),
      h('div.col.s2.input-field', [
        h('input#ick-window', {
          'type': 'checkbox',
          'ev-click': hg.send(state.channels.searchCheckWindow)
        }),
        h('label', { 'htmlFor': 'ick-window'}, [ 'Window' ])
      ]),
      h('div.col.s2.input-field', [
        h('input#ick-exit-row', {
          'type': 'checkbox',
          'ev-click': hg.send(state.channels.searchCheckExit)
        }),
        h('label', { 'htmlFor': 'ick-exit-row'}, [ 'Exit Row' ])
      ]),
      h('div.col.s6.input-field.right-align', [
        h('button.btn.waves-effect.waves-light', {
          'ev-click': hg.send(state.channels.searchSend)
        },  'Search' )
      ])
    ])
  ]);
}
