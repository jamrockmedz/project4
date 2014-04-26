var onClose = function() {
 alert("connection lost try to refresh");
  }

var onError = function() {
 alert("we have an error"); 
}

var onMessage = function(message) {
  console.log("we have a message: " + message.data); 
  closePlayerMenu();
}


var onOpened = function() {
  //figure out otherusername
	
	var currentuser = location.href.split('/').reverse()[0];
	
	var gameid = document.getElementById("gameid").innerHTML;
	
	sendContent("test", gameid, "sample");
	closePlayerMenu();
        
}
                          
// function used to send messages to the server
// these are then sent to the other user via
// the channel api, look for the /sendmessage route
// in the main.py file
var sendContent = function(name,gameid,content) 
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/sendcontent/' + name + '/' + gameid, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("content="+content);
};


