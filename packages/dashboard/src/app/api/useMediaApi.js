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
import { useCallback, useReducer } from '@web-stories-wp/react';

/**
 * Internal dependencies
 */
import mediaReducer, {
  defaultMediaState,
  ACTION_TYPES as MEDIA_ACTION_TYPES,
} from '../reducer/media';
import { ERRORS } from '../textContent';
import { useConfig } from '../config';

export default function useMediaApi() {
  const [state, dispatch] = useReducer(mediaReducer, defaultMediaState);
  const {
    apiCallbacks: { uploadMedia: uploadMediaCallback },
    api: { media: mediaApi },
  } = useConfig();

  const uploadMedia = useCallback(
    async (files) => {
      dispatch({
        type: MEDIA_ACTION_TYPES.LOADING_MEDIA,
      });

      try {
        // each file needs to be uploaded separately
        const mediaResponse = await uploadMediaCallback(files, mediaApi);

        dispatch({
          type: MEDIA_ACTION_TYPES.ADD_MEDIA_SUCCESS,
          payload: {
            media: mediaResponse,
            newlyCreatedMediaIds: mediaResponse.map(({ id }) => id),
          },
        });
      } catch (err) {
        dispatch({
          type: MEDIA_ACTION_TYPES.ADD_MEDIA_FAILURE,
          payload: {
            message:
              ERRORS.UPLOAD_PUBLISHER_LOGO[
                files.length > 1 ? 'MESSAGE_PLURAL' : 'MESSAGE'
              ],
          },
        });
      }
    },
    [uploadMediaCallback, mediaApi]
  );

  return {
    media: state,
    api: {
      uploadMedia,
    },
  };
}
