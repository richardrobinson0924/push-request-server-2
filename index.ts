#!/usr/bin/env node

/**
 * Module dependencies.
 */
import { app } from './app'
import http from 'http'
import {AddressInfo} from "net";
import {APNS} from "apns2";

/**
 * Get port from environment and store in Express.
 */
app.set('port', process.env.PORT);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(process.env.PORT);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address() as AddressInfo;
    const bind = 'port ' + addr.port;

    console.log(`Listening on ${bind}`)
}

export const apnsClient = new APNS({
    team: process.env.APNS_ISS,
    keyId: process.env.APNS_KID,
    signingKey: process.env.APNS_AUTH_KEY,
    host: process.env.APNS_SERVER
})