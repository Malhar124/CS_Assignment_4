"""
SQL Injection demonstration (educational, localhost only).

Covers SQL injection, Variant 1 from Table 1:
  Variant 1: Authentication bypass

The variant runs in two modes:
  mode=vuln : vulnerable code path (string concatenation)
  mode=safe : mitigated code path (parameterised query)

Run:
  python3 app.py
Then open http://127.0.0.1:5000/

WARNING: The vulnerable path exists only to demonstrate the flaw on
your own machine. Never deploy this. Never test it against any system
you do not own.
"""

import os
import sqlite3

from flask import Flask, request, render_template, g

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo.db")

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    """Return a per-request SQLite connection."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Create and seed the database. Safe to call repeatedly."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(
        """
        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
            id       INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role     TEXT NOT NULL
        );

        INSERT INTO users (username, password, role) VALUES
            ('alice', 'alicepass',   'user'),
            ('bob',   'bobpass',     'user'),
            ('admin', 'S3cr3t_Admin','admin');
        """
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# --- Variant 1: Authentication bypass --------------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    result = None
    query_text = None
    username = ""
    mode = request.values.get("mode", "vuln")

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        db = get_db()

        if mode == "vuln":
            # VULNERABLE: user input concatenated directly into SQL.
            # Payload  username = admin' --   bypasses the password check.
            query_text = (
                "SELECT id, username, role FROM users "
                "WHERE username = '" + username + "' "
                "AND password = '" + password + "'"
            )
            try:
                row = db.execute(query_text).fetchone()
            except sqlite3.Error as exc:
                result = {"error": str(exc)}
                row = None
        else:
            # SAFE: parameterised query. Input is data, never code.
            query_text = (
                "SELECT id, username, role FROM users "
                "WHERE username = ? AND password = ?"
            )
            row = db.execute(query_text, (username, password)).fetchone()

        if result is None:
            if row is not None:
                result = {
                    "ok": True,
                    "user": row["username"],
                    "role": row["role"],
                }
            else:
                result = {"ok": False}

    return render_template(
        "login.html",
        mode=mode,
        result=result,
        query_text=query_text,
        username=username,
    )


if __name__ == "__main__":
    init_db()
    # host=127.0.0.1 keeps it on this machine only.
    app.run(host="127.0.0.1", port=5000, debug=False)
