import assert from 'assert';
import fs from 'fs';
import path from 'path';

const filesList = [];

function searchForKeyword(keyword, file, cb) {
  fs.readFile(file, (err, fileContent) => {
    if (fileContent.includes(keyword)) {
      filesList.push(file);
    }
    cb();
  });
}

function examineFilesFromPath(keyword, nextFile, cb) {
  fs.stat(nextFile, (err, stat) => {
    if (err) {
      throw err;
    }
    if (!stat.isDirectory()) {
      return searchForKeyword(keyword, nextFile, () => {
        cb();
      });
    }
    recursiveFind(keyword, nextFile, () => {
      cb();
    });
  });
}

let concurrency = 2;
let running = 1;

function iterateFiles(keyword, dir, filesInDir, cb) {
  let idx = 0;
  let completed = 0;

  function processFile() {
    running--;
    setTimeout(() => {
      while(running < concurrency && idx < filesInDir.length) {
        const nextFile = path.join(dir, filesInDir[idx]);
        console.log(`Processing ${nextFile}`);

        examineFilesFromPath(keyword, nextFile, () => {
          completed++;
          if (completed === filesInDir.length) {
            return cb(filesList);
          }
          processFile();
        });
        idx++;
        running++;
      }
    }, 1000);
  }
  processFile();
}

function recursiveFind(keyword, dir, cb) {
  fs.readdir(dir, (err, filesInDir) => {
    iterateFiles(keyword, dir, filesInDir, cb);
  });
}

recursiveFind("batman", 'myDir', files => {
  console.log('Operation done');
  let len = files.length;
  while(len-- > 0) {
    console.log(files[len]);
  }
});

// zostało jeszcze ograniczenie do maksymalnie 2 ścieżek
