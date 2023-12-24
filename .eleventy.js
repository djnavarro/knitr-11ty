// syntax highlighing is a separate npm package
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {

  // use syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // pass through for individual site files
  eleventyConfig.addPassthroughCopy("normalize.css");
  eleventyConfig.addPassthroughCopy("skeleton.css");
  eleventyConfig.addPassthroughCopy("tweaks.css");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("preview.jpg");

  // pass through for png files in posts, preserving directory structure
  eleventyConfig.addPassthroughCopy("posts/**/*.png");

  // configure the output directory
  return {
    dir: {
      output: "docs"
    }
  }
};