# SQL Injection: Exploitation and Mitigation (Educational)

This module covers the **SQL injection** category for the Web Server Security
assignment, **Variant 1: Authentication bypass**. It shows one vulnerable code
path and one fixed code path, in a small Flask application with a seeded SQLite
database.

The application runs on `127.0.0.1` only. It is for a controlled local
demonstration. Do not deploy it. Do not test it against any system you do not
own.

---

## 1. Ownership declaration (Table 3)

| Member name | Roll number | Category | Variant implemented |
|-------------|-------------|----------|---------------------|
| Malhar Udmale | IIB2024020 | SQL injection | Authentication bypass (Variant 1) |

---

## 2. How to run

```bash
pip install -r requirements.txt
python3 app.py
```

Open `http://127.0.0.1:5000/`. The database is created and seeded on each start.

Seeded accounts:

| username | password      | role  |
|----------|---------------|-------|
| alice    | alicepass     | user  |
| bob      | bobpass       | user  |
| admin    | S3cr3t_Admin  | admin |

The login page has a **mode** switch:
- `mode=vuln` runs the vulnerable code path.
- `mode=safe` runs the fixed code path.

---

## 3. Variant 1: Authentication bypass

### (a) Vulnerable implementation
Route `/login`, `mode=vuln`, in `app.py`. User input is concatenated into the
SQL string:

```python
query_text = (
    "SELECT id, username, role FROM users "
    "WHERE username = '" + username + "' "
    "AND password = '" + password + "'"
)
row = db.execute(query_text).fetchone()
```

### (b) Working exploit
On `http://127.0.0.1:5000/login?mode=vuln`:
- Username: `admin' --`
- Password: anything (for example `wrongpass`)

The executed query becomes:

```sql
SELECT id, username, role FROM users
WHERE username = 'admin' --' AND password = 'wrongpass'
```

The `--` starts a SQL comment, so the password check is removed. You log in as
`admin` with no valid password.

**Evidence:** vulnerable mode returns `Logged in as admin (role: admin)`.

### (c) Root cause
User input is concatenated into the query text, so the input `' --` is parsed
as SQL syntax instead of as a data value.

### (d) Mitigation implemented
Route `/login`, `mode=safe`. A **parameterised query** separates code from data:

```python
query_text = (
    "SELECT id, username, role FROM users "
    "WHERE username = ? AND password = ?"
)
row = db.execute(query_text, (username, password)).fetchone()
```

The driver binds `username` and `password` as literal values. The payload
`admin' --` is now searched for as a literal username, which does not exist, so
login fails.

**Evidence:** safe mode returns `Login failed.` for the same payload.
Take a screenshot of this blocked attempt for the video.

---

## 4. Other mitigations (theory)

The implemented fix above is **parameterised queries** (prepared statements),
which is the primary defence: the database treats bound input as data, never as
SQL code, so injected syntax cannot change the query structure. The other
options from the slides, for defence in depth:

- **Input validation with allow-lists.** Accept only input that matches an
  expected pattern (for example a username of letters and digits). Reject
  everything else. This shrinks the attack surface before the query runs. It is
  a supporting control, not a replacement for parameterisation, because some
  valid data (names with an apostrophe) legitimately contains SQL
  metacharacters.

- **Least-privilege database accounts.** The application connects with an
  account that holds only the rights it needs (for example `SELECT` on specific
  tables, no `DROP`, no access to admin tables). If an injection still occurs,
  the damage it can do is limited to what that account may touch.

- **Safe error handling.** Do not return raw database errors to the client. A
  verbose error (table names, SQL fragments) helps an attacker map the database
  and tune a payload. Log the detail server-side and show the user a generic
  message.

Additional industry controls that reinforce these: using an ORM or query builder
that parameterises by default, stored procedures that themselves use bound
parameters, and a web application firewall as an outer filter (not a primary
defence).

---

## 5. Files

```
app.py               Flask app: Variant 1, vuln and safe modes
requirements.txt     Flask
templates/
  index.html         Links and payload
  login.html         Variant 1 UI
demo.db              SQLite database (created on first run)
```

## 6. Viva checklist

- Open `mode=vuln`, run the payload, show the login bypass.
- Open `mode=safe`, run the same payload, show it blocked (screenshot).
- Point to the exact vulnerable line and the exact fixed line in `app.py`.
- State the one-line root cause.
- Explain the three other mitigations from section 4.
