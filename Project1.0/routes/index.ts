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

export function postAds(req: express.Request, res: express.Response) {
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
    } else {
        res.render('./login', { nextlink:'/post-ads'});
    }
};

export function insertAds(req: express.Request, res: express.Response) {
    var val = req.body;
    val.attachment = req.file.path;
    val.type = "jobs";
    val.status = "post";

    api.insertData(val);

    console.log(val);
    res.render('./postingSuccess');
};

export function loginPage(req: express.Request, res: express.Response) {
    res.render('./login');
}

export function loginAuthen(req: express.Request, res: express.Response) {
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
                    //res.redirect('/post-ads');
                    //res.end();
                } else {
                    mess = "invalid password!";
                    render = './login';
                }
            } else {
                mess = "invalid email !";
                render = './login';
            }

            if (render !== '') {
                console.log("render");
                res.render(render, { mess: mess, nextlink: redirect });
            } else {
                console.log("redirect");
                res.redirect(redirect);
            }
        });
}

export function signup(req: express.Request, res: express.Response) {

}