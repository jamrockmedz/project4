from flask import Flask, request
from flask import render_template
import urllib2
import json
import random
import uuid
from google.appengine.api import users
from google.appengine.api import channel
from utilities import funnames

import auth

from main import app

  
@app.route('/one_player/')
def one_player():
	return render_template(
		'one_player.html',
		html_class='one-player',
		title='Memory Game'
	)

@app.route('/two_player/')
def two_player():
	return render_template(
		'two_player.html',
		html_class='two-player',
		title='Memory Game'
	)
	
@app.route('/two_player_network/')
@auth.login_required
def two_player_network():
	"""Setup channel network game"""
	
	user_db = auth.current_user_db()
	name = user_db.name
	gameid = generate_id()
	token = channel.create_channel(name + gameid) 
	template_values = {
						"gameid":gameid,
						"token": channel.create_channel(name + gameid),
						"yourname": name,
						"url": 'http://project4.pr620057315.appspot.com/'+name+'/'+gameid
						}
    
	return render_template(
		'host_player.html',
		values=template_values,
		html_class='setup-two-player-network',
		title='Memory Game'
	)

@app.route('/<string:hostplayer>/<string:gameid>')
@auth.login_required
def join_game(gameid,hostplayer):
	"""Return a game page"""
	user_db = auth.current_user_db()
	name = user_db.name
	token = channel.create_channel(name + gameid) 
	template_values = {
						"gameid":gameid,
						"token": channel.create_channel(name + gameid),
						"yourname": name,
						"hostplayer":hostplayer
						}
	return render_template("player.html", values=template_values)


@app.route('/sendcontent/<string:user>/<string:gameid>', methods=['GET', 'POST'])
def sendmessage(user,gameid):
    """sends a message that is useless"""
    message = request.form['message']
    channel.send_message(user+gameid,message)
    
@app.errorhandler(404)
def page_not_found(e):
	"""Return a custom 404 error."""
	return 'Sorry, No Valid Game There.', 404

def generate_id():
	"""Return a game id"""
	return "%s-%s" % (str(uuid.uuid4())[:4],random.choice(funnames).lower())
