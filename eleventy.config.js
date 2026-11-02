module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");

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
          sectionFile: section.file
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
