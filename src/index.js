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
import { getDaCtx } from './utils/daCtx.js';
import getObject from './storage/object.js';

import { get404, daResp, getRobots } from './responses/index.js';
import getFromAdmin from './storage/admin.js';

const EMBEDDABLE_ASSETS_EXTENSIONS = ['.avif', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.mp4'];

async function getFromStorage(pathname, env) {
  const daCtx = getDaCtx(env, pathname);
  const objResp = await getObject(env, daCtx);
  return daResp(objResp);
}

function isEmbeddableAsset(pathname) {
  return EMBEDDABLE_ASSETS_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}
// https://www.aem.live/docs/security#backends-with-ip-filtering
function isAllowListed(env, req, org) {
  const allowedIps = env.HELIX_ADMIN_IPS?.split(',').map((ip) => ip.trim()) || [];
  return env.ADMIN_EXCEPTED_ORGS?.split(',').includes(org)
    && allowedIps.includes(req.headers.get('cf-connecting-ip'));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === '/favicon.ico') return get404();
    if (pathname === '/robots.txt') return getRobots();

    const [, org, site] = url.pathname.split('/');

    if (!org || !site) return get404();

    if (isEmbeddableAsset(pathname) || isAllowListed(env, req, org)) {
      return getFromStorage(pathname, env);
    }

    return getFromAdmin(req, env);
  },
};
