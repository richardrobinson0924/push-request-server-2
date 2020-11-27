#!/usr/bin/env node

/**
 * Module dependencies.
 */
import { app } from './app'
import http from 'http'
import {AddressInfo} from "net";
import {APNS} from "apns2";
import {MockAPNS} from "./tests/mock_apns";

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

export const apnsClient = process.env.NODE_ENV === 'test' ? new MockAPNS() : new APNS({
    team: process.env.APNS_ISS,
    keyId: process.env.APNS_KID,
    signingKey: process.env.APNS_AUTH_KEY,
    host: process.env.APNS_SERVER,
    defaultTopic: process.env.APNS_TOPIC
})