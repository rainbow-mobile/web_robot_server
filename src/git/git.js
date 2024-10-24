const simpleGit = require("simple-git");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { get } = require("http");

simpleGit().clean(simpleGit.CleanOptions.FORCE);

const gitMobileServer = simpleGit({
  baseDir: os.homedir() + "/web_robot_server",
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
});
const gitMobileWeb = simpleGit({
  baseDir: os.homedir() + "/web_robot_ui",
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
});
const gitTaskMan = simpleGit({
  baseDir: os.homedir() + "/TaskMan",
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
});
const gitSLAMNAV2 = simpleGit({
  baseDir: os.homedir() + "/code",
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
});

function getGit(filename) {
  if (filename == "MobileServer") {
    return gitMobileServer;
  } else if (filename == "MobileWeb") {
    return gitMobileWeb;
  } else if (filename == "TaskMan") {
    return gitTaskMan;
  } else if (filename == "SLAMNAV2") {
    return gitSLAMNAV2;
  }
}

async function getFetch(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      getGit(filename)
        .fetch()
        .then(() => {
          console.log(filename + " fetch : success");
          resolve();
        })
        .catch((err) => {
          console.log(filename + " fetch : ", err);
          resolve();
        });
    } catch (error) {
      console.log("filename fetch : error -> ", error);
      reject({ error: error });
    }
  });
}

async function getCommit(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      getGit(filename).revparse(["HEAD"], (err, commitHash) => {
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

async function getFetchCommit(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      getFetch(filename)
        .then((result) => {
          getGit(filename).revparse(["FETCH_HEAD"], (err, commitHash) => {
            if (err) {
              console.error("Error GetCommit : ", err);
              reject({ error: err });
            }
            resolve(commitHash);
          });
        })
        .catch((error) => {
          console.error("Error Fetch : ", error);
          reject({ error: error });
        });
    } catch (error) {
      console.log("getCommit Catch:", error);
      reject({ error: error });
    }
  });
}

async function getLog(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(">>>", await getGit(filename).log());
      resolve(await getGit(filename).log());
    } catch (error) {
      console.log("getCommit Catch:", error);
      reject({ error: error });
    }
  });
}

async function getHeadInfo(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      const log = await getGit(filename).log();
      const headCommit = log.latest;
      console.log(headCommit.hash, headCommit.date, headCommit.message);
      resolve({
        hash: headCommit.hash,
        date: headCommit.date,
        message: headCommit.message,
      });
    } catch (err) {
      console.error(err);
      reject({});
    }
  });
}

async function getFetchHeadInfo(filename) {
  return await new Promise(async (resolve, reject) => {
    try {
      getFetch(filename)
        .then((result) => {
          getGit(filename).revparse(["FETCH_HEAD"], async (err, commitHash) => {
            if (err) {
              console.error("Error GetCommit : ", err);
              reject({ error: err });
            }

            console.log("????????????????", filename);
            try {
              const commitInfo = await getGit(filename).show([
                commitHash,
                "--pretty=format:%H%n%ad%n%s",
                "--no-patch",
              ]);
              const [hash, date, message] = commitInfo.split("\n");

              console.log(hash, date, message);
              resolve({
                hash: hash,
                date: date,
                message: message,
              });
            } catch (e) {
              console.error(e);
              reject();
            }
          });

          // const fetchHeadPath = path.join(".git", "FETCH_HEAD");
          // try {
          //   const fetchHeadContent = fs.readFileSync(fetchHeadPath, "utf-8");
          //   console.log("FETCH HEAD : ", fetchHeadContent);
          // } catch (err) {
          //   console.error(err);
          // }
        })
        .catch((error) => {
          console.error("Error Fetch : ", error);
          reject({ error: error });
        });
    } catch (error) {
      console.log("Catch:", error);
      reject({ error: error });
    }
  });
}

module.exports = {
  getCommit: getCommit,
  getFetchCommit: getFetchCommit,
  getLog: getLog,
  getHeadInfo: getHeadInfo,
  getFetchHeadInfo: getFetchHeadInfo,
};
