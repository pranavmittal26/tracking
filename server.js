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

    socket.on('get track',()=>{
        location=[];
        const P = {
            latitude: 30.7333,
            longitude: 76.7794
          }
        const R = 1000; // in meters
        for(i=0;i<5;i++){
            let randomPoint = randomLocation.randomCircumferencePoint(P, R);
            location.push(randomPoint);       
        }
        socket.emit('send track',location);    
    });
})
