const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Intellica Project...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backendProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe', // Capture output to detect port
  shell: true
});

let backendPort = 5000; // default

// Capture backend output to find the port
backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);

  // Look for port information
  const portMatch = output.match(/Server running on port (\d+)/);
  if (portMatch) {
    backendPort = parseInt(portMatch[1]);
    console.log(`\n🌐 Detected backend port: ${backendPort}`);

    // Start frontend with the correct port
    console.log('\n💻 Starting Frontend Server...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_BACKEND_PORT: backendPort.toString()
      }
    });

    // Handle process exits
    frontendProcess.on('close', (code) => {
      console.log(`\n❌ Frontend server exited with code ${code}`);
    });
  }
});

backendProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Handle backend process exit
backendProcess.on('close', (code) => {
  console.log(`\n❌ Backend server exited with code ${code}`);
});

console.log('⏳ Waiting for backend to start and detect port...');