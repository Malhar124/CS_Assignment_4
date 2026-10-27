# CSRF Demo — POST-based Forged Action (Auto-submitting Form)

IT-30001 Cyber Security | Web Server Security Assignment
Category: Cross-Site Request Forgery (CSRF) | Variant: POST-based forged action

## Files
- `vulnerable_app.py` — mini "bank" with a transfer endpoint, no CSRF defence
- `attacker.html` — the malicious page; auto-submits a forged POST on load
- `fixed_app.py` — same app, with the mitigation applied
- `README.md` — this file

## How to run
```
pip install flask
python3 vulnerable_app.py      # or: python3 fixed_app.py
```
Visit `http://127.0.0.1:5000`, log in as `alice / alice123`.

## (a) Vulnerable implementation
`/transfer` in `vulnerable_app.py` moves money between accounts and
identifies the sender purely from the session cookie. It performs no
check that the request was actually submitted from the bank's own
page. `SESSION_COOKIE_SAMESITE` is explicitly set to `None`, so the
browser will attach the cookie even to a request triggered from a
completely different site.

## (b) Working exploit
1. Start `vulnerable_app.py`, log in to the bank as alice in your browser.
2. In a second tab, open `attacker.html` (e.g. via `python3 -m http.server 8000`
   in the same folder, or just double-click to open as `file://`).
3. The page auto-submits its hidden form to `http://127.0.0.1:5000/transfer`
   with `to=bob&amount=500` the instant it loads — no click needed.
4. Check alice's balance: it has dropped by 500, transferred to bob,
   even though alice never pressed "Transfer" on the bank site.

Record this sequence for your video.

## (c) Root cause
A state-changing request (moving money) is accepted on the strength of
the session cookie alone. Cookies are attached by the browser
automatically to any request to that domain, from any originating
page, so the server cannot distinguish "alice clicked Transfer on our
site" from "alice's browser was tricked into submitting a form on an
attacker's site."

## (d) Mitigation implemented (synchronizer token + SameSite)
In `fixed_app.py`:
- Each session gets a random, unguessable `csrf_token` (`secrets.token_hex(32)`),
  embedded as a hidden field in the genuine transfer form.
- `/transfer` rejects any POST whose `csrf_token` does not match the
  one stored server-side for that session (`secrets.compare_digest`
  avoids timing attacks).
- `SESSION_COOKIE_SAMESITE` is set to `"Lax"`, so the browser itself
  won't even send the cookie on a cross-site POST.

**Proof of fix:** run `attacker.html` against `fixed_app.py` — the
transfer is rejected with `403 CSRF token missing or invalid`.
(Screenshot this for Table 2(d).)

## (e) Other mitigations (theory, for the viva)
- **SameSite cookies** (`Lax`/`Strict`): tells the browser not to send
  the cookie on cross-site requests at all. `Lax` still allows
  top-level GET navigations (so normal links keep working); `Strict`
  blocks those too. Cheap, browser-enforced, but alone it depends on
  browser support/version and doesn't help old clients — hence
  pairing it with a token is best practice.
- **Re-authentication for sensitive actions**: requiring the user to
  re-enter their password (or a one-time code) before a high-value
  action (e.g. large transfer) confirms *current, deliberate* intent,
  not just a live session — defeats CSRF even if a token were somehow
  leaked.
- **Avoiding state-changing GET requests**: GET requests are trivially
  forgeable via a plain `<img src=...>` or link with no JavaScript at
  all. Restricting all state changes to POST/PUT/DELETE closes that
  easiest exploitation path and is the baseline hygiene the other
  defences build on.

## Ownership
| Member name | Roll number | Category | Variant implemented |
|---|---|---|---|
|GAURI JOSHI |IIB2024003 | CSRF | POST-based forged action (auto-submitting form) |
