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
process.env.AEM_BUCKET_NAME = process.env.AEM_BUCKET_NAME || 'aem-content-stage';
process.env.CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '980b8b7745c7f2165f369b9d6f3c61f5';
process.env.ADMIN_URL = process.env.ADMIN_URL || 'stg-admin.ssa-da.live';
process.env.HELIX_ADMIN_IPS = process.env.HELIX_ADMIN_IPS || '56.137.172.84';
process.env.ADMIN_EXCEPTED_ORGS = process.env.ADMIN_EXCEPTED_ORGS || 'adobe,ams-eds';

// Secrets — use BAD_VAR sentinel so failures are loud, not silent
process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || 'BAD_VAR_da_content_S3_ACCESS_KEY_ID';
process.env.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || 'BAD_VAR_da_content_S3_SECRET_ACCESS_KEY';
