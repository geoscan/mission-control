#!/usr/bin/python3

from flask import Flask,render_template, jsonify
from random import randint

app = Flask(__name__)
port = 2022
host = "localhost"

@app.route('/')
def index():
    global host
    global port
    return render_template('index.html', host = host, port=port)

@app.route('/status')
def status():
    return  jsonify(mag=randint(0,1), navigation=randint(0,1))

app.run(host=host, port=port)
