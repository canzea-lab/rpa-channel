'use strict';

const express = require('express');
const request = require('request');
const querystring = require('querystring');

var bodyParser = require('body-parser')

const socket = require('./socket');
require('./db').init();
const events = require('./events').init(socket);

var v1Router = require('./routes/v1');

const Conversation = require('./db/model/conversation');

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

const nconf = require('nconf');

nconf.argv().env({lowerCase:true, parseValues:true});

// App
const app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/bridge', (hreq, hres) => {
  let text = hreq.body.text;
  let voiceId = hreq.body.voiceId;

  if (typeof text === "undefined") {
    return hres.status(500).json({ message: "No text found"});
  }

  const convo = new Conversation({ label: voiceId });
  convo.save().then(() => console.log('Recorded convo'));

  events.send("HI " + voiceId);
  socket.updateClient({
    type: "rpa-channel.bridge",
    voice: voiceId
  }, '000');

  const query = querystring.stringify({
    'voiceId': voiceId,
    'outputFormat': 'pcm',
    'text': text,
  });

  console.log("Translating text: " + text);

  console.log("--> INPUT: " + nconf.get("input_source"));

  const instream = request({url:nconf.get("input_source") + '/read?' + query});

  console.log("---> Calling " + nconf.get("input_source") + '/read?' + query);

  instream.on("error", (err) => {
    return hres.status(500).json({ message: "Error " + err});
  });

  let encoding = "LINEAR16";

  var formData = {
    encoding: encoding,
    name: "polly",
    track: instream
  };

  console.log("<-- OUTPUT to " + nconf.get("forward"));

  request.post({url: nconf.get("forward"), headers: {"Content-Type": "multipart/form-data"}, formData: formData}, function (err, resp, body) {
    if (err) {
      return hres.status(500).json({ message: "Error " + err });
    } else {

      var jbody = JSON.parse(body);

      socket.updateClient({
        type: "rpa-channel.bridge.listen.response",
        complete: true,
        message: jbody,
        voice: voiceId
      }, '000');


      // curl -XPOST http://localhost:5005/webhooks/rest/webhook -H "Content-Type: application/json" -d '{"sender":"Joe", "message":"hello"}'

      var data = {
        sender: "joe",
        message: jbody.transcript
      }
      console.log("Sending data: " + JSON.stringify(data));

      request.post({url: 'http://20.20.20.20:5005/webhooks/rest/webhook', json: data}, function (berr, bresp, bbody) {
         if (berr) {
             return hres.status(500).json({ message: "Error " + berr });
         } else {

             console.log("Body = "+JSON.stringify(bbody));
             socket.updateClient({
                 type: "rpa-channel.bridge.brain.response",
                 message: bbody,
                 voice: voiceId
             }, '000');

             return hres.status(200).json(bbody);

         }
      });

    }
  });
});

app.use("/v1", v1Router);

socket.init();
app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);
