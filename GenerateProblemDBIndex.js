var fs = require('fs');
var async = require('async');
var _ = require('underscore');

function makeRelativePathCall (prefix, func) {
  return function (relativePath, callback) {
    func(prefix + '/' + relativePath, callback);
  } 
}

function isProblemDir (dirname) {
  for (var i = 0; i < dirname.length; i ++)
    if (dirname[i] == '-')
      return true;
  return false;
}

function listSubDirs (dirpath, callback) {
  fs.readdir(dirpath, function (err, files) {
    if (err) return callback(err);
    
    files = files.filter(function (name) { return name[0] != '.'; });
    async.map(files, makeRelativePathCall(dirpath, fs.stat), function (err, stats) {
      if (err) return callback(err);

      var results = files.filter(function (name, index) {
        return stats[index].isDirectory();
      });

      callback(null, results);
    });
  });
}

function addToDB (dirpath, callback) {
  var results = { type: 'group' };
  var relativePath = dirpath.slice(basedir.length + 1);

  listSubDirs(dirpath, function (err, dirs) {
    if (err) return callback(err);

    var partition = _.partition(dirs, isProblemDir);
    var problemDirs = partition[0],
        groupDirs = partition[1];

    addProblemDirsToDB(problemDirs);
    addGroupDirsToDB(groupDirs);
  });

  function addProblemDirsToDB(problemDirs) {
    problemDirs.forEach(function (name) {
      results[name] = {
        type: 'problem',
        path: relativePath + '/' + name
      };
    });
  }

  function addGroupDirsToDB(groupDirs) {
    async.map(groupDirs, makeRelativePathCall(dirpath, addToDB), function (err, slices) {
      if (err) return callback(err);

      for (var i = 0; i < slices.length; i ++)
        results[groupDirs[i]] = slices[i];

      callback(null, results);
    });
  }
}

var basedir = __dirname + '/documents/problems';

addToDB(basedir, function (err, problemDB) {
  if (err)
    throw err;
  console.log(JSON.stringify(problemDB, null, 2));
});
