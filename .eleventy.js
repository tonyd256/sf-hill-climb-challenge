const sass = require("sass");
const fs = require("fs-extra");
const path = require("path");

module.exports = config => {
  config.addPassthroughCopy("assets");

  if (!fs.existsSync("_site/assets/css")) {
    fs.makeDir("_site/assets/css", { recursive: true })
      .then(renderSass);
  } else {
    renderSass();
  }

  fs.watch(path.dirname("_sass/agency.scss"), renderSass);

};

function renderSass() {
  sass.render({file: "_sass/agency.scss"}, (err, result) => {
    if (err) return console.error(err);
    fs.writeFile("_site/assets/css/agency.css", result.css.toString());
  })
}
