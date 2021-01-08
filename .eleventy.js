const sass = require("sass");
const fs = require("fs-extra");
const path = require("path");

module.exports = config => {
  config.addPassthroughCopy("assets");

  renderSass();
  fs.watch(path.dirname("_sass/agency.scss"), renderSass);
};

function renderSass() {
  sass.render({file: "_sass/agency.scss"}, (err, result) => {
    if (err) return console.error(err);
    fs.writeFile("assets/css/agency.css", result.css.toString());
  })
}
