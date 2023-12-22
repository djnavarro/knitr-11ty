const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("normalize.css");
  eleventyConfig.addPassthroughCopy("skeleton.css");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  eleventyConfig.addPassthroughCopy("CNAME");

  return {
    dir: {
      output: "docs"
    }
  }
};