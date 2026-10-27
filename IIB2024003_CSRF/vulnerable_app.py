"""
VULNERABLE VERSION - CSRF demo (POST-based forged action, auto-submitting form)
Run: python3 vulnerable_app.py   -> http://127.0.0.1:5000

Login as:  alice / alice123   or   bob / bob123
"""
from flask import Flask, request, session, redirect, url_for, render_template_string

app = Flask(__name__)
app.secret_key = "dev-secret-key-change-me"

# --- ROOT CAUSE (part 1): cookie is allowed on cross-site requests too ---
app.config["SESSION_COOKIE_SAMESITE"] = None   # i.e. no SameSite protection
app.config["SESSION_COOKIE_SECURE"] = False    # demo only (no HTTPS on localhost)

# In-memory "bank" — good enough for a demo, not a real datastore
USERS = {
    "alice": {"password": "Alice@123", "balance": 1000},
    "bob":   {"password": "bob123",   "balance": 500},
}

LOGIN_PAGE = """
<h2>Mini-Bank Login (VULNERABLE build)</h2>
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
    return render_template_string(DASHBOARD_PAGE, user=user, balance=USERS[user]["balance"])

# ======================================================================
# (a) VULNERABLE IMPLEMENTATION
# This endpoint changes state (moves money) based SOLELY on the session
# cookie. It never checks whether the request actually originated from
# the bank's own page, so any site the victim's browser visits can
# silently fire this request and the cookie will be attached to it.
# ======================================================================
@app.route("/transfer", methods=["POST"])
def transfer():
    if "user" not in session:
        return redirect(url_for("index"))

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
