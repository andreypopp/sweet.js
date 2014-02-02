/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var path        = require('path');
var fs          = require('fs');
var resolveSync = require('resolve/lib/sync');
var codegen     = require('escodegen');
var sweet       = require('./sweet');

var cwd         = process.cwd();
var moduleCache = {};

exports.requireModule = function(id, filename) {
    var basedir = filename ? path.dirname(filename) : cwd;
    var key = basedir + id;

    if (!moduleCache[key]) {
        moduleCache[key] = require(resolveSync(id, {basedir: basedir}));
    }
    return moduleCache[key];
}

exports.loadNodeModule = function(root, moduleName, options) {
    options = options || {};
    if (moduleName[0] === '.') {
        moduleName = path.resolve(root, moduleName)
    }
    var filename = resolveSync(moduleName, {basedir: root});
    return sweet.loadModule(fs.readFileSync(filename, "utf8"), undefined, {
        filename: moduleName,
        requireModule: options.requireModule || exports.requireModule
    });
}

// Alow require('./example') for an example.sjs file.
require.extensions['.sjs'] = function(module, filename) {
    var content = require('fs').readFileSync(filename, 'utf8');
    module._compile(codegen.generate(sweet.parse(content)), filename);
};
