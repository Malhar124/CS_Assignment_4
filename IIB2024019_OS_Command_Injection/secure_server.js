/**
 * CS IT-30001: Web Server Security Assignment
 * Category: OS Command Injection | Variant 1: In-Band (Command Output Returned)
 * Platform: Windows
 * 
 * SECURE IMPLEMENTATION (MITIGATION: Parameterized Execution via Argument Vector)
 */

const express = require('express');
const { execFile } = require('child_process');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Minimal HTML Form for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ping Utility (Secured)</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
        .box { max-width: 600px; padding: 20px; border: 1px solid #ccc; }
        input[type="text"] { width: 100%; padding: 8px; margin: 8px 0; box-sizing: border-box; }
        button { padding: 8px 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>Ping Diagnostic Utility (Secured)</h2>
        <p>Uses parameterized execution (<code>execFile</code>) with an argument vector.</p>
        <form method="POST" action="/ping">
          <input type="text" name="target" value="127.0.0.1 & whoami" required />
          <button type="submit">Ping Host</button>
        </form>
        <p><small>Testing previous exploit payload <code>127.0.0.1 & whoami</code> will fail DNS lookup as no shell is spawned.</small></p>
      </div>
    </body>
    </html>
  `);
});

// SECURED CODE PATH: Parameterized Execution using execFile
app.post('/ping', (req, res) => {
  const target = req.body.target;

  if (!target) {
    return res.status(400).send('Error: Target parameter is required.');
  }

  // MITIGATION:
  // 1. execFile directly invokes 'ping.exe' without cmd.exe.
  // 2. Arguments are isolated in an array (argument vector).
  // 3. Shell metacharacters (&, |, etc.) are treated as literal characters of the target argument.
  const executable = 'ping.exe';
  const args = ['-n', '1', target];

  execFile(executable, args, (error, stdout, stderr) => {
    const output = stdout || stderr || (error ? error.message : 'No output produced.');

    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      return res.json({ target, executable, args, output, blocked: true });
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ping Results (Secured)</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          pre { background: #f4f4f4; border: 1px solid #ddd; padding: 12px; font-family: Consolas, monospace; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h3>Executable: <code>${executable}</code></h3>
        <p><b>Argument Vector:</b> <code>${JSON.stringify(args)}</code></p>
        <p><b>Status:</b> Mitigated (Shell bypassed, metacharacters neutralized)</p>
        <pre>${output}</pre>
        <a href="/">&larr; Back</a>
      </body>
      </html>
    `);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[+] Secured Server running at http://localhost:${PORT}`);
});
