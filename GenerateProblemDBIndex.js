var fs = require('fs');

function callbackOnlyOnce (cb) {
  var hasCalledBack = false;
  return function () {
    if (hasCalledBack)
      return;
    hasCalledBack = true;
    cb.apply(this, arguments);
  }
}

var basedir = __dirname + '/documents/problems';
var problemDB = {};

function isProblemDir (dirname) {
  for (var i = 0; i < dirname.length; i ++)
    if (dirname[i] == '-')
      return true;
  return false;
}

function addToDB (dirPath, cb) {
  var callback = callbackOnlyOnce(cb);

  fs.readdir(dirPath, function (err, files) {
    if (err) return callback(err);

    var isProblemDir = false;
    for (var i = 0; i < files.length; i ++)
      if (files[i] == 'problem.jade') {
        isProblemDir = true;
        break;
      }

    if (isProblemDir)
      addThisProblemToDB();
    else
      addSubDirsToDB(files);
  });

  function addThisProblemToDB () {
    var relativePath = dirPath.slice(basedir.length + 1);
    var groupPath = relativePath.split('/');

    var handle = problemDB;
    for (var i = 0; i < groupPath.length; i ++) {
      var subGroup = groupPath[i];

      if (!handle.hasOwnProperty(subGroup))
        handle[subGroup] = { type: 'group' };
      handle = handle[subGroup];
    }

    handle.type = 'problem';
    handle.path = dirPath + '/problem.jade';
    callback();
  }

  function addSubDirsToDB (files) {
    var counter = 0;
    files.forEach(function (file) {
      if (file[0] == '.')
        return;

      counter ++;
      fs.stat(dirPath + '/' + file, function (err, stats) {
        if (!stats.isDirectory()) {
          counter --;
          if (counter == 0)
            callback();
          return;
        }

        addToDB(dirPath + '/' + file, function (err) {
          if (err)
            callback(err);
          counter --;
          if (counter == 0)
            callback();
        });
      });
    });
  }
}

addToDB(basedir, function (err) {
  if (err)
    throw err;
  console.log(JSON.stringify(problemDB, null, 2));
});