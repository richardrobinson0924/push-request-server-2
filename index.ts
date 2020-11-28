#!/usr/bin/env node

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/**
 * Module dependencies.
 */
import { app } from './app'
import http from 'http'
import {AddressInfo} from "net";

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