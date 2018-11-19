var fs = require("fs").promises;
var path = require("path");
var copyDir = require("../../lib/copyDirectory");
var readJSON = require("../../lib/readJSON");

var { google } = require("googleapis");
var { getClient } = require("../../lib/googleAuth");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { template, slug } = request.body;
  var now = new Date();
  var dateSuffix = [now.getFullYear(), now.getMonth(), now.getDate()].join("");
  var fullSlug = slug + "-" + dateSuffix;
  var dest = path.join(config.root, fullSlug);

  var base = path.join(config.templateRoot, "_base");
  var src = path.join(config.templateRoot, template);

  var manifestPath = path.join(src, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { templateSheet } = manifest;

  try {
    await fs.mkdir(dest);
  } catch (err) {
    // should we complain if it exists?
  }
  await copyDir(base, dest);
  await copyDir(src, dest);

  response.status(302);
  response.set({
    "Location": `/graphic/${fullSlug}/`
  });
  response.send();

};