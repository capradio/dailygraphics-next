var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var makeJS = app.get("processJS");
  var consoles = app.get("browserConsole");

  var { slug } = request.params;
  var filename = path.basename(request.path);
  var sourceFile = path.join(config.root, slug, filename);

  var jsCache = app.get("cache").partition("js");

  try {
    var cached = jsCache.get(sourceFile);
    var output = cached || await makeJS(sourceFile);

    response.set({
      "Content-Type": "application/javascript"
    })
    response.send(output);
    if (!cached) jsCache.set(sourceFile, output);
  } catch (err) {
    response.status(500);
    response.send(err.message);
    consoles.error(err.message);
  }

};