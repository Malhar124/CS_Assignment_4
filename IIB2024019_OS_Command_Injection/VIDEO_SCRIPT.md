# Video Demonstration Script: OS Command Injection (In-Band)
**Course:** Cyber Security (IT-30001) &bull; IIIT Allahabad  
**Student Name:** Aviral Awasthi &bull; **Roll Number:** IIB2024019  
**Category:** OS Command Injection  
**Variant:** Variant 1: In-band (Command output returned)  
**Target Duration:** 2 minutes 45 seconds – 3 minutes  

---

## Preparation Before Recording
1. **VS Code:** Open `C:\cs\CS_Lab3` with [`server.js`](file:///c:/cs/CS_Lab3/server.js) open. Split screen or have tabs ready to show lines 24–36 (Mode 1 / vulnerable) and lines 37–47 (Mode 2 / secure).
2. **Web Browser:** Open `http://localhost:3000` with the Network Diagnostic tool loaded.
3. **Terminal:** Server should already be running (`npm start` or `node server.js`).

---

## Timed Video Script

### 0:00 – 0:25 | Part 1: Introduction & Ownership Declaration
* **Screen to Show:** Browser showing the application at `http://localhost:3000` or VS Code showing Table 3 in `README.md`.
* **Voice-Over Narration:**
  > "Hello everyone. My name is Aviral Awasthi, Roll Number IIB2024019. In this video demonstration for our Web Server Security assignment, I am presenting the **OS Command Injection** category, specifically **Variant 1: In-band Command Injection**, where the output of the injected command is directly returned to the client. I will walk through the vulnerable code path, demonstrate the working exploit, explain the root cause, show the implemented mitigation blocking the attack, and summarize the alternative mitigation theories."

---

### 0:25 – 0:55 | Part 2: (a) Vulnerable Implementation & (c) Root Cause
* **Screen to Show:** Switch to **VS Code** with [`server.js`](file:///c:/cs/CS_Lab3/server.js) on screen.
  * *Highlight lines 24–36:*
    ```javascript
    const command = `ping -n 1 ${target}`;
    exec(command, (error, stdout, stderr) => { ... });
    ```
* **Voice-Over Narration:**
  > "Here in `server.js`, you can see the vulnerable code path in Mode 1. The application takes the untrusted `target` parameter submitted by the user and directly concatenates it into a command string: `ping -n 1 ${target}`.
  >
  > It then passes this string to Node.js's `child_process.exec()` function. On Windows, `exec` invokes the system command interpreter `cmd.exe`.
  >
  > The **root cause** is that user input is concatenated directly into a shell interpreter without sanitization or escaping. Because `cmd.exe` parses shell control metacharacters—such as the ampersand `&`—the user's input breaks out of the data context and is executed as arbitrary shell instructions. Furthermore, the callback captures both `stdout` and `stderr` and returns them directly in the response, making this an **in-band** injection flaw."

---

### 0:55 – 1:45 | Part 3: (b) Working Exploit Demonstration & Real-World Harmful Impact
* **Screen to Show:** Switch to the **Browser** at `http://localhost:3000`.
  1. Show that **Mode 1** is selected at the top.
  2. In the "Target Host / IP Address" field, type: `127.0.0.1 & whoami`
  3. Click the **"Run Diagnostic"** button.
  4. Point your cursor at the bottom of the Console Output box where the username appears.
* **Voice-Over Narration:**
  > "Now, let us switch to the live application in the browser.
  >
  > Notice that Mode 1 is active. In a normal use case, an administrator would enter an IP like `127.0.0.1`. However, as an attacker, I will append Windows command separator `&` followed by an arbitrary system command: `127.0.0.1 & whoami`.
  >
  > When I click 'Run Diagnostic', the server invokes `cmd.exe` with our input. As you can see in the console output, not only did the server execute the ping request, but immediately afterwards it executed our injected command, printing `bimaar\avira`—the exact system user context running this web server. Because this output is directly visible in the HTTP response, Variant 1 (In-band extraction) is completely successful.
  >
  > While `whoami` is a harmless reconnaissance command used here as a proof of concept, in a real-world attack, this flaw allows catastrophic actions:
  > - **Credential & Data Theft:** An attacker could execute `type .env` or `type config.json` to steal database passwords and API secret keys directly through the in-band output.
  > - **Backdoor Account Creation:** Running `net user hacker Password123! /add` followed by adding that user to the local Administrators group grants permanent, unauthorized system access.
  > - **Malware & Remote Control:** Using `powershell -c "Invoke-WebRequest ..."` to download and execute ransomware or spawn a persistent reverse shell back to the attacker's machine.
  > - **Data Destruction:** Running destructive commands like `del /f /q` to permanently delete application files and databases."

---

### 1:45 – 2:25 | Part 4: (d) Implemented Mitigation (Parameterized Execution)
* **Screen to Show:** 
  1. Briefly switch to **VS Code** and highlight lines 37–47 in `server.js`:
     ```javascript
     const executable = 'ping.exe';
     const args = ['-n', '1', target];
     execFile(executable, args, (error, stdout, stderr) => { ... });
     ```
  2. Switch back to the **Browser**, select **Mode 2**, keep the exact same payload `127.0.0.1 & whoami`, and click **"Run Diagnostic"**.
  3. Highlight the error output in the Console window.
* **Voice-Over Narration:**
  > "To secure this, we implemented **Parameterized Execution using an Argument Vector**, visible here in Mode 2 of `server.js`. Instead of `exec`, we use `child_process.execFile()`, specifying `ping.exe` as the binary and passing the target inside a discrete array: `['-n', '1', target]`.
  >
  > Now, let us test this in the browser. I switch to **Mode 2** and enter the exact same payload: `127.0.0.1 & whoami`. 
  >
  > When I click 'Run Diagnostic', notice the output: `Ping request could not find host 127.0.0.1 & whoami`. 
  >
  > The attack has failed completely! Why? Because `execFile` invokes the binary directly via OS process creation APIs without launching `cmd.exe`. Without a shell interpreter, the ampersand `&` loses its special meaning and is treated strictly as a literal character in the hostname. The injected `whoami` command was never executed, completely neutralizing all the harmful attacks discussed earlier."

---

### 2:25 – 2:55 | Part 5: (e) Alternative Mitigation Theories
* **Screen to Show:** Keep the browser or `README.md` visible on screen.
* **Voice-Over Narration:**
  > "Finally, to cover the alternative mitigation options discussed in our course lectures:
  >
  > 1. **Avoiding the shell entirely:** Instead of spawning system binaries, we should use native language APIs, such as Node.js's built-in `dns.lookup()` or `net.Socket`. If no external process or shell is spawned, command injection is architecturally impossible.
  > 2. **Parameterized execution with an argument vector:** As demonstrated, separating the binary from its arguments ensures the shell is bypassed and metacharacters are treated purely as literal data.
  > 3. **Allow-list validation:** We should strictly validate input using an allow-list regular expression—for instance, only accepting valid IPv4 octets. Any input containing characters outside the allow-list is rejected before execution.
  > 4. **Principle of least privilege:** The server process should run under an isolated, unprivileged operating system account so that even in the event of an injection flaw, an attacker cannot access sensitive files or compromise the host.
  >
  > Thank you."
