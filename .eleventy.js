const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const cssPath = path.join(dir.output, "css", "style.css");
    if (!fs.existsSync(cssPath)) return;
    const minified = new CleanCSS({}).minify(fs.readFileSync(cssPath, "utf-8")).styles;
    fs.writeFileSync(cssPath, minified);
  });

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  eleventyConfig.addFilter("imgSrc", (url, width, quality) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality || 70));
      return u.toString();
    } catch { return url; }
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLLL yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (tag !== "posts" && tag !== "all") tagSet.add(tag);
      });
    });
    return [...tagSet].sort();
  });

  eleventyConfig.setServerOptions({
    host: "0.0.0.0",
    port: 8082,
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
