#!/usr/bin/env node

/**
 * Module dependencies.
 */
import { app } from './app'
import http from 'http'
import {AddressInfo} from "net";

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