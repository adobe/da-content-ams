/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import getObject from '../src/storage/object.js';
import getFromAdmin from '../src/storage/admin.js';
import worker from '../src/index.js';

vi.mock('../src/storage/object.js', () => ({
  default: vi.fn(),
}));

vi.mock('../src/storage/admin.js', () => ({
  default: vi.fn(),
}));

const mockEnv = {
  AEM_BUCKET_NAME: process.env.AEM_BUCKET_NAME,
  HELIX_ADMIN_IPS: process.env.HELIX_ADMIN_IPS,
  ADMIN_EXCEPTED_ORGS: process.env.ADMIN_EXCEPTED_ORGS,
  CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  daadmin: { fetch: vi.fn() },
};

function makeReq(path, headers = {}) {
  return new Request(`https://content-stg.ssa-da.live${path}`, { headers });
}

describe('fetch handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 for /favicon.ico', async () => {
    const resp = await worker.fetch(makeReq('/favicon.ico'), mockEnv);
    expect(resp.status).toBe(404);
  });

  it('returns robots.txt for /robots.txt', async () => {
    const resp = await worker.fetch(makeReq('/robots.txt'), mockEnv);
    expect(resp.status).toBe(200);
    const text = await resp.text();
    expect(text).toContain('User-agent: *');
  });

  it('returns 404 when org is missing', async () => {
    const resp = await worker.fetch(makeReq('/'), mockEnv);
    expect(resp.status).toBe(404);
  });

  it('returns 404 when site is missing', async () => {
    const resp = await worker.fetch(makeReq('/adobe'), mockEnv);
    expect(resp.status).toBe(404);
  });

  it('fetches from storage for embeddable .png asset', async () => {
    getObject.mockResolvedValue({ body: 'img', status: 200, contentType: 'image/png' });
    await worker.fetch(makeReq('/adobe/da-live/image.png'), mockEnv);
    expect(getObject).toHaveBeenCalled();
    expect(getFromAdmin).not.toHaveBeenCalled();
  });

  it('fetches from storage for embeddable .jpg asset', async () => {
    getObject.mockResolvedValue({ body: 'img', status: 200, contentType: 'image/jpeg' });
    await worker.fetch(makeReq('/adobe/da-live/photo.jpg'), mockEnv);
    expect(getObject).toHaveBeenCalled();
  });

  it('fetches from storage for embeddable .mp4 asset', async () => {
    getObject.mockResolvedValue({ body: 'vid', status: 200, contentType: 'video/mp4' });
    await worker.fetch(makeReq('/adobe/da-live/video.mp4'), mockEnv);
    expect(getObject).toHaveBeenCalled();
  });

  it('fetches from storage for allowlisted IP + org', async () => {
    getObject.mockResolvedValue({ body: '', status: 200, contentType: 'text/html' });
    const allowedIp = process.env.HELIX_ADMIN_IPS.split(',')[0].trim();
    const req = new Request('https://content-stg.ssa-da.live/adobe/da-live/page', {
      headers: { 'cf-connecting-ip': allowedIp },
    });
    await worker.fetch(req, mockEnv);
    expect(getObject).toHaveBeenCalled();
    expect(getFromAdmin).not.toHaveBeenCalled();
  });

  it('proxies to admin for regular HTML requests', async () => {
    getFromAdmin.mockResolvedValue(new Response('html', { status: 200 }));
    const resp = await worker.fetch(makeReq('/adobe/da-live/page'), mockEnv);
    expect(getFromAdmin).toHaveBeenCalled();
    expect(resp.status).toBe(200);
  });

  it('does not allowlist correct IP with non-matching org', async () => {
    getFromAdmin.mockResolvedValue(new Response('', { status: 200 }));
    const req = new Request('https://content-stg.ssa-da.live/unknown-org/site/page', {
      headers: { 'cf-connecting-ip': '1.2.3.4' },
    });
    await worker.fetch(req, mockEnv);
    expect(getFromAdmin).toHaveBeenCalled();
    expect(getObject).not.toHaveBeenCalled();
  });

  it('does not allowlist matching org with wrong IP', async () => {
    getFromAdmin.mockResolvedValue(new Response('', { status: 200 }));
    const req = new Request('https://content-stg.ssa-da.live/adobe/da-live/page', {
      headers: { 'cf-connecting-ip': '9.9.9.9' },
    });
    await worker.fetch(req, mockEnv);
    expect(getFromAdmin).toHaveBeenCalled();
    expect(getObject).not.toHaveBeenCalled();
  });
});
