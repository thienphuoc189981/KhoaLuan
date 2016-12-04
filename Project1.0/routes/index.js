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
    res.render('./login');
}
exports.loginPage = loginPage;
function login(req, res) {
    console.log(req.body);
    var val = req.body;
    var mess;
    var sess = req.session;
    api.findData(val.email, "usersByEmail").then(function (result) {
        console.log(result.rows.email);
        if (result.rows.email) {
            if (result.rows.password) {
                sess.email = result.rows.doc.email;
                sess.password = result.rows.doc.password;
                sess.name = result.rows.doc.name;
                res.redirect(val.nextlink);
            }
            else {
                mess = "invalid password!";
                res.render('./login', { mess: mess });
            }
        }
        else {
            mess = "invalid email !";
            res.render('./login', { mess: mess });
        }
    });
}
exports.login = login;
function signup(req, res) {
}
exports.signup = signup;
//# sourceMappingURL=index.js.map