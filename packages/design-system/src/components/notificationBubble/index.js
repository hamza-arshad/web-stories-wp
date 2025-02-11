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
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { themeHelpers } from '../../theme';

const Bubble = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.fg.primary};
    background-color: ${theme.colors.accent.primary};
    border-radius: ${theme.borders.radius.round};
  `}
  position: relative;
  height: 24px;
  width: 24px;

  ${({ isSmall }) =>
    isSmall &&
    css`
      height: 20px;
      width: 20px;
    `};
`;

const Inner = styled.span`
  ${themeHelpers.fullSizeAbsolute}
  ${themeHelpers.centerContent}
  ${({ isSmall, theme }) =>
    themeHelpers.expandTextPreset(
      ({ paragraph }, sizes) => paragraph[isSmall ? sizes.X_SMALL : sizes.SMALL]
    )({ theme })};
  color: ${({ theme }) => theme.colors.bg.primary};
  user-select: none;
`;

export const NotificationBubble = ({
  notificationCount,
  isSmall,
  ...props
}) => (
  <Bubble isSmall={isSmall} {...props}>
    <Inner isSmall={isSmall}>{notificationCount}</Inner>
  </Bubble>
);
NotificationBubble.propTypes = {
  notificationCount: PropTypes.number,
  isSmall: PropTypes.bool,
};
