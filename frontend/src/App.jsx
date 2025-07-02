import React, { useState } from 'react';

function App() {
  const [subnet, setSubnet] = useState('');
  const [devices, setDevices] = useState([]);

  const handleDiscover = async () => {
    const response = await fetch(`http://127.0.0.1:8000/discover?subnet=${subnet}`);
    const data = await response.json();
    console.log(data); // <== ça affiche bien le JSON
    setDevices(data.devices);
  };

  return (
    <div className="App">
      <h1>Network Discovery</h1>
      <input
        type="text"
        placeholder="Enter subnet"
        value={subnet}
        onChange={(e) => setSubnet(e.target.value)}
      />
      <button onClick={handleDiscover}>Discover</button>

      <h2>Devices</h2>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            {device.ip} - 
            {device.status === 'online' ? (
              <span style={{ color: 'green' }}>🟢</span>
            ) : (
              <span style={{ color: 'red' }}>🔴</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
