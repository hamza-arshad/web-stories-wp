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
 * External dependencies
 */
import { useCallback } from '@web-stories-wp/react';
import { __, sprintf, translateToExclusiveList } from '@web-stories-wp/i18n';
import { getFirstFrameOfVideo } from '@web-stories-wp/media';

/**
 * Internal dependencies
 */
import { isValidUrl } from '../../../../../../utils/url';
import useLibrary from '../../../../useLibrary';
import getResourceFromUrl from '../../../../../../app/media/utils/getResourceFromUrl';
import {
  getPosterName,
  useUploadVideoFrame,
} from '../../../../../../app/media/utils';
import { useConfig } from '../../../../../../app/config';
import { useAPI } from '../../../../../../app/api';

function getErrorMessage(code, description) {
  switch (code) {
    case 'rest_invalid_param':
    case 'rest_invalid_url':
      return __('Invalid link.', 'web-stories');
    case 'rest_invalid_ext':
      return sprintf(
        /* translators: %s is the description with allowed file extensions. */
        __('Invalid link. %s', 'web-stories'),
        description
      );
    default:
      return __(
        'Media failed to load. Please ensure the link is valid and the site allows linking from external sites.',
        'web-stories'
      );
  }
}

function useInsert({ link, setLink, setErrorMsg, onClose }) {
  const { insertElement } = useLibrary((state) => ({
    insertElement: state.actions.insertElement,
  }));
  const {
    capabilities: { hasUploadMediaAction },
    allowedFileTypes,
  } = useConfig();
  const {
    actions: { getHotlinkInfo },
  } = useAPI();

  const { uploadVideoPoster } = useUploadVideoFrame({});

  const insertMedia = useCallback(
    async (hotlinkData) => {
      const {
        ext,
        type,
        mime_type: mimeType,
        file_name: originalFileName,
      } = hotlinkData;

      try {
        const resource = await getResourceFromUrl(link, type);
        resource.mimeType = mimeType;
        if ('video' === type && hasUploadMediaAction) {
          // Remove the extension from the filename for poster.
          const fileName = getPosterName(
            originalFileName.replace(`.${ext}`, '')
          );
          const posterFile = await getFirstFrameOfVideo(link);
          const posterData = await uploadVideoPoster(0, fileName, posterFile);
          resource.poster = posterData.poster;
          resource.posterId = posterData.posterId;
        }
        insertElement(type, {
          resource,
        });
        setErrorMsg(null);
        setLink('');
        onClose();
      } catch (e) {
        setErrorMsg(getErrorMessage());
      }
    },
    [
      hasUploadMediaAction,
      insertElement,
      link,
      onClose,
      setErrorMsg,
      setLink,
      uploadVideoPoster,
    ]
  );

  const onInsert = useCallback(() => {
    if (!link) {
      return;
    }
    if (!isValidUrl(link)) {
      setErrorMsg(__('Invalid link.', 'web-stories'));
      return;
    }
    getHotlinkInfo(link)
      .then((hotlinkInfo) => {
        insertMedia(hotlinkInfo);
      })
      .catch(({ code }) => {
        let description = __(
          'No file types are currently supported.',
          'web-stories'
        );
        if (allowedFileTypes.length) {
          description = sprintf(
            /* translators: %s is a list of allowed file extensions. */
            __('You can insert %s.', 'web-stories'),
            translateToExclusiveList(allowedFileTypes)
          );
        }
        setErrorMsg(getErrorMessage(code, description));
      });
  }, [allowedFileTypes, link, getHotlinkInfo, setErrorMsg, insertMedia]);

  return onInsert;
}

export default useInsert;
