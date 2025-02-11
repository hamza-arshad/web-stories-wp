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
import PropTypes from 'prop-types';
import { createContext } from '@web-stories-wp/react';

/**
 * Internal dependencies
 */
import useMediaApi from './useMediaApi';
import useStoryApi from './useStoryApi';
import useTemplateApi from './useTemplateApi';
import useUsersApi from './useUserApi';
import useSettingsApi from './useSettingsApi';
import usePagesApi from './usePagesApi';
import usePublisherLogosApi from './usePublisherLogosApi';

export const ApiContext = createContext({ state: {}, actions: {} });

export default function ApiProvider({ children }) {
  const { currentUser, api: usersApi } = useUsersApi();
  const { templates, api: templateApi } = useTemplateApi();
  const { stories, api: storyApi } = useStoryApi();
  const { media, api: mediaApi } = useMediaApi();
  const { settings, api: settingsApi } = useSettingsApi();
  const { api: pagesApi } = usePagesApi();
  const { publisherLogos, api: publisherLogosApi } = usePublisherLogosApi();

  const value = {
    state: {
      media,
      settings,
      stories,
      templates,
      currentUser,
      publisherLogos,
    },
    actions: {
      mediaApi,
      settingsApi,
      storyApi,
      templateApi,
      usersApi,
      pagesApi,
      publisherLogosApi,
    },
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

ApiProvider.propTypes = {
  children: PropTypes.node,
};
