/*
 * Copyright 2020 Google LLC
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
 * External dependencies
 */
import { useCallback } from '@web-stories-wp/react';

/**
 * Internal dependencies
 */
import { useConfig } from '../config';

export default function usePagesApi() {
  const {
    apiCallbacks: {
      getPageById: getPageByIdCallback,
      searchPages: searchPagesCallback,
    },
    api: { pages: pagesApi },
  } = useConfig();

  const getPageById = useCallback(
    async (id) => {
      try {
        const { title, link } = await getPageByIdCallback(id, pagesApi);

        return {
          title: title.rendered,
          link,
        };
      } catch (e) {
        return null;
      }
    },
    [getPageByIdCallback, pagesApi]
  );

  const searchPages = useCallback(
    async (searchTerm) => {
      try {
        const response = await searchPagesCallback(searchTerm, pagesApi);

        return response.map(({ id, title }) => ({
          value: id,
          label: title.rendered,
        }));
      } catch (e) {
        return [];
      }
    },
    [searchPagesCallback, pagesApi]
  );

  return {
    api: { searchPages, getPageById },
  };
}
