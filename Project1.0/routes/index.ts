/*
 * GET home page.
 */

import {Project} from "./database";
let api = new Project.api();

import express = require('express');
var app = express();
var fs = require('fs');
var http = require("http");

export function add(req: express.Request, res: express.Response) {
           
};

export function index(req: express.Request, res: express.Response) {
        res.render('./index');
};

export function indexAds(req: express.Request, res: express.Response) {
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
    } else {
        res.render('./login', {nextlink:'./postAds'});
    }
};

export function postAds(req: express.Request, res: express.Response) {
    var val = req.body;
    val.attachment = req.file.path;
    val.type = "jobs";
    val.status = "post";

    api.insertData(val);

    console.log(val);
    res.render('./postingSuccess');
};

export function loginPage(req: express.Request, res: express.Response) {

}

export function login(req: express.Request, res: express.Response) {
    var val = req.body;
    var mess: string;
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

export function signup(req: express.Request, res: express.Response) {

}