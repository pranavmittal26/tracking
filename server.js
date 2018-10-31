var express = require('express');
var app = express();
var http = require('http');
var socketIo = require('socket.io');
var fs =require ('fs');
var mysql=require("mysql");
var path = require('path')
var port = process.env.PORT || 3000;
var server ,io;

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});
server = http.Server(app);
server.listen(port,()=>{
console.log("server listining on" + port); });
io = socketIo(server);
 
global.connection = mysql.createConnection(
    {  
        host: "localhost",
        user: "root",
        password: "123456" ,
        database:"testdb"
    }); 
    connection.connect( (err)=>
    {
        if (err) 
        {
            throw err;
        }
    console.log(" mysql connected"); 
    });
     
    io.on('coordinates',()=>{

        io.emit()
    })
    app.post('/track', function(req, res){
        let inputCoords = req.body.inputCoords;
        let distance = req.body.distance;
        const result = {}
        const coords = toRadians(inputCoords)
        const sinLat =  Math.sin(coords.latitude)
        const cosLat =  Math.cos(coords.latitude)
    
        /* go a fixed distance in a random direction*/
        const bearing = Math.random() * TWO_PI
        const theta = distance/EARTH_RADIUS
        const sinBearing = Math.sin(bearing)
        const cosBearing =  Math.cos(bearing)
        const sinTheta = Math.sin(theta)
        const cosTheta =    Math.cos(theta)
    
        result.latitude = Math.asin(sinLat*cosTheta+cosLat*sinTheta*cosBearing);
        result.longitude = coords.longitude + 
            Math.atan2( sinBearing*sinTheta*cosLat, cosTheta-sinLat*Math.sin(result.latitude )
        );
        /* normalize -PI -> +PI radians (-180 - 180 deg)*/
        result.longitude = ((result.longitude+THREE_PI)%TWO_PI)-Math.PI
    
        var degrees =  toDegrees(result)
        console.log(degrees);
        updateFleetMovement(degrees , function(err, result){
            if(err) return err;
            else{
                return res.send({
                    msg:'success',
                    status:200
                    })
                }
        });
    })

    function updateFleetMovement (data,cb) {
        console.log("data updateFleetMovement =======>>>>>>>", data);
        var currentDate = moment(new Date()).format("YYYY-MM-DD");
       var sql = "INSERT INTO `position` (`latitude`, `longitude`, `updatetime`) VALUES ?";
       var values = [];
       for (var i = 0; i< data.length; i++){
        var value = [];
         value.push(data[i].latitude, data[i].longitude, NOW());
         values.push(value);
       }
        connection.query(sql,[values],function(err,response){
             console.log("@@@@@ err,response",sql,err,response);
            cb(null,null);
        })
   };
   function sendsocketcoordinates(driver_id) {
    async.series([
        function(cb){
            var sql = 'SELECT * FROM position where  driver_id IN (?) GROUP BY driver_id ORDER BY updatetime ASC';
            var s = connection.query(sql, [driver_id], function (err, arr) {
                console.log("sssssssss", s.sql)
                if(arr && arr.length > 0){
                    var arrayJob = []
                    for(var i=0;i<arr.length;i++){
                        var data = {
                            latitude : arr[i].latitude,
                            longitude : arr[i].longitude
                        }
                        arrayJob.push(data)
                    }
                    io.emit('coordinates', {jobArray:arrayJob,multi:true})
                }
            });
        },
    ], function (error, response) {
        console.log(error,response)
    });
}
