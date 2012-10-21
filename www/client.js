$(function() {
  var socket = io.connect();
  $("#message-form").on("submit", function(e) {
    var message = $("#send-text").val();
    socket.emit("sendMessage", message);
    $("#send-text").val("");
    e.preventDefault();
    return false;
  });

  socket.on("broadcastMessage", function(data) {
    var newMessage = $("<span/>").html(data);
    $("#chat-area").append(newMessage);
    $("#chat-area").append("</br>");
    $("#chat-area").scrollTop(9000);
  });
});
