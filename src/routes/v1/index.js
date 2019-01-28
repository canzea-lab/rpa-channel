var express = require('express');
var router = express.Router();
var path = require('path');

var conversationRouter = require('./routes/conversation');

//var auth = require('./auth/auth');

//api spec
//router.use('/spec', express.static(path.join(__dirname, 'spec')));

//api docs
//router.use('/api-docs', function(req, res){
//    var docs = require('./docs/docs');
//    res.send(docs.getDocHTML("v1"));
//});

//requests
//router.use('/', auth.authenticate('jwt', {session: false}), requestRouter);
router.use('/conversations', conversationRouter);

module.exports = router;