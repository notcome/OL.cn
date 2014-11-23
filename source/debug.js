"use strict";

var requires    = require('./Interface');
var {_, printf} = requires.foundation;
var {fs, path}  = requires.io;
var {async, suspend, resume}
                = requires.async;

var aYJLCompiler = require('./CompileYJL');

const templateDir = path.resolve(__dirname, '../layouts')

var problemTemplate = fs.readFileSync(path.join(templateDir, 'problem.jade'), 'utf8');
problemTemplate = aYJLCompiler.compile(problemTemplate);

const documentDir = path.resolve(__dirname, '../documents');
const outputDir   = path.resolve(__dirname, '../output');

var generateProblemDBIndex = require('./GenerateProblemDBIndex');

suspend.run(function* () {
  let problemDBIndex = yield generateProblemDBIndex(resume());
  yield dispath(problemDBIndex, resume());
});

var dispath = suspend.async(function* (db) {
  if (typeof db == 'string') {
    return yield work(db);
  }
  let keys = _.keys(db);
  yield async.map(
    keys.map(child => db[child]),
    dispath,
    resume());
});

let mark = printf('[%s]:');
let noSupport = printf('cannot compile %s, since %s is not supported');
let compiled = printf('compiled %s.');
let compilingError = printf('when compiling [%s]: [%s]:');

var work = suspend(function* (uri) {
  let toBeCompiled = yield fs.readdir(path.join(documentDir, uri), resume());

  yield async.map(
    toBeCompiled,
    suspend.async(function* (file) {
      let extname = path.extname(file);
      let filename = path.basename(file, extname);
      if (extname != '.jade') {
        console.log(mark(uri));
        console.log(noSupport(file, extname));
      }

      try {
        let content = yield fs.readFile(path.join(documentDir, uri, file), 'utf8', resume());
        let rendered = aYJLCompiler.render(content);
        let output = problemTemplate.compile(rendered).content;

        yield fs.writeFile(
          path.join(outputDir, uri, filename + '.html'),
          output,
          'utf8',
          resume());

        console.log(mark(uri), compiled(file));
      } catch (err) {
        console.log(compilingError(uri, file));
        console.log(err);
        throw err;
      }
    }),
    resume());
});


