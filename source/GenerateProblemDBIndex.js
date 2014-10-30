"use strict";

var fs = require('fs');
var async = require('async');
var suspend = require('suspend');
var resume = suspend.resume;
var _ = require('underscore');

var isProblemDir = dirname => _.toArray(dirname).indexOf('-') != -1;

var listSubDirs = suspend.async(function* (dirpath) {
  var files = yield fs.readdir(dirpath, resume());
  files = files.filter(name => name[0] != '.');

  var stats = yield async.map(files.map(name => dirpath + '/' + name), fs.stat, resume());
  var results = files.filter((name, index) => stats[index].isDirectory());
  return results;
});

var addToCollection = suspend.async(function* (basedir, relativePath) {
  var absolutePath = basedir + '/' + relativePath;
  var results = {};

  var subdirs = yield listSubDirs(absolutePath, resume());
  var [problems, groups] = _.partition(subdirs, isProblemDir);

  if (problems.length)
    results.problems = _.object(problems, problems.map(name => relativePath + '/' + name));

  if (groups.length) {
    var collections = yield async.map(groups.map(name => relativePath + '/' + name),
                                      _.partial(addToCollection, basedir),
                                      resume());
    results.groups = _.object(groups, collections);
  }

  return results;
});

var basedir = __dirname + '/documents';

module.exports = _.partial(basedir, 'problems');
