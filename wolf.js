#!/usr/bin/env node
var rem = require('rem');
var colors = require('colors');

// Define Wolfram Alpha's manifest.
var manifest = {
  "id": "wolframalpha.com",
  "name": "Wolfram Alpha",
  "control": "https://developer.wolframalpha.com/portal/apisignup.html",
  "configuration": ["key"],

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
rem.createClient(manifest).configure({
  format: 'xml'
}).promptConfiguration(function (err, wolf) {

  function query (input) {
    // Make the REST query.
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
  var input = process.argv.slice(2).join(' ');
  if (!input) {
    console.error('Usage: wolf [query]');
    process.exit(1);
  }
  query(input);
});