///////////////// RADIUS SERVER ////////////////////

// NodeJS server that listens on a port and acts like a radius server
// Receives username, password combination inside of a packet/request 
// Access - Accepted or Access- Rejeected or Access-Wrong Secret Key 
// Limit the access to specific hosts or ips so as to prevent guessing of logins

//require radius package 
var radius = require('radius');
//require dgram package 
var dgram = require("dgram");


//////////////////////////////////////WHITELIST IPs////////////////////////////////////
// for whitelisting certain IP addresses, and denying other IPS use the following dependencies
// //init dependencies
// var express = require('express')
// var ipfilter = require('express-ipfilter').IpFilter
 
// // Whitelist the following IPs
const whitelist = ['127.3.0.1', '10.5.5.5']


// // Create the server
// app.use(ipfilter(ips, { mode: 'allow' }))
// app = module.exports

///////////////////////////////

// require a secret key for these users to get granted access
// not just username and password  
var secret = 'radius_secret';
var server = dgram.createSocket("udp4");

//turn server on, but we require username, password 
server.on("message", function (msg, rinfo) {
  console.log(rinfo);
  if (whitelist.indexOf(rinfo.address) == -1){
    console.log('Get out of here!');
  } 
  var code, username, password, packet;
  // decode that packet with the message and decode the secret as well
  // the secret will allow us to grant access or not 
  packet = radius.decode({packet: msg, secret: secret});

  // if packet message does not say Access Request
  if (packet.code != 'Access-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }

  //Grab the username and password of the packet we receive 
  username = packet.attributes['User-Name'];
  password = packet.attributes['User-Password'];
  //NAS_IP_Address = packet.attributes['NAS-IP-Address'];

  // Print who were sending an access request packet for 
  console.log('Access-Request for: ' + username + ' from: ' + rinfo.address);

  // Check if were accepting the user or rejecting them
  // This also tells our server whether to send info or not
  if (username == 'borojeprdo' && password == 'true') {
    code = 'Access-Accept';
  } else {
    code = 'Access-Reject';
  }

  // Encode the acceptance or rejection with the secret key
  // Include packet message information 
  var response = radius.encode_response({
    packet: packet,
    code: code,
    secret: secret
  });

  // Depending on acceptance or rejection, we send specific code for that username
  // Server sends code to specific port, address 
  // If error then error sending to that port and address is reported  
  console.log('Sending ' + code + ' for user ' + username);
  server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
    if (err) {
      console.log('Error sending response to ', rinfo);
    }
  });
});

// Awaiting packets here , listening at port 1812 
server.on("listening", function () {
  var address = server.address();
  console.log("radius server listening " +
      address.address + ":" + address.port);
});

server.bind(1812);

////find local ip address //////////
