// Require several libraries: npm, dgram, util 
var radius = require('/Users/suzanavukovic/Desktop/Projects/WorkingVPN/NodeRadius/RadiusServer/node_modules/radius');
var dgram = require('dgram');
const util = require('util');

// Secret message needed in order to gain access to server
var secret = 'radius_secret';

// Once the packet is received on port 1812 
// Access request includes NAS IP  , username and password 
// if the credentials are acceptable as per the server, then server access granted
var packet_accepted = {
  code: "Access-Request",
  secret: secret,
  identifier: 0,
  attributes: [
    ['NAS-IP-Address', '10.5.5.5'],
    ['User-Name', 'borojeprdo'],
    ['User-Password', 'true']
  ]
};

// credentials are not accepted as per the server, server access rejected 
var packet_rejected = {
  code: "Access-Request",
  secret: secret,
  identifier: 1,
  attributes: [
    ['NAS-IP-Address', '10.5.5.5'],
    ['User-Name', 'suzana'],
    ['User-Password', 'rocks']
  ]
};

// Credentials may be right but secret code is wrong so the server access is not granted
var packet_wrong_secret = {
  code: "Access-Request",
  secret: "wrong_secret",
  identifier: 2,
  attributes: [
    ['NAS-IP-Address', '10.5.5.5'],
    ['User-Name', 'borojeprdo'],
    ['User-Password', 'true']
  ]
};

// client socket created here , udp 
var client = dgram.createSocket("udp4");

//bind to the socket I want 
client.bind(49001);

var response_count = 0;

// client turns on and it is looking to decode the message we have 
//packet looks at the username, pass, secret 
client.on('message', function(msg, rinfo) {
  var response = radius.decode({packet: msg, secret: secret});
  //console.log(response.attributes[1]);
  var request = sent_packets[response.identifier];

  // although it's a slight hassle to keep track of packets, it's a good idea to verify
  // responses to make sure you are talking to a server with the same shared secret
  var valid_response = radius.verify_response({
    response: msg,
    request: request.raw_packet,
    secret: request.secret
  });
  if (valid_response) {
    console.log('Got valid response ' + response.code + ' for packet id:  ' + response.identifier);
    // take some action based on response.code
  } else {
    console.log('WARNING: Got invalid response ' + response.code + ' for packet id: ' + response.identifier);
    // don't take action since server cannot be trusted (but maybe alert user that shared secret may be incorrect)
  }

  if (++response_count == 3) {
    client.close();
  }
});

// keep track of the packets I sent; whether they are accepted, rejected, have right 
// credentials and wrong secret 
var sent_packets = {};

//for each of the packets, encode the packet information and the secret code 
[packet_accepted, packet_rejected, packet_wrong_secret].forEach(function(packet) {
  var encoded = radius.encode(packet);
  sent_packets[packet.identifier] = {
    raw_packet: encoded,
    secret: packet.secret
  };
  //send the packet information as is with the encoded information, via 
  client.send(encoded, 0, encoded.length, 1812, "localhost");
});