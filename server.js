var fs = require('fs');
var http = require('http');

var port = process.env.PORT || 3000;

var server = http.createServer(function(req, res) {
  if (req.url.match(/^\/(index.html)?$/)) {
    return serve(res, "/www/index.html");
  }
  else if (req.url.match(/^\/styles.css$/)) {
    return serve(res, "/www/styles.css", "text/css");
  }
  else if (req.url.match(/^\/bootstrap.min.css$/)) {
    return serve(res, "/www/bootstrap.min.css", "text/css");
  }
  else if (req.url.match(/^\/client.js$/)) {
    return serve(res, "/www/client.js", "text/javascript");
  }
  else if (req.url.match(/^\/jquery.min.js$/)) {
    return serve(res, "/www/jquery.min.js", "text/javascript");
  }
  else if (req.url.match(/^\/underscore.min.js$/)) {
    return serve(res, "/www/underscore.min.js", "text/javascript");
  }
  else if (req.url.match(/^\/raphael.min.js$/)) {
    return serve(res, "/www/raphael.min.js", "text/javascript");
  }
  else if (req.url.match(/^\/catan.js$/)) {
    return serve(res, "/www/catan.js", "text/javascript");
  }
  res.writeHead(404, {"Content-Type": "text/html"});
  res.end("Not found");
})

server.listen(port);
console.log("Chat app started on port: " + port);

var io = require("socket.io").listen(server);
console.log("Socket.io listening..");
io.set("log level", 2);

io.sockets.on("connection", function(socket) {
  socket.on("sendMessage", function(data) {
    console.log("Message received: " + data);
    io.sockets.emit("broadcastMessage", data);
  });
});

function serve(res, path, mime) {
  fs.readFile(__dirname + path, function(err, data) {
    if (err) {
      return error(res, err);
    }

    res.writeHead(200, {"Content-Type": mime || "text/html"});
    res.end(data);
  });
}

function error(res, err) {
  res.writeHead(500, {"Content-Type": "text/plain"});
  res.end("Internal server error: " + err);
  console.log(err);
}

