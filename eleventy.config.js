module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("docProjects", function (collectionApi) {
    const projects = require("./src/_data/projects.json");
    return projects.filter(
      (project) => project.sections && project.sections.length > 0,
    );
  });

  eleventyConfig.addCollection("allSections", function (collectionApi) {
    let sections = [];
    const projects = require("./src/_data/projects.json");

    const validProjects = projects.filter(
      (project) => project.sections && Array.isArray(project.sections),
    );

    validProjects.forEach((project) => {
      project.sections.forEach((section) => {
        sections.push({
          projectName: project.name,
          projectDesc: project.desc,
          projectSlug: project.name.toLowerCase(),
          sectionId: section.id,
          sectionTitle: section.title,
          sectionFile: section.file,
          link: project.link,
          discord: project.discord,
          theme: project.theme,
          project: project,
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
