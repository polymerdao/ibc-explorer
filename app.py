from flask import Flask, jsonify, render_template, send_from_directory
import yaml
import subprocess, os
#from flask_cors import CORS

app = Flask(__name__, static_folder='build', static_url_path='')
app.config['API_URL'] = os.environ.get('API_URL', 'tcp://localhost:8080') # docker.host
#CORS(app, resources={r"/channel-data": {"origins": "http://127.0.0.1:5001"}})

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/connection-data')
def connection_data():
    # Running the CLI command and capturing its output
    try:
        cli_output = subprocess.check_output(['polymerd', 'query', 'ibc', 'connection', 'connections', '--node', app.config['API_URL']])
        parsed_data = yaml.safe_load(cli_output)
        return jsonify(height=parsed_data['height'], connections=parsed_data['connections'])
    except Exception as e:
        app.logger.error(f"polymerd failed: {e}")

@app.route('/client-data')
def client_data():
    # Running the CLI command and capturing its output
    try:
        cli_output = subprocess.check_output(['polymerd', 'query', 'ibc', 'client', 'states', '--node', app.config['API_URL']])
        parsed_data = yaml.safe_load(cli_output)
        return jsonify(clients=parsed_data['client_states'])
    except Exception as e:
        app.logger.error(f"polymerd failed: {e}")

@app.route('/channel-data')
def channel_data():
    # Running the CLI command and capturing its output
    try:
        cli_output = subprocess.check_output(['polymerd', 'query', 'ibc', 'channel', 'channels', '--node', app.config['API_URL']])
        parsed_data = yaml.safe_load(cli_output)
        return jsonify(height=parsed_data['height'], channels=parsed_data['channels'])
    except Exception as e:
        app.logger.error(f"polymerd failed: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
