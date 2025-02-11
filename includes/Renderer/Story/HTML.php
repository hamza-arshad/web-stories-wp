<?php
/**
 * Class HTML
 *
 * @package   Google\Web_Stories
 * @copyright 2020 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/google/web-stories-wp
 */

/**
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

namespace Google\Web_Stories\Renderer\Story;

use Google\Web_Stories_Dependencies\AmpProject\Dom\Document;
use Google\Web_Stories\Model\Story;

/**
 * Class HTML
 */
class HTML {
	/**
	 * Current post.
	 *
	 * @var Story Post object.
	 */
	protected $story;

	/**
	 * Document instance.
	 *
	 * @var Document Document instance.
	 */
	protected $document;

	/**
	 * HTML constructor.
	 *
	 * @since 1.0.0
	 *
	 * @param Story $story Story object.
	 */
	public function __construct( Story $story ) {
		$this->story = $story;
	}

	/**
	 * Renders the story.
	 *
	 * @since 1.0.0
	 *
	 * @return string The complete HTML markup for the story.
	 */
	public function render(): string {
		$markup = $this->story->get_markup();
		$markup = $this->replace_html_head( $markup );
		$markup = $this->replace_url_scheme( $markup );
		$markup = $this->print_analytics( $markup );
		$markup = $this->print_social_share( $markup );

		return $markup;
	}

	/**
	 * Get story meta images.
	 *
	 * @since 1.0.0
	 *
	 * @return string[] Images.
	 */
	protected function get_poster_images(): array {
		return [
			'poster-portrait-src' => $this->story->get_poster_portrait(),
		];
	}

	/**
	 * Returns the full HTML <head> markup for a given story besides boilerplate.
	 *
	 * @since 1.0.0
	 *
	 * @return string Filtered content.
	 */
	protected function get_html_head_markup(): string {
		ob_start();
		?>
		<meta name="amp-story-generator-name" content="Web Stories for WordPress" />
		<meta name="amp-story-generator-version" content="<?php echo esc_attr( WEBSTORIES_VERSION ); ?>" />
		<?php

		/**
		 * Prints scripts or data in the head tag on the front end.
		 */
		do_action( 'web_stories_story_head' );

		return (string) ob_get_clean();
	}

	/**
	 * Replaces markers in HTML <head> with dynamic content.
	 *
	 * @since 1.0.0
	 *
	 * @param string $content Story markup.
	 *
	 * @return string Filtered content.
	 */
	protected function replace_html_head( string $content ): string {
		$start_tag = '<meta name="web-stories-replace-head-start"/>';
		$end_tag   = '<meta name="web-stories-replace-head-end"/>';

		// Replace malformed meta tags with correct tags.
		$content = (string) preg_replace( '/<meta name="web-stories-replace-head-start\s?"\s?\/>/i', $start_tag, $content );
		$content = (string) preg_replace( '/<meta name="web-stories-replace-head-end\s?"\s?\/>/i', $end_tag, $content );

		$start_tag_pos = strpos( $content, $start_tag );
		$end_tag_pos   = strpos( $content, $end_tag );

		if ( false !== $start_tag_pos && false !== $end_tag_pos ) {
			$end_tag_pos += strlen( $end_tag );
			$content      = substr_replace( $content, $this->get_html_head_markup(), $start_tag_pos, $end_tag_pos - $start_tag_pos );
		}

		return $content;
	}

	/**
	 * Force home urls to http / https based on context.
	 *
	 * @since 1.1.0
	 *
	 * @param string $content String to replace.
	 *
	 * @return string
	 */
	protected function replace_url_scheme( string $content ): string {
		if ( is_ssl() ) {
			$search  = home_url( '', 'http' );
			$replace = home_url( '', 'https' );
			$content = str_replace( $search, $replace, $content );
		}

		return $content;

	}

	/**
	 * Print analytics code before closing `</amp-story>`.
	 *
	 * @since 1.2.0
	 *
	 * @param string $content String to replace.
	 *
	 * @return string
	 */
	protected function print_analytics( string $content ): string {
		ob_start();

		/**
		 * Fires before the closing <amp-story> tag.
		 *
		 * Can be used to print <amp-analytics> configuration.
		 *
		 * @since 1.1.0
		 */
		do_action( 'web_stories_print_analytics' );

		$output = (string) ob_get_clean();

		return str_replace( '</amp-story>', $output . '</amp-story>', $content );
	}

	/**
	 * Print amp-story-social-share before closing `</amp-story>`.
	 *
	 * @since 1.6.0
	 *
	 * @param string $content String to replace.
	 *
	 * @return string
	 */
	protected function print_social_share( string $content ): string {
		$share_providers = [
			[
				'provider' => 'twitter',
			],
			[
				'provider' => 'linkedin',
			],
			[
				'provider' => 'email',
			],
			[
				'provider' => 'system',
			],
		];

		/**
		 * Filters the list of sharing providers in the Web Stories sharing dialog.
		 *
		 * @since 1.3.0
		 *
		 * @link https://amp.dev/documentation/components/amp-social-share/?format=stories#pre-configured-providers
		 *
		 * @param array[] $share_providers List of sharing providers.
		 */
		$share_providers = (array) apply_filters( 'web_stories_share_providers', $share_providers );

		if ( empty( $share_providers ) ) {
			return $content;
		}

		$config       = [
			'shareProviders' => $share_providers,
		];
		$social_share = sprintf(
			'<amp-story-social-share layout="nodisplay"><script type="application/json">%s</script></amp-story-social-share>',
			wp_json_encode( $config )
		);


		return str_replace( '</amp-story>', $social_share . '</amp-story>', $content );
	}
}
