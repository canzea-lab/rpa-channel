var amqp = require('amqplib/callback_api');
var nconf = require('nconf');

nconf.argv()
    .env({separator:'_', lowerCase:true, parseValues:true})
    .file({ file: 'config/default.json' });

var events = {}

events.init = function(socket){

    let conn_config = {
        hostname: nconf.get("rabbitmq:host"),
        port: 5672,
        username: nconf.get("rabbitmq:username"),
        password: nconf.get("rabbitmq:password")       
    }
    console.log("CONN " + JSON.stringify(conn_config));

    amqp.connect(conn_config, function(err, conn) {
      if (err) {
          console.log(err);
          process.exit(1);
      }
      conn.createChannel(function(err, ch) {
        var q = 'hello';

        ch.assertQueue(q, {durable: false});

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            socket.updateClient({
              type: "rpa-channel.event",
              message: msg.content.toString()
            }, '000');
        }, {noAck: true});
      });
    });

    events.send = function(msg) {
        amqp.connect(conn_config, function(err, conn) {
          if (err) {
            console.log(err);
            process.exit(1);
          }
      
          conn.createChannel(function(err, ch) {
            var q = 'hello';

            ch.assertQueue(q, {durable: false});

            ch.sendToQueue(q, Buffer.from('Message = ' + msg));
            console.log(" [x] Sent message" + msg);
          });
        });
    }

    return events;
}

module.exports = events;
