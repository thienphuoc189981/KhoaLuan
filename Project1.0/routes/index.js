"use strict";
/*
 * GET home page.
 */
const express = require('express');
var app = express();
var fs = require('fs');
var nano = require("nano")("http://localhost:5984");
var http = require("http");
function add(req, res) {
}
exports.add = add;
;
function index(req, res) {
    res.render('./index', { title: 'cool' });
}
exports.index = index;
;
//# sourceMappingURL=index.js.map