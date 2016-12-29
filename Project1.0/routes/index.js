/*
 * GET home page.
 */
"use strict";
var database_1 = require("./database");
var api = new database_1.Project.api();
var datetime = require('node-datetime');
var passwordHash = require('password-hash');
//export function add(req: express.Request, res: express.Response) {
//};
function index(req, res) {
    res.render('./index', { session: req.session });
}
exports.index = index;
;
//--------app.get('/post-job', routes.postJob);'/post-job'
function postJob(req, res) {
    //console.log("ads " + req.session.email);
    if (req.session.email) {
        var json_1 = [];
        api.indexView("categoriesAll").then(function (data) {
            data.rows.forEach(function (item) {
                json_1.push(item.key);
            });
            //console.log(json);
            res.render('./postJob', { cats: json_1, session: req.session });
        });
    }
    else {
        res.render('./login', { nextlink: '/post-job' });
    }
}
exports.postJob = postJob;
;
//--------app.post('/post-job-submit', upload.single('photo'), routes.insertAds);
function insertJob(req, res) {
    var json = req.body;
    var postId = req.body.userId;
    var dt = datetime.create();
    var fomratted = dt.format('d/m/Y');
    delete json["userId"];
    var users = {
        "postId": postId,
        "applyId": []
    };
    console.log(req.file);
    if (req.file) {
        json.image = '/uploads/' + req.file.filename;
    }
    else {
        json.image = "";
    }
    json.postDate = fomratted;
    var temp = datetime.create(json.expireDate);
    json.expireDate = temp.format('d/m/Y');
    json.type = "jobs";
    json.status = "post";
    json.users = users;
    json.source = "UIT Search";
    api.insertData(json).then(function () {
        req.flash('success', 'You are successfully posting !');
        res.redirect('/manage-jobs');
    });
}
exports.insertJob = insertJob;
;
//-------app.get('/login', routes.loginPage);
function loginPage(req, res) {
    res.render('./login', { nextlink: '/' });
}
exports.loginPage = loginPage;
//-------app.post('/login-authen', routes.loginAuthen);
function loginAuthen(req, res) {
    console.log(req.body);
    var val = req.body;
    var mess = '';
    var render = '';
    var nextlink = '';
    var sess = req.session;
    var redirect = val.nextlink;
    api.findData(val.email, "usersByEmail").then(function (result) {
        if (result.rows[0] != null) {
            if (passwordHash.verify(val.password, result.rows[0].doc.password)) {
                sess.email = result.rows[0].doc.email;
                sess.name = result.rows[0].doc.name;
                sess.userId = result.rows[0].doc._id;
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
    res.render('./signup');
}
exports.signup = signup;
function signupSubmit(req, res) {
    var user = req.body;
    var sess = req.session;
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
exports.signupSubmit = signupSubmit;
function signout(req, res) {
    req.session.destroy(function (err) {
        // will have a new session here
        res.redirect('/');
    });
}
exports.signout = signout;
function forgotPassword(req, res) {
    console.log('asdasd');
    res.render('./forgotPassword');
}
exports.forgotPassword = forgotPassword;
function userManagement(req, res) {
    if (req.session.email) {
        api.findData(req.session.email, "usersByEmail").then(function (rs) {
            res.render('./updateUser', { user: rs.rows[0].doc, session: req.session, message: req.flash() });
        });
    }
    else {
        res.render('./login', { nextlink: '/user-management' });
    }
}
exports.userManagement = userManagement;
function updateUser(req, res) {
    var id = req.body._id;
    var body = req.body;
    api.findData(id, 'usersById').then(function (user) {
        user.rows[0].doc.name = body.name;
        user.rows[0].doc.email = body.email;
        user.rows[0].doc.phone = body.phone;
        api.updateData(user.rows[0].doc).then(function () {
            console.log('success');
            req.flash('successUpdateUser', 'You are successfully updating !', { maxage: 6000 });
            res.redirect('/user-management');
        }).catch(function (err) {
            if (err.name === 'conflict') {
                console.log('conflict ' + err);
            }
            else {
                console.log(err);
            }
        });
    });
}
exports.updateUser = updateUser;
//# sourceMappingURL=index.js.map