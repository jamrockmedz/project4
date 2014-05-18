var currentuser; 
var gameid;
var playerTwoAdded = 2;
var syncDeck = 3;
var cardFlipped = 4;
var newNetGame = 5;
var alltimeRecieced = 6;
var weeklyRecieced = 7
var otherplayer = "";
var playerType;
var allTimeLeaderBoard;
var weeklyLeaderBoard;

window.onload = function()
{
	attachEvent(document.getElementById("allTimeLink"), "click", getATopPlayers);
	attachEvent(document.getElementById("weeklyLink"), "click", getWTopPlayers);
	
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
	
	allTimeLeaderBoard = document.getElementById("alltime");
	weeklyLeaderBoard = document.getElementById("weekly");
	//alert("Current User: " + currentuser + " Gameid: " + gameid);
}

var onClose = function() {
	
	//alert("connection lost try to refresh");

}

var onError = function() {
	
	//alert("we have an error"); 
	
}

function getATopPlayers()
{   
	$('#allTimeLink').removeClass('active');
	$('#weeklyLink').removeClass('active');
	$(this).addClass('active');
	weeklyLeaderBoard.style.display = "none";
	allTimeLeaderBoard.style.display = "inherit";
	scoreBoardData('/alltime/get/');
   
}

function getWTopPlayers()
{   
	$('#allTimeLink').removeClass('active');
	$('#weeklyLink').removeClass('active');
	$(this).addClass('active');
	weeklyLeaderBoard.style.display = "inherit";
	allTimeLeaderBoard.style.display = "none";
	scoreBoardData('/weekly/get/');
   
}

var onMessage = function(message) {

	content = JSON.parse(message.data);
	
	switch(content[0])
	{
		case playerTwoAdded: 
		{
			
			otherplayer = content[1];
			playerTwo[0] = otherplayer;
			updatePlayer();
			syncGame();			
			closePlayerMenu();
			getScoreBoard();
			break;
		}
		
		case syncDeck: 
		{
			if(playerType > 1)
			{
				updateGameState(content);
			}
			getScoreBoard();
			break;
		}
		case newNetGame: 
		{
			newGameState(content);
			getScoreBoard();
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
		case alltimeRecieced:
		{
			console.log("we have alltime: " + content); 
			setAlltimeData(content);
			break;
		}
		case weeklyRecieced:
		{
			console.log("we have weekly: " + content); 
			setWeeklyData();
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

function getScoreBoard()
{
	scoreBoardData('/alltime/get/');
	scoreBoardData('/weekly/get/');
}


function updateScoreDB()
{
	scoreBoardData('/alltime/update/');
	scoreBoardData('/weekly/update/');
}



function setAlltimeData(content)
{
	ranks = (document.getElementById("alltime")).children;
	count = 0;
	for(i = 1; i < content.length; i++)
	{
		ranks[count].innerHTML = "" + content[i].name + ": " + content[i].wins;
		count++;
	}
}
	
	
function setWeeklyData(content)
{
	ranks = (document.getElementById("weekly")).children;
	count = 0;
	for(i = 1; i < content.length; i++)
	{
		ranks[count].innerHTML = "" + content[i].name + ": " + content[i].wins;
		count++;
	}
}

                   
// function used to send messages to the server
// these are then sent to the other user via
// the channel api
function scoreBoardData(uri)
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', uri, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("game="+currentuser + gameid);
}

var sendMessage = function(gameid,data) 
{
	content = JSON.stringify(data);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/sendcontent/' + otherplayer + '/' + gameid, true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send("message="+content);
};


