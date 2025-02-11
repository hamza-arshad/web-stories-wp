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
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { FlagsProvider } from 'flagged';
import { curatedFontNames } from '@web-stories-wp/fonts';
import { PAGE_RATIO, UnitsProvider } from '@web-stories-wp/units';

/**
 * Internal dependencies
 */
import { renderWithTheme } from '../../../../testUtils';
import FontContext from '../../../../app/font/context';
import useFont from '../../../../app/font/useFont';
import fontsListResponse from '../../../form/advancedDropDown/test/fontsResponse.json';
import TextPane from '../../panes/text/textPane';
import { PRESETS } from '../../panes/text/textPresets';
import useLibrary from '../../useLibrary';
import useInsertPreset from '../../panes/text/useInsertPreset';
import { TEXT_SET_SIZE } from '../../../../constants';
import CanvasContext from '../../../../app/canvas/context';

jest.mock('../../useLibrary');
jest.mock('../../../../app/font/useFont');
jest.mock('../../panes/text/useInsertPreset');

describe('TextPane', () => {
  const maybeEnqueueFontStyle = jest.fn();
  const insertPreset = jest.fn();
  const getPosition = jest.fn();
  beforeAll(() => {
    useLibrary.mockImplementation((selector) =>
      selector({
        state: {
          textSets: {},
        },
        actions: {
          insertElement: jest.fn(),
          setPageCanvasPromise: jest.fn(),
        },
      })
    );

    useFont.mockImplementation(() => ({
      actions: {
        maybeEnqueueFontStyle: maybeEnqueueFontStyle,
      },
    }));

    useInsertPreset.mockImplementation(() => ({
      insertPreset,
      getPosition,
    }));
  });

  it('should insert text with preset text style when clicking Enter', async () => {
    const availableCuratedFonts = fontsListResponse.filter(
      (font) => curatedFontNames.indexOf(font.name) > 0
    );

    const fontContextValues = {
      state: {
        fonts: fontsListResponse,
        recentFonts: [],
        curatedFonts: availableCuratedFonts,
      },
      actions: {
        ensureMenuFontsLoaded: () => {},
      },
    };

    const canvasContextValue = {
      state: {
        nodesById: {},
        pageSize: {},
        pageContainer: document.body,
        canvasContainer: document.body,
        designSpaceGuideline: {},
      },
      actions: {},
    };

    renderWithTheme(
      <FlagsProvider
        features={{
          showTextSets: false,
          showTextAndShapesSearchInput: false,
        }}
      >
        <CanvasContext.Provider value={canvasContextValue}>
          <FontContext.Provider value={fontContextValues}>
            <UnitsProvider
              pageSize={{
                width: TEXT_SET_SIZE,
                height: TEXT_SET_SIZE / PAGE_RATIO,
              }}
              dataToEditorX={jest.fn()}
              dataToEditorY={jest.fn()}
            >
              <TextPane isActive />
            </UnitsProvider>
          </FontContext.Provider>
        </CanvasContext.Provider>
      </FlagsProvider>
    );

    act(() => {
      // Note: onClick handler is in Moveable so we can't test that directly in this component
      // and have to test using key handlers instead.
      fireEvent.keyDown(screen.getByRole('button', { name: 'Title 1' }), {
        key: 'Enter',
        which: 13,
      });
    });

    await waitFor(() => expect(insertPreset).toHaveBeenCalledTimes(1));
    // Height is being assigned in the process of text insertion.
    await waitFor(() =>
      expect(insertPreset).toHaveBeenCalledWith(PRESETS[0].element, {
        isPositioned: false,
        accessibleColors: undefined,
        skipCanvasGeneration: undefined,
      })
    );
  });
});
