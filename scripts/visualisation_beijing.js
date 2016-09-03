var photosArray = [];
var canvas = {};
var padding = {left: 20, right: 20, top: 20, bottom: 20};
var circle = {};

function getImageURL(index) {
  var photoInfo = photosArray[index];
  var photoId = photoInfo.photo.id;
  var farmId = photoInfo.photo.farm;
  var serverId = photoInfo.photo.server;
  var secret = photoInfo.photo.secret;

  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_s.jpg";
}

var saveImage = function(img, i) {
  // saves the image data from the url to local browser
  var temp = photosArray[i];
  var date = Date.parse(photosArray[i].photo.dates.taken);
  var month = date.getMonth();
  if(monthImageCount[month] !== undefined) {
    monthImageCount[month] = monthImageCount[month]+1;
  } else {
    monthImageCount[month] = 0;
  }
  var angle = (360.0/12) * (i-1);
  angle = (angle-90)*Math.PI/180.0;
  var rad = 65+(1*monthImageCount[month]);
  var x = circle.origin.x + rad * Math.cos(angle);
  var y = circle.origin.y + rad * Math.sin(angle);
  temp.image = new p5.img(img, x, y, 20, 20);
  temp.imageLoaded = true;
  photosArray[i] = temp;

  if (i == 249) {
    redraw();
  }
};

function loadImages() {
  for(var i = 0; i < photosArray.length; i++) {
    if (!photosArray[i].imageLoaded) {
      var img = loadImage(getImageURL(i));
      saveImage(img, i);
    }
  }
}

function preload() {
  httpGet("photos_info_beijing.json", {}, "json", function(data) {
    photosArray = data;
    loadImages();
  });
}

function setup() {
  var sketchCanvas = createCanvas(window.innerWidth,window.innerHeight);
  canvas = {x: 0, y: 0, width: window.innerWidth, height: window.innerHeight};
  circle = {origin: {x: canvas.width/2, y: canvas.height/2},
  // TODO: fix for height more than width
  radius: (Math.min(canvas.width, canvas.height)/2) - padding.left - padding.right};
  // noLoop();
}
var monthImageCount = {};
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function draw() {
  background(30);
  fill(256);
  // print months
  for (var i = 1; i <= 12; i++) {
    var rad = 40;
    var angle = (360.0/12) * (i-1);
    angle = (angle-90)*Math.PI/180.0;
    var x = circle.origin.x -5 + rad * Math.cos(angle);
    var y = circle.origin.y +10 + rad * Math.sin(angle);
    text(monthNames[i-1], x, y);
  }

  for(var j in photosArray) {
    if (photosArray[j].imageLoaded) {
      var date = null;
      if(photosArray[j].photo.dates && photosArray[j].photo.dates.taken) {
        photosArray[j].image.draw();
      }
    }
  }
}
