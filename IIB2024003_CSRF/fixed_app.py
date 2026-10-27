"""
FIXED VERSION - same app, CSRF mitigated.
Run: python3 fixed_app.py   -> http://127.0.0.1:5000

Try the SAME attacker.html against this server: the forged transfer
is now rejected with "CSRF token missing or invalid".
"""
from flask import Flask, request, session, redirect, url_for, render_template_string
import secrets

app = Flask(__name__)
app.secret_key = "dev-secret-key-change-me"

# --- FIX (defence 2): reject the cookie on cross-site requests ---
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"   # use "Strict" for max safety
app.config["SESSION_COOKIE_SECURE"] = False     # set True in production (HTTPS)

USERS = {
    "alice": {"password": "Alice@123", "balance": 1000},
    "bob":   {"password": "bob123",   "balance": 500},
}

def get_csrf_token():
    """Issue one random token per session, reused for every form."""
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(32)
    return session["csrf_token"]

LOGIN_PAGE = """
<h2>Mini-Bank Login (FIXED build)</h2>
<form method="POST" action="/login">
  Username: <input name="username"><br><br>
  Password: <input name="password" type="password"><br><br>
  <button type="submit">Login</button>
</form>
"""

DASHBOARD_PAGE = """
<h2>Welcome, {{ user }}</h2>
<p>Balance: Rs {{ balance }}</p>

<form method="POST" action="/transfer">
  <!-- FIX (defence 1): secret, unguessable, per-session token.
       An attacker's cross-site form cannot read this value, so it
       cannot include a valid one in a forged request. -->
  <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
  Transfer to: <input name="to"><br><br>
  Amount: <input name="amount"><br><br>
  <button type="submit">Transfer</button>
</form>

<p><a href="/logout">Logout</a></p>
"""

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("dashboard"))
    return render_template_string(LOGIN_PAGE)

@app.route("/login", methods=["POST"])
def login():
    u, p = request.form.get("username"), request.form.get("password")
    if u in USERS and USERS[u]["password"] == p:
        session["user"] = u
        return redirect(url_for("dashboard"))
    return "Invalid credentials", 401

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("index"))
    user = session["user"]
    return render_template_string(
        DASHBOARD_PAGE,
        user=user,
        balance=USERS[user]["balance"],
        csrf_token=get_csrf_token(),
    )

# ======================================================================
# (d) MITIGATION IMPLEMENTED: synchronizer token pattern.
# The request is only honoured if it carries the exact token that was
# handed to this specific session. A forged cross-origin form has no
# way to obtain or guess that value.
# ======================================================================
@app.route("/transfer", methods=["POST"])
def transfer():
    if "user" not in session:
        return redirect(url_for("index"))

    submitted_token = request.form.get("csrf_token", "")
    real_token = session.get("csrf_token", "")
    if not submitted_token or not secrets.compare_digest(submitted_token, real_token):
        return "CSRF token missing or invalid — request rejected", 403

    sender = session["user"]
    to = request.form.get("to")
    try:
        amount = int(request.form.get("amount", 0))
    except ValueError:
        return "Invalid amount", 400

    if to not in USERS or to == sender or amount <= 0 or USERS[sender]["balance"] < amount:
        return "Transfer failed", 400

    USERS[sender]["balance"] -= amount
    USERS[to]["balance"] += amount
    return f"Transferred Rs {amount} from {sender} to {to}. New balance: Rs {USERS[sender]['balance']}"

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True, port=5000)
