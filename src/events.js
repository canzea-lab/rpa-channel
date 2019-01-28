var amqp = require('amqplib/callback_api');

var events = {}

events.init = function(socket){

    amqp.connect('amqp://20.20.20.20', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'hello';

        ch.assertQueue(q, {durable: false});

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function(msg) {
            socket.updateClient({
              type: "rpa-channel.event",
              message: msg.content.toString()
            }, '000');
            console.log(" [x] Received %s", msg.content.toString());
        }, {noAck: true});
      });
    });

    events.send = function(msg) {
        amqp.connect('amqp://20.20.20.20', function(err, conn) {
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
