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
import { __ } from '@web-stories-wp/i18n';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { useTaxonomy } from '../../../../app/taxonomy';
import { SimplePanel } from '../../panel';
import { useStory } from '../../../../app';
import HierarchicalTermSelector from './HierarchicalTermSelector';
import FlatTermSelector from './FlatTermSelector';
import { SiblingBorder } from './shared';

const StyledSimplePanel = styled(SimplePanel)`
  padding-left: 0;
  padding-right: 0;
`;

function TaxonomiesPanel(props) {
  const { capabilities } = useStory(({ state: { capabilities } }) => ({
    capabilities,
  }));
  const { taxonomies } = useTaxonomy(({ state: { taxonomies } }) => ({
    taxonomies,
  }));

  if (!taxonomies?.length) {
    return null;
  }

  const availableTaxonomies = taxonomies.filter((taxonomy) => {
    const isVisible = taxonomy?.visibility?.show_ui;
    const canAssignTerms = Boolean(
      capabilities[`assign-${taxonomy?.restBase}`] ||
        capabilities[`assign-${taxonomy?.slug}`]
    );

    return isVisible && canAssignTerms;
  });

  if (availableTaxonomies.length === 0) {
    return null;
  }

  return (
    <StyledSimplePanel
      name="taxonomies"
      title={__('Categories and Tags', 'web-stories')}
      {...props}
    >
      {availableTaxonomies.map((taxonomy) => {
        const canCreateTerms = Boolean(
          capabilities[`create-${taxonomy?.restBase}`] ||
            capabilities[`create-${taxonomy?.slug}`]
        );

        return (
          <SiblingBorder key={taxonomy.slug}>
            {taxonomy.hierarchical ? (
              <HierarchicalTermSelector
                taxonomy={taxonomy}
                canCreateTerms={canCreateTerms}
              />
            ) : (
              <FlatTermSelector
                taxonomy={taxonomy}
                canCreateTerms={canCreateTerms}
              />
            )}
          </SiblingBorder>
        );
      })}
    </StyledSimplePanel>
  );
}

export default TaxonomiesPanel;
