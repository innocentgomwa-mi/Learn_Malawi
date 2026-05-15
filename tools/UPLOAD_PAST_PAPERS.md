Upload Past Papers (batch)
=========================

Usage
-----

1. Install dependencies (one-time):

```bash
npm install axios form-data
```

2. Create a manifest JSON file listing the papers to upload. Example `msce-manifest.json`:

```json
[
  {
    "filePath": "./local-papers/MSCE_Mathematics_2022.pdf",
    "markingSchemePath": "./local-papers/MSCE_Mathematics_2022_scheme.pdf",
    "title": "MSCE Mathematics 2022",
    "subject": "Mathematics",
    "level": "MSCE",
    "year": 2022,
    "class": "Form 4",
    "description": "MSCE Mathematics paper with marking scheme"
  }
]
```

3. Run the uploader script:

```bash
node tools/upload-pastpapers.js msce-manifest.json http://localhost:3000 YOUR_ADMIN_BEARER_TOKEN
```

Notes
-----
- The backend expects authenticated requests for uploads — provide an admin JWT token as the third argument or set `ADMIN_TOKEN` env var.
- Files will be sent as multipart form-data with fields `paper` and `markingScheme`.
- If you don't have files and instead have hosted URLs, include `paperUrl` and/or `markingSchemeUrl` fields in the manifest entries (no file upload required).

If you'd like, I can add an admin upload UI in the AdminDashboard to manage uploads from the browser. Tell me if you want that and I will implement it.
