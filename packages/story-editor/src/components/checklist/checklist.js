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
import { __ } from '@web-stories-wp/i18n';
import PropTypes from 'prop-types';
import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from '@web-stories-wp/react';
import styled from 'styled-components';
/**
 * Internal dependencies
 */
import { FOCUSABLE_SELECTORS } from '../../constants';
import DirectionAware from '../directionAware';
import Popup, { NavigationWrapper, TopNavigation } from '../secondaryPopup';
import { Z_INDEX } from '../canvas/layout';
import { Tablist } from '../tablist';
import { Toggle } from './toggle';
import {
  CATEGORY_LABELS,
  CHECKLIST_TITLE,
  ISSUE_TYPES,
  POPUP_ID,
  PANEL_EXPANSION_BY_CHECKPOINT,
  PANEL_VISIBILITY_BY_STATE,
} from './constants';
import {
  AccessibilityChecks,
  DesignChecks,
  EmptyContentCheck,
  PriorityChecks,
} from './checklistContent';

import { useCategoryCount } from './countContext';
import { useChecklist } from './checklistContext';
import { useCheckpoint } from './checkpointContext';
import { getTabPanelMaxHeight } from './styles';

const Wrapper = styled.div`
  /**
    * sibling inherits parent z-index of Z_INDEX.EDIT
    * so this needs to be placed above that while still
    * retaining its position in the DOM for focus purposes
    */
  z-index: ${Z_INDEX.EDIT + 1};
`;

// TODO make this responsive so that title bar is never covered by popup.
const StyledNavigationWrapper = styled(NavigationWrapper)``;

const ThroughputPopup = forwardRef(function ThroughputPopup(
  { isOpen, children, close },
  ref
) {
  const { isChecklistMounted, setIsChecklistMounted } = useChecklist(
    ({
      state: { isChecklistMounted },
      actions: { setIsChecklistMounted },
    }) => ({
      isChecklistMounted,
      setIsChecklistMounted,
    })
  );

  return (
    <Popup
      popupId={POPUP_ID}
      isOpen={isOpen}
      ariaLabel={CHECKLIST_TITLE}
      shouldKeepMounted
      onEnter={() => setIsChecklistMounted(true)}
      onExited={() => setIsChecklistMounted(false)}
    >
      {isChecklistMounted ? (
        <StyledNavigationWrapper ref={ref} isOpen={isOpen}>
          <TopNavigation
            onClose={close}
            label={CHECKLIST_TITLE}
            popupId={POPUP_ID}
          />
          <Tablist
            id="pre-publish-checklist"
            data-isexpanded={isOpen}
            aria-label={__('Potential Story issues by category', 'web-stories')}
          >
            {children}
          </Tablist>
          <EmptyContentCheck />
        </StyledNavigationWrapper>
      ) : (
        children
      )}
    </Popup>
  );
});
ThroughputPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export function Checklist() {
  const { close, openPanel, toggle, isOpen, isChecklistMounted, setOpenPanel } =
    useChecklist(
      ({
        actions: { close, toggle, setOpenPanel },
        state: { isOpen, isChecklistMounted, openPanel },
      }) => ({
        close,
        toggle,
        isOpen,
        isChecklistMounted,
        openPanel,
        setOpenPanel,
      })
    );

  const priorityCount = useCategoryCount(ISSUE_TYPES.PRIORITY);
  const designCount = useCategoryCount(ISSUE_TYPES.DESIGN);
  const accessibilityCount = useCategoryCount(ISSUE_TYPES.ACCESSIBILITY);

  const { checkpoint } = useCheckpoint(({ state: { checkpoint } }) => ({
    checkpoint,
  }));

  const navRef = useRef();

  const handleOpenPanel = useCallback(
    (panelName) => () =>
      setOpenPanel((currentOpenPanel) =>
        currentOpenPanel === panelName ? null : panelName
      ),
    [setOpenPanel]
  );
  // Set Focus within the popup on open
  useEffect(() => {
    if (isChecklistMounted) {
      const firstFocusableChild = navRef.current?.querySelector(
        FOCUSABLE_SELECTORS.join(', ')
      );
      firstFocusableChild?.focus();
    }
  }, [isChecklistMounted]);

  useEffect(() => {
    if (checkpoint) {
      setOpenPanel(PANEL_EXPANSION_BY_CHECKPOINT[checkpoint]);
    }
  }, [checkpoint, setOpenPanel]);

  const visiblePanels = PANEL_VISIBILITY_BY_STATE[checkpoint];
  const priorityBadgeCount = visiblePanels.includes(ISSUE_TYPES.PRIORITY)
    ? priorityCount
    : 0;
  const designBadgeCount = visiblePanels.includes(ISSUE_TYPES.DESIGN)
    ? designCount
    : 0;
  const accessibilityBadgeCount = visiblePanels.includes(
    ISSUE_TYPES.ACCESSIBILITY
  )
    ? accessibilityCount
    : 0;

  const maxPanelHeight = getTabPanelMaxHeight(
    [priorityBadgeCount, designBadgeCount, accessibilityBadgeCount].filter(
      (num) => Boolean(num)
    ).length
  );

  return (
    <DirectionAware>
      <Wrapper role="region" aria-label={CHECKLIST_TITLE}>
        <ThroughputPopup ref={navRef} close={close} isOpen={isOpen}>
          <PriorityChecks
            badgeCount={priorityBadgeCount}
            isOpen={isOpen && openPanel === ISSUE_TYPES.PRIORITY}
            onClick={handleOpenPanel(ISSUE_TYPES.PRIORITY)}
            maxHeight={maxPanelHeight}
            title={CATEGORY_LABELS[ISSUE_TYPES.PRIORITY]}
          />
          <DesignChecks
            badgeCount={designBadgeCount}
            isOpen={isOpen && openPanel === ISSUE_TYPES.DESIGN}
            onClick={handleOpenPanel(ISSUE_TYPES.DESIGN)}
            maxHeight={maxPanelHeight}
            title={CATEGORY_LABELS[ISSUE_TYPES.DESIGN]}
          />
          <AccessibilityChecks
            badgeCount={accessibilityBadgeCount}
            isOpen={isOpen && openPanel === ISSUE_TYPES.ACCESSIBILITY}
            onClick={handleOpenPanel(ISSUE_TYPES.ACCESSIBILITY)}
            maxHeight={maxPanelHeight}
            title={CATEGORY_LABELS[ISSUE_TYPES.ACCESSIBILITY]}
          />
        </ThroughputPopup>
        <Toggle isOpen={isOpen} onClick={toggle} popupId={POPUP_ID} />
      </Wrapper>
    </DirectionAware>
  );
}
