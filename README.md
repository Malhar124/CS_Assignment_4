# Web Server Security — Exploitation and Mitigation

Group submission for **Cyber Security Assignment 4**,
IIIT Allahabad.
Instructor: Dr. Soumyadev Maity.

Each member implements **one variant** of a web server vulnerability category
(SQL injection, OS command injection, XSS, CSRF): a vulnerable code path, a
working exploit, and one implemented mitigation. Every member's work lives in
their own folder, named by roll number.

---

## Ownership declaration (Table 3)

| Member name | Roll number | Category | Variant implemented | Folder |
|-------------|-------------|----------|---------------------|--------|
| Malhar Udmale | IIB2024020 | SQL injection | Authentication bypass (Variant 1) | [`IIB2024020/`](IIB2024020/) |
| Aviral Awasthi | IIB2024019 | OS command injection | In-band (command output returned) | [`IIB2024019_OS_Command_Injection/`](IIB2024019_OS_Command_Injection/) |
| Gauri Joshi | IIB2024003 | Cross-Site Request Forgery (CSRF) | POST-based forged action (auto-submitting form) (Variant 2) | [`IIB2024003_CSRF/`](IIB2024003_CSRF/) |
| _<name>_ | _<roll>_ | _<category>_ | _<variant>_ | _<folder>_ |

> Each member: add a folder named by your roll number, put your variant inside
> it with its own README, and fill in your row above.

---

## Repository layout

```
.
├── README.md                              This file (group overview + ownership)
├── Assignment_Web_Server_Security.docx.pdf  The assignment brief
├── IIB2024020/                            Malhar Udmale — SQL injection, Variant 1
│   ├── README.md                          Variant write-up (exploit + mitigation)
│   ├── app.py
│   ├── requirements.txt
│   └── templates/
├── IIB2024003_CSRF/                       Gauri Joshi — CSRF, Variant 2
│   ├── README.md
│   ├── vulnerable_app.py
│   ├── fixed_app.py
│   └── attacker.html
└── IIB2024019_OS_Command_Injection/       Aviral Awasthi — OS Command Injection, Variant 1
    ├── README.md                          Variant write-up (exploit + mitigation)
    ├── REPORT_SECTION.md                  Report section for group PDF submission
    ├── VIDEO_SCRIPT.md                    Script for video demonstration
    ├── server.js                          Diagnostic server (Mode 1 & Mode 2)
    ├── package.json
    └── public/
```

## Running a member's demo

Each folder is self-contained. For example:

### SQL Injection (IIB2024020):
```bash
cd IIB2024020
pip install -r requirements.txt
python3 app.py
# open http://127.0.0.1:5000/
```

### OS Command Injection (IIB2024019):
```bash
cd IIB2024019_OS_Command_Injection
npm install
npm start
# open http://localhost:3000/
```

See each member's folder README for the exact exploit payload, the mitigation,
and the viva checklist for that variant.
