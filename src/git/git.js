const simpleGit = require("simple-git");
const os = require("os");

simpleGit().clean(simpleGit.CleanOptions.FORCE);

const options = {
  baseDir: os.homedir() + "/MobileServer",
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const git = simpleGit(options);

async function getCommit() {
  return await new Promise(async (resolve, reject) => {
    try {
      git.revparse(["HEAD"], (err, commitHash) => {
        if (err) {
          console.error("Error GetCommit : ", err);
          reject({ error: err });
        }
        resolve(commitHash);
      });
    } catch (error) {
      console.log("getCommit Catch:", error);
      reject({ error: error });
    }
  });
}
async function getFetch() {
  return await new Promise(async (resolve, reject) => {
    try {
      git
        .fetch()
        .then(() => resolve())
        .catch((err) => reject(err));
    } catch (error) {
      console.log("getFetch Catch:", error);
      reject({ error: error });
    }
  });
}

async function getFetchCommit() {
  return await new Promise(async (resolve, reject) => {
    try {
      getFetch()
        .then((result) => {
          git.revparse(["FETCH_HEAD"], (err, commitHash) => {
            if (err) {
              console.error("Error GetCommit : ", err);
              reject({ error: err });
            }
            resolve(commitHash);
          });
        })
        .catch((error) => {
          git.revparse(["FETCH_HEAD"], (err, commitHash) => {
            if (err) {
              console.error("Error GetCommit : ", err);
              reject({ error: err });
            }
            resolve(commitHash);
          });
        });
    } catch (error) {
      console.log("getCommit Catch:", error);
      reject({ error: error });
    }
  });
}

module.exports = {
  git: git,
  getCommit: getCommit,
  getFetchCommit: getFetchCommit,
};
