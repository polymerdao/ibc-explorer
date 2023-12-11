import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

function App() {
    const [channels, setChannels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterColumn, setFilterColumn] = useState('channel_id');
    const [revisionHeight, setRevisionHeight] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [refreshCount, setRefreshCount] = useState(0);

    function removeStatePrefix(state) {
	return state.replace(/^STATE_/, '');
    }

    function parseChannelID(channelId) {
	const matches = channelId.match(/\d+/);
	return parseInt(matches ? matches[0] : -1, 10);
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

    const requestSort = key => {
	let direction = 'ascending';
	if (sortConfig.key === key && sortConfig.direction === 'ascending') {
	    direction = 'descending';
	}
	setSortConfig({ key, direction });
    }

    // Function to fetch data from Flask
    const fetchData = () => {
	fetch('http://127.0.0.1:5000/data')  // Adjust this URL to your Flask endpoint
	    .then(response => response.json())
	    .then(data => {
		let updatedChannels = data.channels.map(channel => ({
		    ...channel,
		    state: removeStatePrefix(channel.state)
		}));
		setChannels(updatedChannels);
		setRevisionHeight(data.height.revision_height);
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
    }, []);

    return (
	<div className="app-container">
	    <div className="navigation-frame">
			<button onClick={() => {/* handle navigation */}}>Connections</button>
			<button onClick={() => {/* handle navigation */}}>Channels</button>
			<button onClick={() => {/* handle navigation */}}>Clients</button>
		</div>
	    <div className="main-content-frame">
			<div className="App">
		    	<header className="App-header">
				<h1>Channel Data</h1>

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

					<div className="channel-count-box">
						<p>Channels: {channels.length}</p>
					</div>

					<div className="revision-height-box">
						<p>Revision Height: {revisionHeight}</p>
					</div>

					<div className="refresh-count-box">
						<p>Refresh Count: {refreshCount}</p>
					</div>
				</div>
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
		    	</header>
			</div>
		</div>
	</div>
	    );
    }

    export default App;
