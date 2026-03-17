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
import { getDaCtx } from '../../src/utils/daCtx.js';

const env = { AEM_BUCKET_NAME: process.env.AEM_BUCKET_NAME };

describe('getDaCtx', () => {
  it('parses an extensionless file path', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/path/to/file');
    expect(ctx.bucket).toBe('aem-content-stage');
    expect(ctx.org).toBe('adobe');
    expect(ctx.site).toBe('da-live');
    expect(ctx.filename).toBe('file');
    expect(ctx.name).toBe('file');
    expect(ctx.ext).toBe('html');
    expect(ctx.isFile).toBe(true);
    expect(ctx.key).toBe('da-live/path/to/file.html');
    expect(ctx.propsKey).toBe('da-live/path/to/file.html.props');
    expect(ctx.pathname).toBe('/da-live/path/to/file');
    expect(ctx.aemPathname).toBe('/path/to/file');
  });

  it('appends index for trailing slash', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/folder/');
    expect(ctx.filename).toBe('index');
    expect(ctx.name).toBe('index');
    expect(ctx.ext).toBe('html');
    expect(ctx.key).toBe('da-live/folder/index.html');
    expect(ctx.pathname).toBe('/da-live/folder/index');
    expect(ctx.aemPathname).toBe('/folder/index');
  });

  it('preserves media file extensions', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/images/photo.png');
    expect(ctx.ext).toBe('png');
    expect(ctx.name).toBe('photo');
    expect(ctx.key).toBe('da-live/images/photo.png');
    expect(ctx.pathname).toBe('/da-live/images/photo.png');
    expect(ctx.aemPathname).toBe('/images/photo.png');
  });

  it('lowercases the pathname', () => {
    const ctx = getDaCtx(env, '/ADOBE/DA-LIVE/Page');
    expect(ctx.org).toBe('adobe');
    expect(ctx.site).toBe('da-live');
    expect(ctx.name).toBe('page');
  });

  it('sets bucket from env', () => {
    const ctx = getDaCtx({ AEM_BUCKET_NAME: process.env.AEM_BUCKET_NAME }, '/org/site/file');
    expect(ctx.bucket).toBe(process.env.AEM_BUCKET_NAME);
  });

  it('handles deeply nested path', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/a/b/c/d/page');
    expect(ctx.key).toBe('da-live/a/b/c/d/page.html');
    expect(ctx.aemPathname).toBe('/a/b/c/d/page');
  });

  it('handles file at site root', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/index');
    expect(ctx.org).toBe('adobe');
    expect(ctx.site).toBe('da-live');
    expect(ctx.key).toBe('da-live/index.html');
    expect(ctx.aemPathname).toBe('/index');
  });

  it('sets propsKey correctly for media files', () => {
    const ctx = getDaCtx(env, '/adobe/da-live/hero.jpg');
    expect(ctx.propsKey).toBe('da-live/hero.jpg.props');
  });
});
