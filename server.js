var express = require("express")
  , Twit = require("twit")
  , keys = require('./config').Config;
 
var app = express();
 
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
 
var http = require("http").Server(app);
var io = require("socket.io")(http);
 
io.on('connection', function(socket){
  socket.on('new tweet', function(msg){
    io.emit('send tweet', msg);
    });
});
 
http.listen(3000);
 
var client = new Twit({
  consumer_key: keys.consumer,
  consumer_secret: keys.secret,
  access_token: keys.access, 
  access_token_secret: keys.accessSecret
});
 
console.log("Server is Listening");


io.on('connection', function(){
  client.get('search/tweets', {q: '#conservewater', count: 100}, function(err, data, res){
    var grabTweets = [];
    var tweets = data.statuses.map(function(obj){
      grabTweets.push("@"+obj.user.screen_name + " " + obj.text);
      return "@"+obj.user.screen_name + " " + obj.text;
    });
    io.emit('send tweet', tweets);
  });
});

var stream = client.stream('statuses/filter', {track: '#Unfriended, #drought, #waterconservation, #conservewater, #savewater, #waterreuse, #cadrought, #wildebeest'}, function(err, data, res){
});
 
stream.on('tweet', function(tweet){
  //waterArray.push("@"+tweet.user.screen_name + " " + tweet.text); 
  console.log("@"+tweet.user.screen_name + " " + tweet.text);
  io.emit('add tweet', tweet);
}); 
