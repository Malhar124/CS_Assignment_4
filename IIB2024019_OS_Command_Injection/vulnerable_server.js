/**
 * CS IT-30001: Web Server Security Assignment
 * Category: OS Command Injection | Variant 1: In-Band (Command Output Returned)
 * Platform: Windows (cmd.exe)
 * 
 * VULNERABLE IMPLEMENTATION
 */

const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Minimal HTML Form for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ping Utility (Vulnerable)</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
        .box { max-width: 600px; padding: 20px; border: 1px solid #ccc; }
        input[type="text"] { width: 100%; padding: 8px; margin: 8px 0; box-sizing: border-box; }
        button { padding: 8px 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>Ping Diagnostic Utility (Vulnerable)</h2>
        <p>Enter an IP address or hostname to test connectivity:</p>
        <form method="POST" action="/ping">
          <input type="text" name="target" value="127.0.0.1 & whoami" required />
          <button type="submit">Ping Host</button>
        </form>
        <p><small>Payload examples (Windows): <code>127.0.0.1 & whoami</code>, <code>127.0.0.1 & dir</code></small></p>
      </div>
    </body>
    </html>
  `);
});

// FLAGGED CODE PATH: Vulnerable endpoint
app.post('/ping', (req, res) => {
  const target = req.body.target;

  if (!target) {
    return res.status(400).send('Error: Target parameter is required.');
  }

  // FLAW: Untrusted user input concatenated directly into shell command string
  const command = `ping -n 1 ${target}`;

  // exec() spawns cmd.exe on Windows, parsing metacharacters like '&', '&&', '|'
  exec(command, (error, stdout, stderr) => {
    // IN-BAND: Output of the command is reflected directly back in the HTTP response
    const output = stdout || stderr || (error ? error.message : 'No output produced.');

    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      return res.json({ target, command, output });
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ping Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          pre { background: #f4f4f4; border: 1px solid #ddd; padding: 12px; font-family: Consolas, monospace; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h3>Executed Command: <code>${command}</code></h3>
        <pre>${output}</pre>
        <a href="/">&larr; Back</a>
      </body>
      </html>
    `);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[+] Vulnerable Server running at http://localhost:${PORT}`);
});
