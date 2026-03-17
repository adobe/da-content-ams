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
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import getObject from '../../src/storage/object.js';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  GetObjectCommand: vi.fn((input) => input),
}));

const mockEnv = {
  AEM_BUCKET_NAME: process.env.AEM_BUCKET_NAME,
  CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
};

describe('getObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns object data on success', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      Body: 'file content',
      $metadata: { httpStatusCode: 200 },
      ContentType: 'text/html',
      ContentLength: 12,
    });
    S3Client.mockImplementation(() => ({ send: mockSend }));

    const daCtx = { bucket: process.env.AEM_BUCKET_NAME, org: 'adobe', key: 'da-live/index.html' };
    const result = await getObject(mockEnv, daCtx);

    expect(result.status).toBe(200);
    expect(result.body).toBe('file content');
    expect(result.contentType).toBe('text/html');
    expect(result.contentLength).toBe(12);
  });

  it('returns 404 when object not found', async () => {
    const mockSend = vi.fn().mockRejectedValue(new Error('NoSuchKey'));
    S3Client.mockImplementation(() => ({ send: mockSend }));

    const daCtx = { bucket: process.env.AEM_BUCKET_NAME, org: 'adobe', key: 'da-live/missing.html' };
    const result = await getObject(mockEnv, daCtx);

    expect(result.status).toBe(404);
    expect(result.body).toBe('');
  });

  it('constructs correct S3 key with org prefix', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      Body: '',
      $metadata: { httpStatusCode: 200 },
      ContentType: 'text/html',
      ContentLength: 0,
    });
    S3Client.mockImplementation(() => ({ send: mockSend }));

    const daCtx = { bucket: process.env.AEM_BUCKET_NAME, org: 'adobe', key: 'da-live/page.html' };
    await getObject(mockEnv, daCtx);

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.AEM_BUCKET_NAME,
      Key: 'adobe/da-live/page.html',
    });
  });

  it('returns 404 on any S3 error', async () => {
    const mockSend = vi.fn().mockRejectedValue(new Error('AccessDenied'));
    S3Client.mockImplementation(() => ({ send: mockSend }));

    const daCtx = { bucket: process.env.AEM_BUCKET_NAME, org: 'adobe', key: 'da-live/secret.html' };
    const result = await getObject(mockEnv, daCtx);

    expect(result.status).toBe(404);
  });
});
