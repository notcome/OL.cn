"use strict";

var requires = require('./Interface');
var _        = requires.foundation._;
var fs       = requires.io.fs;
var {async, suspend, resume}
             = requires.async;

const documentDir = __dirname + '/../documents';
const outputDir   = __dirname + '/../output';

var isProblemDir = dirname => _.toArray(dirname).indexOf('-') != -1;
var path = (...path) => path.join('/');

function tryMkdir (path, callback) {
  fs.mkdir(path, function (err) {
    if (!err)
      return callback();
    if (err.code == 'EEXIST')
      return callback();
    else
      return callback(err);
  });
}

var listSubDirs = suspend.async(function* (dirpath) {
  let allFiles = yield fs.readdir(dirpath, resume());
  let files = allFiles.filter(name => name[0] != '.');

  let stats =
    yield async.map(
      files.map(name => path(dirpath, name)),
      fs.stat,
      resume());
  let results = files.filter((name, index) => stats[index].isDirectory());
  return results;
});

var addToCollection = suspend.async(function* (lastUri, thisName) {
  let thisUri = path(lastUri, thisName);
  var results = {};

  yield tryMkdir(
    path(outputDir, thisUri),
    resume());

  let subdirs =
    yield listSubDirs(
      path(documentDir, thisUri),
      resume());

  let [problems, groups] = _.partition(subdirs, isProblemDir);

  if (problems.length) {
    yield async.map(
      problems.map(name => path(outputDir, thisUri, name)),
      tryMkdir,
      resume());

    results.problems = _.object(problems, problems.map(name => thisName + '/' + name));
  }

  if (groups.length) {
    let collections =
      yield async.map(
        groups,
        _.partial(addToCollection, thisUri),
        resume());

    results.groups = _.object(groups, collections);
  }

  return results;
});

module.exports = _.partial(addToCollection, '', 'problems');
