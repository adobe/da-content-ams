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
import { describe, it, expect } from 'vitest';
import { daResp, get404, getRobots } from '../../src/responses/index.js';

describe('daResp', () => {
  it('returns response with CORS headers', () => {
    const resp = daResp({ body: 'hello', status: 200, contentType: 'text/html' });
    expect(resp.status).toBe(200);
    expect(resp.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(resp.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(resp.headers.get('Access-Control-Allow-Headers')).toBe('authorization');
    expect(resp.headers.get('Content-Type')).toBe('text/html');
  });

  it('does not set a custom Content-Type when not provided', () => {
    const resp = daResp({ body: '', status: 200 });
    // Our code doesn't append Content-Type — Response constructor may add a default
    expect(resp.headers.get('Content-Type')).not.toBe('text/html');
    expect(resp.headers.get('Content-Type')).not.toBe('application/json');
  });

  it('sets correct status code', () => {
    expect(daResp({ body: '', status: 201 }).status).toBe(201);
    expect(daResp({ body: '', status: 404 }).status).toBe(404);
  });
});

describe('get404', () => {
  it('returns 404 with CORS headers', () => {
    const resp = get404();
    expect(resp.status).toBe(404);
    expect(resp.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});

describe('getRobots', () => {
  it('returns 200 with disallow-all body', async () => {
    const resp = getRobots();
    expect(resp.status).toBe(200);
    const text = await resp.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Disallow: /');
  });
});
