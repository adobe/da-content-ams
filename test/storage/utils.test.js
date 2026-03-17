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
import getS3Config from '../../src/storage/utils.js';

describe('getS3Config', () => {
  it('builds endpoint from CF_ACCOUNT_ID', () => {
    const env = {
      CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    };
    const config = getS3Config(env);
    expect(config.endpoint).toBe(`https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    expect(config.region).toBe('auto');
    expect(config.credentials.accessKeyId).toBe(process.env.S3_ACCESS_KEY_ID);
    expect(config.credentials.secretAccessKey).toBe(process.env.S3_SECRET_ACCESS_KEY);
  });

  it('uses S3_DEF_URL when provided', () => {
    const env = {
      S3_DEF_URL: 'https://custom.endpoint.com',
      CF_ACCOUNT_ID: 'abc123',
      S3_ACCESS_KEY_ID: 'key-id',
      S3_SECRET_ACCESS_KEY: 'secret',
    };
    const config = getS3Config(env);
    expect(config.endpoint).toBe('https://custom.endpoint.com');
  });

  it('passes credentials through', () => {
    const env = {
      CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    };
    const { credentials } = getS3Config(env);
    expect(credentials.accessKeyId).toBe(process.env.S3_ACCESS_KEY_ID);
    expect(credentials.secretAccessKey).toBe(process.env.S3_SECRET_ACCESS_KEY);
  });
});
