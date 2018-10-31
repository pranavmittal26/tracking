const express          = require('express');
const randomLocation   = require('random-location');

let app = express();
let location =[];

let server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let PORT = process.env.PORT || 3000;

server.listen(PORT,function(){
    console.log(`the server is listening on...... ${PORT}`);
})

app.use(express.static(__dirname));

io.sockets.on('connection',function(socket){

    socket.on('track',()=>{
        location=[];
        const coord = {
            latitude: 30.7333,
            longitude: 76.7794
          }
        const dis = 100; // in meters
        for(i=0;i<5;i++){
            let randomPoint = randomLocation.randomCircumferencePoint(coord, dis);
            location.push(randomPoint);       
        }
        socket.emit('send track',location);    
    });
})
