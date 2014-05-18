from flask import Flask, request
from flask import render_template, jsonify
import urllib2
import json
import random
import uuid
from datetime import *
from google.appengine.api import users
from google.appengine.api import channel
from google.appengine.ext import ndb
from utilities import funnames
from array import *

import auth
import model
from model import weekly
from model import alltime

from main import app




@app.route('/alltime/update/', methods=['GET', 'POST'])
@auth.login_required
def update_alltime():
	results = model.alltime.query(model.alltime.user_key == auth.current_user_key()).fetch(1)	
	count = 0
	for result in results:
		count += 1
		
	if count < 1:
		user_db = auth.current_user_db()
		name = user_db.name
		alltime_db = model.alltime(user_key=auth.current_user_key(), player_name=name)
	else:
		alltime_db = result;
		
	alltime_db.wins += 1
	
	alltime_db.put()
	return "success"
	
@app.route('/weekly/update/', methods=['GET', 'POST'])
@auth.login_required
def update_weekly():	
	results = model.weekly.query(model.weekly.user_key == auth.current_user_key()).fetch(1)	
	
	today=datetime.date(datetime.now())
	week_num = today.strftime("%U")
	year_num = today.strftime("%G")
	
	count = 0
	for result in results:
		count += 1
		
	if count < 1:
		user_db = auth.current_user_db()
		name = user_db.name
		weekly_db = model.weekly(user_key=auth.current_user_key(), player_name=name, week=week_num, year=year_num)
	else:
		weekly_db = result;
		if (weekly_db.week != week_num) or (weekly_db.year != year_num):
			weekly_db.wins = 0
			weekly_db.week = week_num
			weekly_db.year = year_num
			   
	weekly_db.wins += 1
	
	weekly_db.put()
	return "success"
	
	

@app.route('/alltime/get/', methods=['GET', 'POST'])
@auth.login_required
def get_alltime():
	game = request.form['game']
	results = model.alltime.query().order(-model.alltime.wins).fetch(5)
	i = 0
	output = []
	output.append(6)
	for result in results:
		output.append({'name': result.player_name, 'wins': result.wins})
		
	message = json.JSONEncoder().encode(output)
	channel.send_message(game,message)
	return "success"
	
    
    
@app.route('/weekly/get/', methods=['GET', 'POST'])
@auth.login_required
def get_weekly():
	game = request.form['game']
	today=datetime.date(datetime.now())
	week_num = today.strftime("%U")
	year_num = today.strftime("%G")
	
	results = model.weekly.query().order(-model.weekly.wins).fetch(5)
	"""results = ndb.gql("SELECT * FROM weekly where week = '" + week_num + "' and year = '" + year_num + "'").order(-model.weekly.wins).fetch(5)"""
	i = 0
	output = []
	output.append(7)
	for result in results:
		output.append({'name': result.player_name, 'wins': result.wins})
		
	message = json.JSONEncoder().encode(output)
	channel.send_message(game,message)
	return "success"
	
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
@auth.login_required
def sendmessage(user,gameid):
    """sends a message that is useless"""
    message = request.form['message']
    channel.send_message(user+gameid,message)
    return "message sent"
    

    
@app.errorhandler(404)
def page_not_found(e):
	"""Return a custom 404 error."""
	return 'Sorry, No Valid Game There.', 404

def generate_id():
	"""Return a game id"""
	return "%s-%s" % (str(uuid.uuid4())[:4],random.choice(funnames).lower())
