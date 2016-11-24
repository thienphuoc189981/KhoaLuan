/*
 * GET home page.
 */
import express = require('express');
var app = express();
var fs = require('fs');
var nano = require("nano")("http://localhost:5984");
var http = require("http");
export function add(req: express.Request, res: express.Response) {
           
};

export function index(req: express.Request, res: express.Response) {
    res.render('./index');
};

