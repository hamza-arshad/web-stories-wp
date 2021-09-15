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
 * Internal dependencies
 */
import { validatorWorker } from './worker';

import(/* webpackChunkName: "fs" */ 'fs');

export async function getStoryAmpValidationErrors({ link, status }) {
  if (!link || !['publish', 'future'].includes(status)) {
    return false;
  }

  try {
    const response = await fetch(link);
    const storyMarkup = await response.text();

    const result = await validatorWorker.validator().then((validator) => {
      return validator.validateString(storyMarkup);
    });

    // TODO update error handling to new format with integers
    const { status: markupStatus, errors } = result;
    if ('FAIL' !== markupStatus) {
      return false;
    }

    const filteredErrors = errors
      .filter(({ severity }) => severity === 'ERROR')
      .filter(({ code, params }) => {
        // Filter out errors that are covered in other checks
        // Already covered by metadata checks.

        // Missing story poster
        if ('MISSING_URL' === code && params?.[0].startsWith('poster')) {
          return false;
        }

        // Missing publisher logo
        if (
          'MISSING_URL' === code &&
          params?.[0].startsWith('publisher-logo')
        ) {
          return false;
        }
        // Missing video posters
        if ('INVALID_URL_PROTOCOL' === code && params?.[0].startsWith('src')) {
          return false;
        }

        return true;
      });
    return filteredErrors.length > 0;
  } catch {
    return false;
  }
}
