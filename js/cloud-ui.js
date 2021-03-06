/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2015-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/* global uDom, faIconsInit */

'use strict';

/******************************************************************************/

(( ) => {

/******************************************************************************/

self.cloud = {
    datakey: '',
    data: undefined,
    onPush: null,
    onPull: null
};

/******************************************************************************/

const widget = uDom.nodeFromId('cloudWidget');
if ( widget === null ) { return; }

self.cloud.datakey = widget.getAttribute('data-cloud-entry') || '';
if ( self.cloud.datakey === '' ) { return; }

/******************************************************************************/

const onCloudDataReceived = function(entry) {
    if ( entry instanceof Object === false ) { return; }

    self.cloud.data = entry.data;

    uDom.nodeFromId('cloudPull').removeAttribute('disabled');
    uDom.nodeFromId('cloudPullAndMerge').removeAttribute('disabled');

    const timeOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
    };

    const time = new Date(entry.tstamp);
    widget.querySelector('[data-i18n="cloudNoData"]').textContent =
        entry.source + '\n' +
        time.toLocaleString('fullwide', timeOptions);
};

/******************************************************************************/

const fetchCloudData = function() {
    vAPI.messaging.send('cloud-ui.js', {
        what: 'cloudPull',
        datakey: self.cloud.datakey
    }).then(response => {
        onCloudDataReceived(response);
    });
};

/******************************************************************************/

const pushData = function() {
    if ( typeof self.cloud.onPush !== 'function' ) { return; }
    vAPI.messaging.send('cloud-ui.js', {
        what: 'cloudPush',
        datakey: self.cloud.datakey,
        data: self.cloud.onPush()
    }).then(( ) => {
        fetchCloudData();
    });
};

/******************************************************************************/

const pullData = function(ev) {
    if ( typeof self.cloud.onPull === 'function' ) {
        self.cloud.onPull(self.cloud.data, ev.shiftKey);
    }
};

/******************************************************************************/

const pullAndMergeData = function() {
    if ( typeof self.cloud.onPull === 'function' ) {
        self.cloud.onPull(self.cloud.data, true);
    }
};

/******************************************************************************/

})();
