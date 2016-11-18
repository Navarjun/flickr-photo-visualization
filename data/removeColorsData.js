var filename = process.argv[2];
var outFilename = process.argv[3] ? process.argv[3] : "data.json";
var fs = require('fs');
fs.readFile(filename, 'utf8', function(err, content) {
  if (!err) {
    var data = JSON.parse(content);
    console.log(filename +" — read and parsed to JSON object");
    data.forEach(function(d) {
      delete d["colors"];
    });
    console.log(JSON.stringify(data[0], null, 2));
    writeData(data)
  } else {
    console.log(err);
  }
});

function writeData(data) {
  fs.writeFile(outFilename, JSON.stringify(data), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON with "+data.length+" images saved to " + outFilename);
    }
  });
}
