module.exports = function (eleventyConfig) {


  eleventyConfig.setBrowserSyncConfig({ notify: true });

  return {
    htmlTemplateEngine: 'liquid',
    passthroughFileCopy: true,
    templateFormats: [
      'liquid',
      'json',
      'md',
      'css',
      'html',
      'yml'
    ],
    dir: {
      input: "site",
      output: "docs",
      includes: "views",
      //  collections: "views",
      layouts: "",
      data: "data"
    }
  };
};
