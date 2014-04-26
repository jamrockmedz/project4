var currentuser; 
var gameid;
var playerTwoAdded = 2;
var syncDeck = 3;
var cardFlipped = 4;
var otherplayer = "";
var playerType;

window.onload = function()
{
	
    currentuser = document.getElementById("playername").innerHTML;
	gameid = document.getElementById("gameid").innerHTML;
	token = document.getElementById("token").innerHTML;
	
	channel = new goog.appengine.Channel(token);
    socket = channel.open();
    socket.onopen = onOpened;
    socket.onmessage = onMessage;
    socket.onerror = onError;
    socket.onclose = onClose;
	
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

	content = JSON.parse(message.data);
	
  
	content = JSON.parse(message.data);
	if(content[0] != syncDeck)
	{
		console.log("we have a message: " + content); 
	}
	
	
	switch(content[0])
	{
		case playerTwoAdded: 
		{
			closePlayerMenu();
			otherplayer = content[1];
			syncGame();
			break;
		}
		
		case syncDeck: 
		{
			if(playerType > 1)
			{
				updateGameState(content);
			}
			break;
		}
		
		case cardFlipped: 
		{
			if(content[1] != playerType)
			{
				var card =  document.getElementById(content[2]);
				flipCard(card);
			}
			break;
			
		}
	}
 
  
}

function updateGameState(content)
{
	currentGame.innerHTML = content[1];
	P = content[2];
	playerTurn = content[3];
	turnState = content[4];
	updatePlayer();
}
	


function syncGame()
{
	var game = document.getElementById("game").innerHTML;
	var gameData = [syncDeck, game, P, playerTurn, turnState];
	sendMessage(gameid, gameData);
}


var onOpened = function() {
  //figure out otherusername
	console.log("onOpened"); 
	playerType = document.getElementById("playerType").innerHTML;
	
	if(playerType > 1)
	{
		otherplayer = document.getElementById("hostplayer").innerHTML;
		var data = [playerTwoAdded, currentuser];
		
		sendMessage(gameid, data);
		closePlayerMenu();
	}
	      
}
                          
// function used to send messages to the server
// these are then sent to the other user via
// the channel api, look for the /sendmessage route
// in the main.py file
var sendMessage = function(gameid,data) 
{
	//data = [playerTwoAdded, ]
	content = JSON.stringify(data);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/sendcontent/' + otherplayer + '/' + gameid, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("message="+content);
};


