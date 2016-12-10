/*
 * GET home page.
 */

import {Project} from "./database";
let api = new Project.api();

import express = require('express');
var datetime = require('node-datetime');

//export function add(req: express.Request, res: express.Response) {
           
//};

export function index(req: express.Request, res: express.Response) {
    res.render('./index', { session: req.session });
};

//--------app.get('/post-job', routes.postJob);'/post-job'
export function postJob(req: express.Request, res: express.Response) {
    //console.log("ads " + req.session.email);
    if (req.session.email) {
        let json = [];
        api.indexView("categoriesAll").then(function (data) {
            data.rows.forEach(function (item) {
                json.push(item.key);
            });
            //console.log(json);
            res.render('./postJob', { cats: json, session: req.session });
        });
    } else {
        res.render('./login', { nextlink:'/post-job'});
    }
};

//--------app.post('/post-job-submit', upload.single('photo'), routes.insertAds);
export function insertAds(req: express.Request, res: express.Response) {
    let json = req.body;
    let postId = req.body.userId;
    let dt = datetime.create();
    let fomratted = dt.format('d/m/Y');
    delete json["userId"];
    let users = {
        "postId": postId,
        "applyId": ""
    };
    console.log(req.file);
    if (req.file) {
        json.attachment = '/uploads/'+req.file.filename;
    } else {
        json.attachment = "";
    }
    json.datetime = fomratted;
    json.type = "jobs";
    json.status = "post";
    json.users = users;

    api.insertData(json).then(function () {
        req.flash('success', 'You are successfully posting !');
        res.redirect('/manage-jobs');
    });
};

//-------app.get('/login', routes.loginPage);
export function loginPage(req: express.Request, res: express.Response) {
    res.render('./login',{ nextlink: '/' });
}


//-------app.post('/login-authen', routes.loginAuthen);
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
                    sess.userId = result.rows[0].doc._id;
                    console.log('login success');
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
