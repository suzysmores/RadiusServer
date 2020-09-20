var radius = require('radius');
//require radius package 
var dgram = require("dgram");
//require dgram package 

var secret = 'radius_secret';
var server = dgram.createSocket("udp4");


//turn server on, but we require username, password 
server.on("message", function (msg, rinfo) {
  var code, username, password, packet;
  packet = radius.decode({packet: msg, secret: secret});

  if (packet.code != 'Access-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }


  //Grab the username and password of the packet we receive 
  username = packet.attributes['User-Name'];
  password = packet.attributes['User-Password'];

  console.log('Access-Request for ' + username);

  if (username == 'borojeprdo' && password == 'true') {
    code = 'Access-Accept';
  } else {
    code = 'Access-Reject';
  }

  var response = radius.encode_response({
    packet: packet,
    code: code,
    secret: secret
  });

  console.log('Sending ' + code + ' for user ' + username);
  server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
    if (err) {
      console.log('Error sending response to ', rinfo);
    }
  });
});

//awaiting packets here 
server.on("listening", function () {
  var address = server.address();
  console.log("radius server listening " +
      address.address + ":" + address.port);
});

server.bind(1812);