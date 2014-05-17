var currentuser; 
var gameid;
var playerTwoAdded = 2;
var syncDeck = 3;
var cardFlipped = 4;
var newNetGame = 5;
var otherplayer = "";
var playerType;

window.onload = function()
{
	attachEvent(document.getElementById("allTimeLink"), "click", getTopPlayers);
	attachEvent(document.getElementById("weeklyLink"), "click", getTopPlayers);
	
    currentuser = document.getElementById("playername").innerHTML;
    gameid = document.getElementById("gameid").innerHTML;
	token = document.getElementById("token").innerHTML;
	playerType = document.getElementById("playerType").innerHTML;
	
	if(playerType > 1)
	{
		playerTwo[0] = currentuser;
	}
	else
	{
		playerOne[0] = currentuser;
	}
	
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
	
	//alert("connection lost try to refresh");

}

var onError = function() {
	
	//alert("we have an error"); 
	
}

function getTopPlayers()
{   
	$('#allTimeLink').removeClass('active');
	$('#weeklyLink').removeClass('active');
	$(this).addClass('active');
   
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
			
			otherplayer = content[1];
			playerTwo[0] = otherplayer;
			updatePlayer();
			syncGame();
			closePlayerMenu();
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
		case newNetGame: 
		{
			newGameState(content);
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


function newGameState(content)
{
	playerOne[1] = 0;
	playerTwo[1] = 0;
	currentGame.innerHTML = content[1];
	P = content[2];
	playerTurn = content[3];
	turnState = content[4];
	updatePlayer();
	displayScore();
	document.getElementById("flip-front").innerHTML = "<h1>Memory Card Game</h1>";
	pairedCards = [];
	var temp = currentGame.querySelectorAll(".p");
	for(var i = 0; i < temp.length; i++)
	{
		pairedCards[i] = temp[i];
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
	
function syncNewGame()
{
	var game = document.getElementById("game").innerHTML;
	var gameData = [newNetGame, game, P, playerTurn, turnState];
	sendMessage(gameid, gameData);
	
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
	
	if(playerType > 1)
	{
		otherplayer = document.getElementById("hostplayer").innerHTML;
		playerOne[0] = otherplayer;
		var data = [playerTwoAdded, currentuser];
		
		sendMessage(gameid, data);
		closePlayerMenu();
		
	}
	      
}

function updateScoreDB()
{
	updateAlltime();
	updateWeekly();
}

function updateAlltime()
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/alltime/update/', true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send();
}
	
	
function updateWeekly()
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/weekly/update/', true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send();
}

function getAlltime()
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/alltime/get/', true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send();
}
                          
// function used to send messages to the server
// these are then sent to the other user via
// the channel api, look for the /sendmessage route
// in the main.py file
var sendMessage = function(gameid,data) 
{
	content = JSON.stringify(data);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/sendcontent/' + otherplayer + '/' + gameid, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("message="+content);
};


