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
import getFromAdmin from '../../src/storage/admin.js';

function makeRequest(method, url, headers = {}) {
  return new Request(url, { method, headers });
}

const mockEnv = {
  ADMIN_URL: process.env.ADMIN_URL,
  daadmin: {
    fetch: vi.fn(),
  },
};

describe('getFromAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 for OPTIONS', async () => {
    const req = makeRequest('OPTIONS', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    const resp = await getFromAdmin(req, mockEnv);
    expect(resp.status).toBe(200);
  });

  it('returns 405 for POST', async () => {
    const req = makeRequest('POST', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    const resp = await getFromAdmin(req, mockEnv);
    expect(resp.status).toBe(405);
  });

  it('returns 405 for PUT', async () => {
    const req = makeRequest('PUT', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    const resp = await getFromAdmin(req, mockEnv);
    expect(resp.status).toBe(405);
  });

  it('proxies GET to admin service binding', async () => {
    const mockAdminResp = new Response('page content', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
    mockEnv.daadmin.fetch.mockResolvedValue(mockAdminResp);

    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    const resp = await getFromAdmin(req, mockEnv);

    expect(resp.status).toBe(200);
    expect(mockEnv.daadmin.fetch).toHaveBeenCalledOnce();
  });

  it('extracts auth from cookie', async () => {
    mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page', {
      cookie: 'auth_token=my-token-123',
    });
    await getFromAdmin(req, mockEnv);

    const [, options] = mockEnv.daadmin.fetch.mock.calls[0];
    expect(options.headers.get('authorization')).toBe('Bearer my-token-123');
  });

  it('extracts auth from Authorization header', async () => {
    mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page', {
      authorization: 'Bearer header-token',
    });
    await getFromAdmin(req, mockEnv);

    const [, options] = mockEnv.daadmin.fetch.mock.calls[0];
    expect(options.headers.get('authorization')).toBe('Bearer header-token');
  });

  it('extracts auth from query param token', async () => {
    mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page?token=query-token');
    await getFromAdmin(req, mockEnv);

    const [, options] = mockEnv.daadmin.fetch.mock.calls[0];
    expect(options.headers.get('authorization')).toBe('Bearer query-token');
  });

  it('cookie auth takes precedence over Authorization header', async () => {
    mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page', {
      cookie: 'auth_token=cookie-token',
      authorization: 'Bearer header-token',
    });
    await getFromAdmin(req, mockEnv);

    const [, options] = mockEnv.daadmin.fetch.mock.calls[0];
    expect(options.headers.get('authorization')).toBe('Bearer cookie-token');
  });

  it('sends no auth header when no auth provided', async () => {
    mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    await getFromAdmin(req, mockEnv);

    const [, options] = mockEnv.daadmin.fetch.mock.calls[0];
    expect(options.headers.get('authorization')).toBeNull();
  });

  it('returns 503 when admin service binding throws', async () => {
    mockEnv.daadmin.fetch.mockRejectedValue(new Error('Service unavailable'));
    const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page');
    const resp = await getFromAdmin(req, mockEnv);

    expect(resp.status).toBe(503);
    expect(resp.headers.get('x-error')).toBe('Failed to fetch from admin');
  });

  describe('path canonicalization', () => {
    beforeEach(() => {
      mockEnv.daadmin.fetch.mockResolvedValue(new Response('', { status: 200 }));
    });

    it('lowercases paths', async () => {
      const req = makeRequest('GET', 'https://content-stg.ssa-da.live/ADOBE/DA-LIVE/Page');
      await getFromAdmin(req, mockEnv);
      const [url] = mockEnv.daadmin.fetch.mock.calls[0];
      expect(url).toContain('/adobe/da-live/page.html');
    });

    it('appends .html to extensionless paths', async () => {
      const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/page');
      await getFromAdmin(req, mockEnv);
      const [url] = mockEnv.daadmin.fetch.mock.calls[0];
      expect(url).toContain('/source/adobe/da-live/page.html');
    });

    it('appends index to trailing slash', async () => {
      const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/folder/');
      await getFromAdmin(req, mockEnv);
      const [url] = mockEnv.daadmin.fetch.mock.calls[0];
      expect(url).toContain('/adobe/da-live/folder/index.html');
    });

    it('preserves file extensions', async () => {
      const req = makeRequest('GET', 'https://content-stg.ssa-da.live/adobe/da-live/image.png');
      await getFromAdmin(req, mockEnv);
      const [url] = mockEnv.daadmin.fetch.mock.calls[0];
      expect(url).toContain('/source/adobe/da-live/image.png');
    });
  });
});
