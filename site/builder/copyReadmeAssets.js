import fs from 'fs-promise';
import path from 'path';
import glob from 'glob';

const root = path.resolve(__dirname, '../../');
const apiDistFolder = path.resolve(root, 'site/dist/api');

const imageGlob = 'node_modules/d3fc-*/**/*.png';

function ensureExists(pathname, cb) {
  fs.mkdir(path.dirname(pathname), (err) => {
    if (!err || err.code === 'EEXIST') {
      return cb();
    }
    throw err;
  });
}

const getImageFilename = (pathname) => {
  return path.join(apiDistFolder, pathname.replace(new RegExp('node_modules/[^`/]*/'), ''));
};

function createFile(path, buffer) {
  const pathname = getImageFilename(path);
  return ensureExists(pathname, () => {
    fs.writeFile(pathname, buffer);
  });
}

export default (data) =>
  new Promise((resolve, reject) => {
    glob(imageGlob, { cwd: root }, (err, files) => {
      if (err) {
        console.error('Finding README Images failed - ', err);
        reject(err);
      }

      const readPromises = files.map(filename => {
        const filepath = path.join(root, filename);
        return fs
          .readFile(filepath)
          .then(buffer => createFile(filename, buffer));
      });

      return Promise
        .all(readPromises)
        .then(() => resolve(data))
        .catch(reject);
    });
  });
