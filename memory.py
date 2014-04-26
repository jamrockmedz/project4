import flask
import auth
import model
import util
import urllib2
import json
import random
import uuid

from main import app
from flask.ext import wtf
from utilities import funnames
from google.appengine.api import users
from google.appengine.api import channel

  
@app.route('/one_player/')
def one_player():
	return flask.render_template(
		'one_player.html',
		html_class='one-player',
		title='Memory Game'
	)

@app.route('/two_player/')
def two_player():
	return flask.render_template(
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
						"url": 'project4.620057315.appspot.com/'+gameid
						}
    
	return flask.render_template(
		'two_player_network.html',
		values=template_values,
		html_class='setup-two-player-network',
		title='Memory Game'
	)

@app.route('/<gameid>')
@auth.login_required
def join_game(gameid):
	"""Return a game page"""
	user_db = auth.current_user_db()
	name = user_db.name
	token = channel.create_channel(name + gameid) 
	template_values = {
						"gameid":gameid,
						"token": channel.create_channel(name + gameid),
						"yourname": name
						}
	return flask.render_template("two_player_network.html", values=template_values)


@app.route('/sendcontent/<user>/<gameid>', methods=['GET', 'POST'])
def sendcontent(user,gameid):
	"""send game content data"""
	content = request.form['content']
	channel.send_message(user+gameid,content)
    
@app.errorhandler(404)
def page_not_found(e):
	"""Return a custom 404 error."""
	return 'Sorry, No Valid Game There.', 404

def generate_id():
	"""Return a game id"""
	return "%s-%s" % (str(uuid.uuid4())[:4],random.choice(funnames).lower())
