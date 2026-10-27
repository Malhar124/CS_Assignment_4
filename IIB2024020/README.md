# Web Server Security — Exploitation and Mitigation

Group submission for **Cyber Security (IT-30001)**, Autumn Semester 2026,
Department of Information Technology, IIIT Allahabad.
Instructor: Dr. Soumyadev Maity.

Each member implements **one variant** of a web server vulnerability category
(SQL injection, OS command injection, XSS, CSRF): a vulnerable code path, a
working exploit, and one implemented mitigation. Every member's work lives in
their own folder, named by roll number.

All demos run on `127.0.0.1` only and exist purely for a controlled local
demonstration for this assignment. Do not deploy them, and test only this
group's own application.

---

## Ownership declaration (Table 3)

| Member name | Roll number | Category | Variant implemented | Folder |
|-------------|-------------|----------|---------------------|--------|
| Malhar Udmale | IIB2024020 | SQL injection | Authentication bypass (Variant 1) | [`IIB2024020/`](IIB2024020/) |
| _<name>_ | _<roll>_ | _<category>_ | _<variant>_ | _<folder>_ |
| _<name>_ | _<roll>_ | _<category>_ | _<variant>_ | _<folder>_ |
| _<name>_ | _<roll>_ | _<category>_ | _<variant>_ | _<folder>_ |

> Each member: add a folder named by your roll number, put your variant inside
> it with its own README, and fill in your row above.

---

## Repository layout

```
.
├── README.md                              This file (group overview + ownership)
├── Assignment_Web_Server_Security.docx.pdf  The assignment brief
└── IIB2024020/                            Malhar Udmale — SQL injection, Variant 1
    ├── README.md                          Variant write-up (exploit + mitigation)
    ├── app.py
    ├── requirements.txt
    └── templates/
```

## Running a member's demo

Each folder is self-contained. For example:

```bash
cd IIB2024020
pip install -r requirements.txt
python3 app.py
# open http://127.0.0.1:5000/
```

See each member's folder README for the exact exploit payload, the mitigation,
and the viva checklist for that variant.
