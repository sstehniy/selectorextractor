package helpers

import (
	"regexp"
	"strings"
)

func PrepareHtmlForExtraction(html string) string {
	// Define patterns for elements to remove
	patterns := []string{
		`<svg[^>]*>.*?</svg>`,           // SVG tags and content
		`<script[^>]*>.*?</script>`,     // Script tags and content
		`<style[^>]*>.*?</style>`,       // Style tags and content
		`<!--.*?-->`,                    // Comments
		`<iframe[^>]*>.*?</iframe>`,     // iframes
		`<canvas[^>]*>.*?</canvas>`,     // canvas elements
		`<noscript[^>]*>.*?</noscript>`, // noscript elements
		`<template[^>]*>.*?</template>`, // template elements
		`<meta[^>]*>`,                   // meta tags
		`<link[^>]*>`,                   // link tags
		`<base[^>]*>`,                   // base tags
		`on\w+="[^"]*"`,                 // inline event handlers
		`data-[^=]*="[^"]*"`,            // data attributes
		`aria-[^=]*="[^"]*"`,            // aria attributes
		`role="[^"]*"`,                  // role attributes
	}

	// Compile all patterns
	var regexps []*regexp.Regexp
	for _, pattern := range patterns {
		re := regexp.MustCompile(`(?is)` + pattern)
		regexps = append(regexps, re)
	}

	// Apply all patterns
	result := html
	for _, re := range regexps {
		result = re.ReplaceAllString(result, "")
	}

	// Remove extra whitespace and normalize line endings
	spaceRegex := regexp.MustCompile(`\s+`)
	result = spaceRegex.ReplaceAllString(result, " ")

	// Trim leading/trailing whitespace
	result = strings.TrimSpace(result)

	return result
}
