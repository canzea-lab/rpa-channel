var express = require('express');
var router = express.Router();

var db = require('../../../db');

router.get('/', function(req, res, next) {

    db.Conversation.find((err, docs) => {
        res.json(docs);
    });
});

module.exports = router;
