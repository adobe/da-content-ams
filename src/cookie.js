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
import { daResp } from './responses/index.js';

export const TRUSTED_ORIGINS = [
  'https://da.live',
  'https://aem.adobe.com',
  'https://preview-aemcoder.adobe.io',
  'https://preview-excat-stage.adobe.io',
  'http://localhost:3000',
  'https://localhost:3000',
];

export const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'text/plain',
};

/**
 * Trusted origins for this environment, derived from DA_DOMAIN
 * (e.g. "entmseds-da.live" -> also trusts "entmseds-da.page").
 * Returns undefined when DA_DOMAIN is unset, so callers fall back to TRUSTED_ORIGINS.
 */
export function getTrustedOrigins(env) {
  if (!env?.DA_DOMAIN) return undefined;
  return [
    `https://${env.DA_DOMAIN}`,
    `https://${env.DA_DOMAIN.replace(/\.live$/, '.page')}`,
    'http://localhost:3000',
  ];
}

/**
 * Trusted origin pattern for this environment: https://<ref>--<DA_LIVE_REPO>--<GITHUB_ORG>
 * on HLX_PROD_SERVER_HOST_LIVE/_PAGE. Returns undefined unless all four are set.
 */
function getTrustedOriginPattern(env) {
  const {
    DA_LIVE_REPO, GITHUB_ORG, HLX_PROD_SERVER_HOST_LIVE, HLX_PROD_SERVER_HOST_PAGE,
  } = env || {};
  if (!(DA_LIVE_REPO && GITHUB_ORG && HLX_PROD_SERVER_HOST_LIVE && HLX_PROD_SERVER_HOST_PAGE)) {
    return undefined;
  }
  return new RegExp(`^https://[a-zA-Z0-9-]+--${DA_LIVE_REPO}--${GITHUB_ORG}\\.(${HLX_PROD_SERVER_HOST_LIVE.replaceAll('.', '\\.')}|${HLX_PROD_SERVER_HOST_PAGE.replaceAll('.', '\\.')})$`);
}

/**
 * Check if the origin is trusted.
 * Supports exact matches and pattern matching for DA aem.live and aem.page domains.
 */
function isTrustedOrigin(origin, env) {
  if (!origin) return false;

  // Check exact matches
  if ((getTrustedOrigins(env) || TRUSTED_ORIGINS).includes(origin)) {
    return true;
  }

  // Check pattern: https://<alphanumeric>--da-live--adobe.aem.(live|page)
  const pattern = getTrustedOriginPattern(env)
    || /^https:\/\/[a-zA-Z0-9]+-?-da-live--adobe\.aem\.(live|page)$/;
  return pattern.test(origin);
}

export function getCookie(req, env) {
  if (!isTrustedOrigin(req.headers.get('Origin'), env)) {
    return daResp({ body: '403 Forbidden', status: 403, contentType: 'text/plain' });
  }

  if (!['GET', 'OPTIONS'].includes(req.method)) {
    return new Response('', { status: 405 });
  }

  if (req.method === 'OPTIONS') {
    const respHeaders = new Headers();
    respHeaders.append('Access-Control-Allow-Origin', req.headers.get('Origin'));
    Object.entries(DEFAULT_CORS_HEADERS).forEach(([key, value]) => {
      respHeaders.append(key, value);
    });
    return new Response('', { headers: respHeaders });
  }

  const { headers } = req;

  const authToken = headers.get('Authorization');
  if (authToken) {
    const cookieValue = authToken.split(' ')[1]?.replace(/[^a-zA-Z0-9\-_.=]/g, '') || null;

    if (cookieValue) {
      const respHeaders = new Headers();
      respHeaders.append('Set-Cookie', `auth_token=${cookieValue}; Secure; Path=/; HttpOnly; SameSite=None; Partitioned; Max-Age=84600`);
      respHeaders.append('Access-Control-Allow-Origin', req.headers.get('Origin'));
      Object.entries(DEFAULT_CORS_HEADERS).forEach(([key, value]) => {
        respHeaders.append(key, value);
      });

      return new Response('cookie set', { headers: respHeaders });
    }
  }
  return daResp({ body: '401 Unauthorized', status: 401, contentType: 'text/plain' });
}
