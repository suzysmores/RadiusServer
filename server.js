// RADIUS is a dial in server service 
// That is the authentication method, the user has to dial in 
// Authentication, Authorization 
// 

var udp = require('dgram');

// --------------------Creating a UDP server --------------------

// Creating a UDP server
var server = udp.createSocket('udp4');

// Emits when any error occurs
server.on('error',function(error){
  console.log('Error: ' + error);
  server.close();
});

// Emits on new datagram msg
server.on('message',function(msg,info){
  console.log('Data received from client : ' + msg.toString());
  console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

//Sending msg
server.send(msg,info.port,'localhost',function(error){
  if(error){
    client.close();
  }else{
    console.log('Data sent !!!');
  }

});

});

//Emits when socket is ready and listening for datagram msgs
server.on('listening',function(){
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port: ' +port);
  console.log('Server ip : ' +ipaddr);
  console.log('Server is IP4/IP6 : ' + family);
});

//Emits after the socket is closed using socket.close();
server.on('close',function(){
  console.log('Socket is closed !');
});

server.bind(1812); 
//was 2222 I edited this 

setTimeout(function(){
server.close();
},8000);

