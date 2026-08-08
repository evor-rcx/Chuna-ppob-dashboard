const fs = require('fs');
const sizeOf = require('image-size');
const dimensions = sizeOf('public/app-icon.png');
console.log("Image size:", dimensions.width, "x", dimensions.height);
