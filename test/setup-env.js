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
// Default test environment — matches gov-stage values.
// Override by sourcing an env file before running tests:
//   source path/to/gov-stage.env && npm test
process.env.AEM_BUCKET_NAME = process.env.AEM_BUCKET_NAME || 'BAD_VAR_da_content_ams_AEM_BUCKET_NAME';
process.env.CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || 'BAD_VAR_da_content_ams_CF_ACCOUNT_ID';
process.env.HELIX_ADMIN_IPS = process.env.HELIX_ADMIN_IPS || 'BAD_VAR_da_content_ams_HELIX_ADMIN_IPS';
process.env.ADMIN_EXCEPTED_ORGS = process.env.ADMIN_EXCEPTED_ORGS || 'BAD_VAR_da_content_ams_ADMIN_EXCEPTED_ORGS';

export const ADMIN_URL = process.env.ADMIN_URL || 'BAD_VAR_da_content_ams_ADMIN_URL';
export const DA_DOMAIN = process.env.DA_DOMAIN || 'BAD_VAR_da_content_ams_DA_DOMAIN';
export const HLX_PROD_SERVER_HOST_LIVE = process.env.HLX_PROD_SERVER_HOST_LIVE
  || 'BAD_VAR_da_content_ams_HLX_PROD_SERVER_HOST_LIVE';
export const HLX_PROD_SERVER_HOST_PAGE = process.env.HLX_PROD_SERVER_HOST_PAGE
  || 'BAD_VAR_da_content_ams_HLX_PROD_SERVER_HOST_PAGE';
export const GITHUB_ORG = process.env.GITHUB_ORG || 'BAD_VAR_da_content_ams_GITHUB_ORG';
export const DA_LIVE_REPO = process.env.DA_LIVE_REPO || 'BAD_VAR_da_content_ams_DA_LIVE_REPO';

// Secrets — use BAD_VAR sentinel so failures are loud, not silent
process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || 'BAD_VAR_da_content_S3_ACCESS_KEY_ID';
process.env.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || 'BAD_VAR_da_content_S3_SECRET_ACCESS_KEY';
