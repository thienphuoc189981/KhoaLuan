/*
 * GET home page.
 */
"use strict";
const database_1 = require("./database");
let api = new database_1.Project.api();
const express = require('express');
var app = express();
var fs = require('fs');
var http = require("http");
function add(req, res) {
}
exports.add = add;
;
function index(req, res) {
    res.render('./index');
}
exports.index = index;
;
function indexAds(req, res) {
    console.log("ads " + req.session.username);
    if (req.session.username) {
        let json = [];
        api.indexView("categoriesAll").then(function (data) {
            data.rows.forEach(function (item) {
                json.push(item.key);
            });
            console.log(json);
            res.render('./postAds', { cats: json });
        });
    }
    else {
        res.render('./login', { nextlink: './postAds' });
    }
}
exports.indexAds = indexAds;
;
function postAds(req, res) {
    var val = req.body;
    val.attachment = req.file.path;
    val.type = "jobs";
    val.status = "post";
    api.insertData(val);
    console.log(val);
    res.render('./postingSuccess');
}
exports.postAds = postAds;
;
function loginPage(req, res) {
}
exports.loginPage = loginPage;
function login(req, res) {
    var val = req.body;
    var mess;
    var sess = req.session;
    api.findData(val.email, "usersByEmail").then(function (result) {
        console.log(result);
    });
    //if (val.username == 'phuoc') {
    //    if (val.password == '123') {
    //        sess.username = "phuoc";
    //        sess.password = "123";
    //        mess = 'login success !';
    //    } else {
    //        mess = 'invalid password !';
    //    }
    //} else {
    //    mess = 'invalid username !';
    //}
    //console.log(sess.username);
    //res.redirect('/post-ads');
}
exports.login = login;
function signup(req, res) {
}
exports.signup = signup;
//# sourceMappingURL=index.js.map