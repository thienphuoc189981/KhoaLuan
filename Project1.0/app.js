"use strict";
const express = require('express');
const routes = require('./routes/index');
const manage = require('./routes/manage');
const api = require('./routes/api');
const vnTokenizer = require('./routes/vnTokenizer');
const http = require('http');
const path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var flash = require('req-flash');
//var passport = require('passport')
//    , LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var hbs = require('express-handlebars');
var app = express();
var apiRoutes = express.Router();
var helper = hbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        eq: function (v1, v2) { return v1 == v2; }
    }
});
// all environments
app.set('port', process.env.PORT || 3000);
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'uwotm8'
}));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
var upload = multer({ storage: storage });
//app.use(multer({ dest: './uploads/' }).single('photo'));
app.use(express.static(path.join(__dirname, 'public')));
// development only
app.get('/', routes.index);
app.get('/login', routes.loginPage);
app.post('/login-authen', routes.loginAuthen);
app.get('/signup', routes.signup);
app.post('/signup-submit', routes.signupSubmit);
app.get('/post-job', routes.postJob);
app.post('/post-job-submit', upload.single('photo'), routes.insertAds);
app.get('/manage-jobs', manage.index);
app.get('/update-job/:id', manage.updateJob);
app.post('/update-job-submit', upload.single('photo'), manage.updateJobSubmit);
app.get('/applicator/:id', manage.viewApplicator);
app.get('/delete-job/:id', manage.deleteJob);
app.get('/job-detail/:id', manage.viewJob);
app.get('/apply/:id', manage.applyJob);
app.post('/apply-signup', manage.applySignup);
app.get('/sign-out', routes.signout);
app.get('/user-management', routes.userManagement);
app.post('/update-user', routes.updateUser);
//apiRoutes.get('/', routes.index);
//apiRoutes.get('/add', routes.add);
//apiRoutes.get('/api/name/:name', api.name);
//var fs = require("fs");
//apiRoutes.get('/job/:id', function (req, res) {
//    var data = require('./jobs');
//    let id = req.params.id;
//    for (var i = 0; i < Object.keys(data).length; i++) {
//         if (data[i].id == parseInt(id))
//              res.json(data[i]);
//    }
//});
//apiRoutes.post('/job/add', function (req, res) {
//    var addData = {
//        "title": "New job",
//        "description": "This is new added job",
//        "id": 4
//    };
//    var data = require('./jobs');
//    data[Object.keys(data).length] = addData;
//    res.json(data);
//});
//apiRoutes.del('/deleteJob/:id', function (req, res) {
//    var data = require('./jobs');
//    let id = req.params.id;
//    for (var i = 0; i < Object.keys(data).length; i++) {
//        if (data[i].id == parseInt(id)) {
//            delete data[i];
//        }
//    }
//    res.json(data);
//});
//Route dùng để xác thực và cung cấp token
app.post('/authenticate', function (req, res) {
    var user = { 'username': 'john', 'password': '123' };
    //check user
    if (req.body.name !== user.username) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
    }
    else if (req.body.password !== user.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
    }
    else {
        // create a token
        let token = jwt.sign(user, 'secretKey', {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        // return the information including token as JSON
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    }
});
//var myLogger = function (req, res, next) {
//    req.requestTime = Date.now();
//    next();
//}
//apiRoutes.use(myLogger);
// route middleware to verify a token
//apiRoutes.use(function (req, res, next) {
//    // check header or url parameters or post parameters for token
//    var token = null;
//    token = req.body.token || req.query.token || req.headers['x-access-token'];
//    // decode token
//    if (token != null) {
//        console.log('token is null');
//        // verifies secret and checks exp
//        jwt.verify(token, 'secretKey', function (err, decoded) {
//            if (err) {
//                return res.json({ success: false, message: 'Failed to authenticate token.' });
//            } else {
//                // if everything is good, save to request for use in other routes
//                req.decoded = decoded;
//                next();
//            }
//        });
//    } else {
//        // if there is no token
//        // return an error
//        return res.status(403).send({
//            success: false,
//            message: 'No token provided.'
//        });
//    }
//});
apiRoutes.get('/jobs', function (req, res) {
    var data = require('./jobs');
    res.json(data);
    //var responseText = 'Hello World!<br>';
    //responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    //res.send(responseText);
});
apiRoutes.get('/checkCached', api.checkCached);
apiRoutes.get('/dbSearch', api.dbSearch);
apiRoutes.post('/solrSearch', api.solrSearch);
apiRoutes.get('/createDoc', api.createDoc);
apiRoutes.post('/saveCache', api.saveCache);
apiRoutes.post('/vnTokenizer', vnTokenizer.analyzeData);
app.use('/api', apiRoutes);
if (app.get('env') === 'development') {
    app.use(errorHandler());
}
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
//# sourceMappingURL=app.js.map