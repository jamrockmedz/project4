var currentuser 
var gameid 


window.onload = function(){
    currentuser = document.getElementById("playername").innerHTML;
	
	gameid = document.getElementById("gameid").innerHTML;
	
	//alert("Current User: " + currentuser + " Gameid: " + gameid);

}

function test(){
	
	alert("Current User: " + currentuser + " Gameid: " + gameid);
	return 1;

}


var onClose = function() {
 alert("connection lost try to refresh");
  }

var onError = function() {
 alert("we have an error"); 
}

var onMessage = function(message) {
  console.log("we have a message: " + message.data); 
  test();
  closePlayerMenu();
}


var onOpened = function() {
  //figure out otherusername
		
	sendMessage(currentuser, gameid, "sample");
	closePlayerMenu();
        
}
                          
// function used to send messages to the server
// these are then sent to the other user via
// the channel api, look for the /sendmessage route
// in the main.py file
var sendMessage = function(name,gameid,content) 
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/sendcontent/' + name + '/' + gameid, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("message="+content);
};


