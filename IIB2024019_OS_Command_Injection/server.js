/**
 * Network Diagnostic Utility - Node.js Server
 * Platform: Windows
 * 
 * Mode 1: Uses child_process.exec (String concatenation via shell)
 * Mode 2: Uses child_process.execFile (Parameterized execution via argument vector)
 */

const express = require('express');
const path = require('path');
const { exec, execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ping', (req, res) => {
  const target = req.body.target;
  const mode = req.body.mode || 'mode1';

  if (!target) {
    return res.status(400).json({ output: 'Error: Target host or IP address is required.' });
  }

  // MODE 1: Vulnerable (exec with shell string concatenation)
  if (mode === 'mode1' || mode === '1' || mode === 'unsafe') {
    const command = `ping -n 1 ${target}`;

    exec(command, (error, stdout, stderr) => {
      // In-band: Output of command directly returned
      const output = stdout || stderr || (error ? error.message : 'No output received.');
      res.json({ output });
    });
  } 
  // MODE 2: Secured (execFile with argument vector)
  else {
    const executable = 'ping.exe';
    const args = ['-n', '1', target];

    execFile(executable, args, (error, stdout, stderr) => {
      // In-band: ping.exe fails to find host if metacharacters are passed
      const output = stdout || stderr || (error ? error.message : 'No output received.');
      res.json({ output });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Diagnostic Server listening at http://localhost:${PORT}`);
});
