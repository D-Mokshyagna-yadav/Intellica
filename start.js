const { spawn } = require('child_process');
const path = require('path');

const writeLine = (message) => process.stdout.write(`${message}\n`);
const writeError = (message) => process.stderr.write(`${message}\n`);

writeLine('🚀 Starting Intellica Project...\n');

// Start backend server
writeLine('📡 Starting Backend Server...');
const backendProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe', // Capture output to detect port
  shell: true
});

let backendPort = 5000; // default

// Capture backend output to find the port
backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  writeLine(output.trimEnd());

  // Look for port information
  const portMatch = output.match(/Server running on port (\d+)/) || output.match(/"port":\s*(\d+)/) || output.match(/Server started.*port.*?(\d+)/);
  if (portMatch) {
    backendPort = parseInt(portMatch[1]);
    writeLine(`\n🌐 Detected backend port: ${backendPort}`);

    // Start frontend with the correct port
    writeLine('\n💻 Starting Frontend Server...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_API_ORIGIN: process.env.VITE_API_ORIGIN || (process.env.DEV_BACKEND_HOST ? `http://${process.env.DEV_BACKEND_HOST}:${backendPort}` : "")
      }
    });

    // Handle process exits
    frontendProcess.on('close', (code) => {
      writeLine(`\n❌ Frontend server exited with code ${code}`);
    });
  }
});

backendProcess.stderr.on('data', (data) => {
  writeError(data.toString().trimEnd());
});

// Handle backend process exit
backendProcess.on('close', (code) => {
  writeLine(`\n❌ Backend server exited with code ${code}`);
});

writeLine('⏳ Waiting for backend to start and detect port...');