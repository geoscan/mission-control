#!/usr/bin/python3

import rospy, os, sys, subprocess, shutil
sys.path.append("/home/ubuntu/geoscan_ws/src/gs_core/src/")
from restart import restart as restart_board
from time import sleep
from flask import Flask,render_template, jsonify, request, send_file
from rospy import ServiceProxy
from gs_interfaces.msg import Parameter
from gs_interfaces.srv import NavigationSystem, ParametersList
from threading import Thread

app = Flask(__name__)
port = 2022
nav_proxy = ServiceProxy("geoscan/navigation/get_system", NavigationSystem)
param_proxy = ServiceProxy("geoscan/board/get_parameters", ParametersList)
mag = False
navigation = False
launch = None

@app.route('/')
def index():
    global hostname
    global port
    return render_template('index.html', host = hostname, port=port)

@app.route('/status')
def status():
    global launch
    if launch == None:
        return jsonify(launch=0)
    else:
        return jsonify(launch=1)

@app.route('/preflight')
def preflight():
    global navigation
    global mag
    global nav_proxy
    global param_proxy
    global launch
    if launch == None:
        return jsonify(mag=0, navigation=0, status=2)
    try:
        for param in param_proxy().params:
            if param.name == 'Imu_magEnabled':
                mag = not bool(param.value)

        system = nav_proxy()
        if system.navigation == "GPS":
            navigation = True
        else:
            navigation = False
        return jsonify(mag=int(mag), navigation=int(navigation), status=1)
    except Exception as e:
        print(str(e))
        return jsonify(mag=0, navigation=0, status=0)
        

@app.route('/restart', methods=['POST'])
def restart():
    global launch
    if launch != None:
        launch.terminate()
        launch = None
    restart_board()
    return jsonify(status=1)

@app.route('/mavlink', methods=['POST'])
def mavlink():
    global launch
    if request.get_json()["command"] == 1:
        launch = subprocess.Popen(["roslaunch","gs_mavlink","mavlink_pioneer.launch"], stdout=subprocess.DEVNULL)
        return jsonify(status=1)
    else:
        if launch == None:
            return jsonify(status=0)
        else:
            launch.terminate()
            launch = None
            return jsonify(status=0)

@app.route('/photo')
def download():
    shutil.make_archive("/home/ubuntu/photo", 'zip', "/home/ubuntu/photo")
    return send_file("/home/ubuntu/photo.zip", cache_timeout=-1)

try:
    argv = sys.argv
    hostname = os.popen('ip addr show {}'.format(argv[argv.index('--interface')+1])).read().split("inet ")[1].split("/")[0]
    app.run(host=hostname, port=port)
except:
    pass