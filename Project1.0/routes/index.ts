/*
 * GET home page.
 */

import {Project} from "./database";
let api = new Project.api();

import express = require('express');
var datetime = require('node-datetime');
var passwordHash = require('password-hash');

//export function add(req: express.Request, res: express.Response) {
           
//};

export function index(req: express.Request, res: express.Response) {
    res.render('./index', { session: req.session });
};

export function search(req: express.Request, res: express.Response) {
    res.sendfile('./views/search.html', { session: req.session });
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
export function insertJob(req: express.Request, res: express.Response) {
    let json = req.body;
    let postId = req.body.userId;
    let dt = datetime.create();
    let fomratted = dt.format('d/m/Y');
    delete json["userId"];
    let users = {
        "postId": postId,
        "applyId": []
    };
    console.log(req.file);
    if (req.file) {
        json.image = '/uploads/'+req.file.filename;
    } else {
        json.image = "";
    }
    json.postDate = fomratted;
    let temp = datetime.create(json.expireDate)
    json.expireDate = temp.format('d/m/Y');
    json.type = "jobs";
    json.status = "post";
    json.users = users;
    json.source = "UIT Search";

    api.insertData(json).then(function () {
        req.flash('success', 'Bạn đã đăng thành công !');
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
                if (passwordHash.verify(val.password, result.rows[0].doc.password)) {
                    sess.email = result.rows[0].doc.email;
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
    res.render('./signup');
}

export function signupSubmit(req: express.Request, res: express.Response) {
    let user = req.body;
    let sess = req.session;
    user.type = 'users';
    user.status = 'Active';
    user.password = passwordHash.generate(user.password);

    api.insertData(user).then(function () {
        api.findData(user.email, 'usersByEmail').then(function (rs) {
            sess.email = rs.rows[0].doc.email;
            sess.name = rs.rows[0].doc.name;
            sess.userId = rs.rows[0].doc._id;
            sess.privilege = rs.rows[0].doc.privilege;

            console.log(sess);
            res.redirect('/');
        });
    });
}

export function signout(req: express.Request, res: express.Response) {
    req.session.destroy(function (err) {
        // will have a new session here
        res.redirect('/');
    });
}

export function forgotPassword(req: express.Request, res: express.Response) {
    console.log('asdasd');
    res.render('./forgotPassword');
}

export function userManagement(req: express.Request, res: express.Response) {
  if (req.session.email) {
      api.findData(req.session.email,"usersByEmail").then(function (rs) {
            
            res.render('./updateUser', { user: rs.rows[0].doc, session: req.session, message:req.flash() });
        });
    } else {
      res.render('./login', { nextlink:'/user-management'});
    }
}

export function updateUser(req: express.Request, res: express.Response) {
    let id = req.body._id;
    let body = req.body;
    api.findData(id, 'usersById').then(function (user) {
        user.rows[0].doc.name = body.name;
        user.rows[0].doc.email = body.email;
        user.rows[0].doc.phone = body.phone;

        api.updateData(user.rows[0].doc).then(function () {
            console.log('success');
            req.flash('successUpdateUser', 'Bạn đã cập nhật thành công !', {maxage: 6000});
            res.redirect('/user-management');
        }).catch(function (err) {
            if (err.name === 'conflict') {
                console.log('conflict ' + err);
            } else {
                console.log(err);
            }
        });
    });
}