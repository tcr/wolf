#!/usr/bin/env node
var rem = require('rem');
var colors = require('colors');

// Define Wolfram Alpha's manifest.
var manifest = {
  "id": "wolfram-alpha",
  "name": "Wolfram Alpha",
  "control": "https://developer.wolframalpha.com/portal/apisignup.html",

  "base": "http://api.wolframalpha.com/v2",
  "configParams": {
    "appid": "key"
  },
  "params": {
    "format": "plaintext"
  },

  "formats": {
    "xml": {}
  }
};

// Create the Wolfram Alpha API.
var wolf = rem.create(manifest, {
  format: 'xml'
}).prompt();

function query(input) {
  // Make REST query.
  wolf('query').get({input: input}, function (err, xml, media) {
    if (xml.get('//error')) {
      // Error message.
      console.error('Error:', xml.get('//error/msg').text());
      process.exit(Number(xml.get('//error/code').text()));
    } else {
      // Print plaintext pods.
      xml.find('//pod').forEach(function (pod) {
        console.log((pod.attr('title').value() || '').yellow);
        pod.find('subpod').forEach(function (subpod) {
          if (subpod.attr('title').value()) {
            console.log(' ' + (subpod.attr('title').value() || '').bold.red);
          }
          subpod.find('plaintext').forEach(function (plaintext) {
            if (plaintext.text().trim()) {
              console.log(prefixLines('   ', plaintext.text()));
            }
          });
        })
      })
    }
  });
}

function prefixLines(prefix, text) {
  return prefix + text.trim().split(/\s*\n\s*/).join('\n' + prefix);
}

// Command line.
query(process.argv.slice(2).join(' '));