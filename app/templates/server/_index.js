'use strict';


var io = require('socket.io')();
io.on('connection', function(socket){
  console.log("someone connected. juhu");


  socket.on('message', function (msg) {
    console.log('Message Received: ', msg);
    socket.broadcast.emit('message', msg);
  });

});
io.listen(3000);




for(var i=0;i<10;i++) {
  console.log("Server is runningsdf");
}
