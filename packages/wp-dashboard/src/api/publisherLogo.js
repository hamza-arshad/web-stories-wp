/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * External dependencies
 */
import { addQueryArgs } from '@web-stories-wp/design-system';

/**
 * Fetch publisher logos.
 * Used for "Publisher Logo" field under editor settings page
 *
 * @param {string} apiPath API Path.
 * @return {Promise} Request promise.
 */
export function fetchPublisherLogos(apiPath) {
  return apiFetch({ path: apiPath });
}

/**
 * Remove publisher logo.
 *
 * @param {number|string} logoId Logo id.
 * @param {string} apiPath API Path.
 * @return {Promise} Request promise.
 */
export function removePublisherLogo(logoId, apiPath) {
  const path = addQueryArgs(`${apiPath}${logoId}/`, { _method: 'DELETE' });

  return apiFetch({
    path,
    method: 'POST',
  });
}

/**
 * Add publisher logo.
 *
 * @param {number|string} logoId Logo id.
 * @param {string} apiPath API Path.
 * @return {Promise} Request promise.
 */
export function addPublisherLogo(logoId, apiPath) {
  return apiFetch({
    path: apiPath,
    data: {
      id: logoId,
    },
    method: 'POST',
  });
}

/**
 * Set publisher logo as default.
 *
 * @param {number|string} logoId Logo id.
 * @param {string} apiPath API Path.
 * @return {Promise} Request promise.
 */
export function setPublisherLogoAsDefault(logoId, apiPath) {
  return apiFetch({
    path: `${apiPath}${logoId}/`,
    data: {
      active: true,
    },
    method: 'POST',
  });
}
