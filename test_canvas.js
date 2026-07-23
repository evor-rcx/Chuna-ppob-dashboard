const { register } = require('node:module');
const { pathToFileURL } = require('node:url');

register('tsx', pathToFileURL('./'));
