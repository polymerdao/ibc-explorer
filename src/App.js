import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

const endpoints = {
    channels: '/channel-data',
    connections: '/connection-data',
    clients: '/client-data',
    // ... any other views
};

function removeStatePrefix(state) {
	return state.replace(/^STATE_/, '');
}

function parseChannelID(channelId) {
	const matches = channelId.match(/\d+/);
	return parseInt(matches ? matches[0] : -1, 10);
}

function App() {
	const [channels, setChannels] = useState([]);
	const [connections, setConnections] = useState([]);
	const [clients, setClients] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterColumn, setFilterColumn] = useState('channel_id');
	const [revisionHeight, setRevisionHeight] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [refreshCount, setRefreshCount] = useState(0);
	const [activeView, setActiveView] = useState('channels')

	const requestSort = key => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	}

	const processedChannels = useMemo(() => {
		let result = channels;

		// Filter and Search
		if (searchQuery) {
			result = result.filter(channel => {

			let valueToFilter = '';

			switch (filterColumn) {
			case 'channel_id':
				valueToFilter = channel.channel_id;
				break;
			case 'state':
				valueToFilter = channel.state;
				break;
			case 'counterparty_channel_id':
				valueToFilter = channel.counterparty.channel_id;
				break;
			case 'counterparty_port_id':
				valueToFilter = channel.counterparty.port_id;
				break;
			default:
				valueToFilter = '';
			}

			return valueToFilter.toLowerCase().includes(searchQuery.toLowerCase());
			});
		}

		// Sorting
		if (sortConfig !== null) {
			result.sort((a, b) => {
			let aValue = 1, bValue = 2;
			switch (sortConfig.key) {
			case  'channel_id':
				aValue = parseChannelID(a.channel_id);
				bValue = parseChannelID(b.channel_id);
				break;
			case 'counterparty_channel_id':
				aValue = parseChannelID(a.counterparty.channel_id);
				bValue = parseChannelID(b.counterparty.channel_id);
				break;
			case 'state':
				aValue = a.state;
				bValue = b.state;
				break;
			case 'counterparty_port_id':
				aValue = a.counterparty.port_id;
				bValue = b.counterparty.port_id;
				break;
			default:
				console.log('sort failure');
			}

			if (aValue < bValue) {
				return sortConfig.direction === 'ascending' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'ascending' ? 1 : -1;
			}
			return 0;
			});
		}
		return result;
	}, [channels, searchQuery, filterColumn, sortConfig]);

	const processedConnections = useMemo(() => {
		let result = connections;

		// Filter and Search
		if (searchQuery) {
			result = result.filter(connection => {

			let valueToFilter = '';

			switch (filterColumn) {
			case 'id':
				valueToFilter = connection.id;
				break;
			case 'state':
				valueToFilter = connection.state;
				break;
			case 'client_id':
				valueToFilter = connection.client_id;
				break;
			case 'counterparty_connection_id':
				valueToFilter = connection.counterparty.connection_id;
				break;
			default:
				valueToFilter = '';
			}

			return valueToFilter.toLowerCase().includes(searchQuery.toLowerCase());
			});
		}
		return result;
	}, [connections, searchQuery, filterColumn]);

	const processedClients = useMemo(() => {
		let result = clients;

		// Filter and Search
		if (searchQuery) {
			result = result.filter(client => {

			let valueToFilter = '';

			switch (filterColumn) {
			case 'client_id':
				valueToFilter = client.client_id;
				break;
			case 'height':
				valueToFilter = client.client_state.latest_height.revision_height;
				break;
			case 'number':
				valueToFilter = client.client_state.latest_height.revision_number;
				break;
			default:
				valueToFilter = '';
			}

			return valueToFilter.toLowerCase().includes(searchQuery.toLowerCase());
			});
		}
		return result;
	}, [clients, searchQuery, filterColumn]);

	// Function to fetch data from Flask
	const fetchData = () => {
		console.log(activeView);
		const viewPath = endpoints[activeView];
		const currentURL = `http://127.0.0.1:5001${viewPath}`;
		fetch(currentURL)  // Adjust this URL to your Flask endpoint
		.then(response => response.json())
		.then(data => {
			switch (activeView) {
				case 'channels':
					let updatedChannels = data.channels.map(channel => ({
						...channel,
						state: removeStatePrefix(channel.state)
					}));
					setChannels(updatedChannels);
					setRevisionHeight(data.height.revision_height);
					break;
				case 'connections':
					let updatedConnections = data.connections.map(connection => ({
						...connection,
						state: removeStatePrefix(connection.state)
					}));
					setConnections(updatedConnections);
					setRevisionHeight(data.height.revision_height);
					break;
				case 'clients':
					setClients(data.clients);
					break;
			}
			setRefreshCount(prevCount => prevCount + 1);
		})
		.catch(error => console.error('Error fetching data:', error));
	};

	// Effect for fetching data initially and setting up auto-refresh
    useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

		// Cleanup interval on unmount
		return () => clearInterval(interval);
    }, [activeView]); // depends on activeView

	function DataHeader({ view }) {
		return (
			<h1>{view}</h1>
		);
	}

	function ChannelsTable({ channels }) {
		return (
			<table>
				<thead>
					<tr>
						<th onClick={() => requestSort('channel_id')}>Channel ID</th>
						<th onClick={() => requestSort('state')}>State</th>
						<th onClick={() => requestSort('counterparty_channel_id')}>Counterparty Channel ID</th>
						<th onClick={() => requestSort('counterparty_port_id')}>Counterparty Port ID</th>
					</tr>
				</thead>
				<tbody>
					{processedChannels.map((channel, index) => (
						<tr key={index}>
						<td>{channel.channel_id}</td>
						<td>{channel.state}</td>
						<td>{channel.counterparty.channel_id}</td>
						<td>{channel.counterparty.port_id}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	function ChannelControls() {
		return (
			<div className="top-controls">
				<div className="search-container">
					<input
						type="text"
						className="search-input"
						placeholder="Search channels..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
					<select className="filter-select" value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
						<option value="channel_id">Channel ID</option>
						<option value="state">State</option>
						<option value="counterparty_channel_id">Counterparty Channel ID</option>
						<option value="counterparty_port_id">Counterparty Port ID</option>
					</select>
				</div>

				<div className="count-box">
					<p>Channels: {channels.length}</p>
				</div>

				<div className="revision-height-box">
					<p>Revision Height: {revisionHeight}</p>
				</div>

				<div className="refresh-count-box">
					<p>Refresh Count: {refreshCount}</p>
				</div>
			</div>
		);
	}

	function ConnectionsTable({ connections }) {
		return (
			<table>
				<thead>
					<tr>
						<th onClick={() => requestSort('id')}>Connection ID</th>
						<th onClick={() => requestSort('client_id')}>Client ID</th>
						<th onClick={() => requestSort('state')}>State</th>
						<th onClick={() => requestSort('counterparty_connection_id')}>Counterparty Connection ID</th>
					</tr>
				</thead>
				<tbody>
					{processedConnections.map((connection, index) => (
						<tr key={index}>
							<td>{connection.id}</td>
							<td>{connection.counterparty.client_id}</td>
							<td>{connection.state}</td>
							<td>{connection.counterparty.connection_id}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	function ConnectionControls() {
		return (
			<div className="top-controls">
				<div className="search-container">
					<input
						type="text"
						className="search-input"
						placeholder="Search connections..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
					<select className="filter-select" value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
						<option value="id">Connection ID</option>
						<option value="client_id">Client ID</option>
						<option value="state">State</option>
						<option value="counterparty_connection_id">Counterparty Connection ID</option>
					</select>
				</div>

				<div className="count-box">
					<p>Connections: {connections.length}</p>
				</div>

				<div className="revision-height-box">
					<p>Revision Height: {revisionHeight}</p>
				</div>

				<div className="refresh-count-box">
					<p>Refresh Count: {refreshCount}</p>
				</div>
			</div>
		);
	}

	function ClientsTable({ clients }) {
		return (
			<table>
				<thead>
					<tr>
						<th onClick={() => requestSort('client_id')}>Client ID</th>
						<th onClick={() => requestSort('height')}>Revision Height</th>
						<th onClick={() => requestSort('number')}>Revision Number</th>
					</tr>
				</thead>
				<tbody>
					{processedClients.map((client, index) => (
						<tr key={index}>
							<td>{client.client_id}</td>
							<td>{client.client_state.latest_height.revision_height}</td>
							<td>{client.client_state.latest_height.revision_number}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	function ClientControls() {
		return (
			<div className="top-controls">
				<div className="search-container">
					<input
						type="text"
						className="search-input"
						placeholder="Search clients..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
					<select className="filter-select" value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
						<option value="client_id">Client ID</option>
						<option value="height">Revision Height</option>
						<option value="number">Revision Number</option>
					</select>
				</div>

				<div className="count-box">
					<p>Clients: {clients.length}</p>
				</div>

				<div className="refresh-count-box">
					<p>Refresh Count: {refreshCount}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="app-container">
			<div className="navigation-frame">
				<button onClick={() => { setActiveView('connections'); console.log('set connections') }}>Connections</button>
				<button onClick={() => { setActiveView('channels') }}>Channels</button>
				<button onClick={() => { setActiveView('clients') }}>Clients</button>
			</div>
			<div className="main-content-frame">
				<div className="App">
					<header className="App-header">
					<DataHeader view={activeView} />
					{activeView === 'channels' && <ChannelControls />}
					{activeView === 'connections' && <ConnectionControls />}
					{activeView === 'clients' && <ClientControls />}
					{activeView === 'channels' && <ChannelsTable channels={channels} />}
					{activeView === 'connections' && <ConnectionsTable connections={connections} />}
					{activeView === 'clients' && <ClientsTable clients={clients} />}
					</header>
				</div>
			</div>
		</div>
	);
}

export default App;
