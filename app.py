from flask import Flask, jsonify, render_template, send_from_directory
import yaml
import subprocess
#from flask_cors import CORS

app = Flask(__name__, static_folder='build', static_url_path='')
#CORS(app, resources={r"/data": {"origins": "http://127.0.0.1:5000"}})

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

#@app.route('/')
#def index():
#    return render_template('index.html')

#@app.route('/channels')
#def channels():
#    return render_template('channels.html')

#@app.route('/connections')
#def connections():
#    return render_template('connections.html')

#@app.route('/clients')
#def clients():
#    return render_template('clients.html')

@app.route('/data')
def data():
    # Running the CLI command and capturing its output
    cli_output = subprocess.check_output(['polymerd', 'query', 'ibc', 'channel', 'channels', '--node', 'tcp://localhost:8080'])

    parsed_data = yaml.safe_load(cli_output)

    # Including counterparty information
    for channel in parsed_data['channels']:
        counterparty = channel['counterparty']
        channel['counterparty_info'] = f"Channel ID: {counterparty['channel_id']}, Port ID: {counterparty['port_id']}"

    return jsonify(height=parsed_data['height'], channels=parsed_data['channels'])


if __name__ == '__main__':
    app.run(debug=True)
