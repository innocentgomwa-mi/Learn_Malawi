#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function upload(entry, apiBase, token) {
  const form = new FormData();
  if (entry.filePath) {
    form.append('paper', fs.createReadStream(path.resolve(entry.filePath)));
  }
  if (entry.markingSchemePath) {
    form.append('markingScheme', fs.createReadStream(path.resolve(entry.markingSchemePath)));
  }

  const fields = ['title','description','subject','level','year','class','paperUrl','markingSchemeUrl'];
  for (const f of fields) {
    if (entry[f] !== undefined && entry[f] !== null) form.append(f, String(entry[f]));
  }

  const headers = form.getHeaders();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${apiBase.replace(/\/$/, '')}/past-papers`;
  const res = await axios.post(url, form, { headers });
  return res.data;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node tools/upload-pastpapers.js <manifest.json> [API_BASE_URL] [ADMIN_TOKEN]');
    process.exit(1);
  }

  const manifestPath = args[0];
  const apiBase = args[1] || process.env.API_BASE_URL || 'http://localhost:3000';
  const token = args[2] || process.env.ADMIN_TOKEN || null;

  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest file not found:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest)) {
    console.error('Manifest must be an array of entries');
    process.exit(1);
  }

  for (const entry of manifest) {
    try {
      console.log('Uploading', entry.title || entry.filePath);
      const result = await upload(entry, apiBase, token);
      console.log('Uploaded:', result.id || JSON.stringify(result));
    } catch (err) {
      console.error('Failed to upload', entry.title || entry.filePath, err.message || err);
    }
  }
}

if (require.main === module) main();
