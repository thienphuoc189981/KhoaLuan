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
function postAds(req, res) {
    console.log("ads " + req.session.email);
    if (req.session.email) {
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
        res.render('./login', { nextlink: '/post-ads' });
    }
}
exports.postAds = postAds;
;
function insertAds(req, res) {
    var val = req.body;
    val.attachment = req.file.path;
    val.type = "jobs";
    val.status = "post";
    api.insertData(val);
    console.log(val);
    res.render('./postingSuccess');
}
exports.insertAds = insertAds;
;
function loginPage(req, res) {
    res.render('./login');
}
exports.loginPage = loginPage;
function loginAuthen(req, res) {
    console.log(req.body);
    let val = req.body;
    let mess = '';
    let render = '';
    let nextlink = '';
    let sess = req.session;
    let redirect = val.nextlink;
    api.findData(val.email, "usersByEmail").then(function (result) {
        if (result.rows[0] != null) {
            if (result.rows[0].doc.password == val.password) {
                sess.email = result.rows[0].doc.email;
                sess.password = result.rows[0].doc.password;
                sess.name = result.rows[0].doc.name;
                //redirect = val.nextlink;
                console.log('login success');
            }
            else {
                mess = "invalid password!";
                render = './login';
            }
        }
        else {
            mess = "invalid email !";
            render = './login';
        }
        if (render !== '') {
            console.log("render");
            res.render(render, { mess: mess, nextlink: redirect });
        }
        else {
            console.log("redirect");
            res.redirect(redirect);
        }
    });
}
exports.loginAuthen = loginAuthen;
function signup(req, res) {
}
exports.signup = signup;
//# sourceMappingURL=index.js.map