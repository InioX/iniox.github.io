module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  eleventyConfig.addCollection("allSections", function(collectionApi) {
    let sections = [];

    const projects = require("./src/_data/projects.json");
    
    projects.forEach(project => {
      project.sections.forEach(section => {
        sections.push({
          projectName: project.name,
          projectDesc: project.desc,
          projectSlug: project.name.toLowerCase(),
          sectionId: section.id,
          sectionTitle: section.title,
          sectionFile: section.file,
          project: project
        });
      });
    });
    
    return sections;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
