'use strict';

import hg from 'mercury';
import {document} from 'global';
import {app, render} from './app';

hg.app(document.body.querySelector('div.container'), app(), app.render);
