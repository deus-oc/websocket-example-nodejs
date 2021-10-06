const { stdout } = require('process');

const server = require('http').createServer()
const io = require('socket.io')(server)
var userConnections = [];
io.on('connection', function (socket) {
  console.log('client connect...', socket.id);
  socket.on("userconnect", (data) => {
    console.log("UserConnected");
    var other_users = userConnections.filter((p) => p.meetingId == data.meetingId);
    userConnections.push({
      connectionId: socket.id.toString(),
      userId: data.displayName.toString(),
      meetingId: data.meetingId.toString(),
    });
    //console.log(userConnections);
    //inform others about me joined
    other_users.forEach((v) => {
      socket.to(v.connectionId).emit("inform_others_about_me", {
        userId: data.displayName.toString(),
        meetingId: data.meetingId.toString(),
        connectionId:socket.id.toString(),
      });
    });

    //inform me about other users those who have already joined
    socket.emit("inform_me_about_other_users", other_users);
    // socket.emit("inform_me_about_other_users",[
    //   {
    //     connectionId: 'sdfdsfsdf',
    //     userId: 'Naman',
    //     meetingId: '123456',
    //   }
    // ]);
  });

  socket.on("SDPProcess", (data) => {
    console.log("SDP Process");
    console.log(data);
    socket.to(data.to_connid).emit("SDPProcess", {
      message: data.message,
      from_connid: socket.id,
      type:data.type,
    });
  });

  socket.on("SDPMessage",(data)=>{
    console.log("SDPMessage");
    console.log(data);
  });

})

var server_port = process.env.PORT || 3000;
server.listen(server_port, function (err) {
  if (err) throw err
  console.log('Listening on port %d', server_port);
});