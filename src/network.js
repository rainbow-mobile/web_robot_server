const wifi = require("node-wifi");
const os = require("os");
const dns = require("dns");
const moment = require("moment");
const { exec } = require("child_process");
const { connect } = require("http2");
const logger = require("./log/logger");
// Wi-Fi 초기화
wifi.init({
  iface: null, // 디폴트 네트워크 인터페이스를 사용합니다.
});

var wifi_list = [];
async function scan() {
  return new Promise(async (resolve, reject) => {
    try {
      // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
      wifi.scan((error, networks) => {
        if (error) {
          console.error(error);
          reject();
        } else {
          // console.log("검색된 Wi-Fi 네트워크:");
          // console.log(networks);
          wifi_list2 = networks;
          wifi_list = [];
          for (const net of networks) {
            var flag = false;
            if (net.ssid != "") {
              for (var w of wifi_list) {
                if (w.ssid == net.ssid) {
                  // console.log("already in ",w.ssid, w.quality, net.quality);
                  if (w.quality > net.quality) {
                    // console.log("pass");
                    flag = true;
                  } else {
                    w = net;
                    flag = true;
                  }
                  break;
                }
              }
              if (!flag) {
                // console.log("wifi push : ",net);
                wifi_list.push(net);
              }
            }
          }
          resolve(wifi_list);
        }
      });
    } catch (error) {
      console.error(error);
      reject();
    }
  });
}

async function getWifiList() {
  return wifi_list;
}

async function getNetwork() {
  return new Promise(async (resolve, reject) => {
    var net_infos = { ethernet: [], wifi: [], bt: [] };
    exec("nmcli device show", async (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err}`);
        reject();
      } else {
        try {
          const date2 = moment();
          const date_str2 = date2.format("YYYY-MM-DD HH:mm:ss.SSS").toString();
          console.log("network get", date_str2);
          const networks = stdout.split(/\n\s*\n/);
          for (const i in networks) {
            const json = await transNMCLI(networks[i]);
            var temp_info = {};
            var _dns = [];
            for (const key in json.IP4) {
              if (key.startsWith("DNS")) {
                _dns.push(json.IP4[key]);
              }
            }

            temp_info.type = json.GENERAL.TYPE;
            temp_info.state = parseInt(json.GENERAL.STATE);
            temp_info.device = json.GENERAL.DEVICE;
            temp_info.mac = json.GENERAL.HWADDR;
            temp_info.name = json.GENERAL.CONNECTION;
            if (temp_info.state == 100) {
              temp_info.ip = json.IP4["ADDRESS[1]"].split("/")[0];
              temp_info.gateway = json.IP4.GATEWAY;
              temp_info.dns = _dns;
              temp_info.subnet = json.IP4["ADDRESS[1]"].split("/")[1];
            }

            if (json.GENERAL.TYPE == "ethernet") {
              net_infos.ethernet.push(temp_info);
            } else if (json.GENERAL.TYPE == "wifi") {
              net_infos.wifi.push(temp_info);
            } else if (json.GENERAL.TYPE == "bt") {
              net_infos.bt.push(temp_info);
            }
          }

          //wifi
          const date3 = moment();
          const date_str3 = date3.format("YYYY-MM-DD HH:mm:ss.SSS").toString();
          console.log("network before getcurrentwifi", date_str3);
          const wifi_detail = await getCurrentWifi();
          // console.log(wifi_detail);

          const date4 = moment();
          const date_str4 = date4.format("YYYY-MM-DD HH:mm:ss.SSS").toString();
          console.log("network after getcurrentwifi", date_str4);
          if (wifi_detail[0] && net_infos.wifi.length != 0) {
            net_infos.wifi[0].signal_level = wifi_detail[0].signal_level;
            net_infos.wifi[0].quality = wifi_detail[0].quality;
            net_infos.wifi[0].security = wifi_detail[0].security;
          }
          const date = moment();
          const date_str = date.format("YYYY-MM-DD HH:mm:ss.SSS").toString();

          console.log("network done", date_str);
          resolve(net_infos);
        } catch (error) {
          console.error(error);
          reject();
        }
      }
    });
  });
}
async function transNMCLI(inputString) {
  return new Promise(async (resolve, reject) => {
    try {
      const resultObject = {};
      // 입력 문자열을 줄 단위로 분할하여 처리
      inputString.split("\n").forEach((line) => {
        // 각 줄을 ':'을 기준으로 키(key)와 값(value)으로 분리
        const split_str = line.split(":");
        const keyWithValue = split_str.shift().trim();
        var value = split_str;
        if (split_str.length > 1) {
          var string = "";
          while (split_str.length > 0) {
            const st = split_str.shift().trim();
            string += st + ":";
          }
          value = string.slice(0, -1);
        } else if (split_str.length == 0) {
          value = "";
        } else {
          value = split_str.shift().trim();
        }

        // 키를 '.'을 기준으로 분리하여 서브키(subkey) 배열로 만듦
        const keys = keyWithValue.split(".");

        // 첫 번째 요소를 주 키(mainKey)로 사용
        const mainkey = keys.shift().trim();
        if (!resultObject[mainkey]) resultObject[mainkey] = {};
        if (keys.length > 0) {
          const servKey = keys.shift().trim();
          resultObject[mainkey][servKey] = value;
        } else {
          resultObject[mainkey] = value;
        }
      });
      resolve(resultObject);
    } catch (error) {
      console.error(error);
      reject();
    }
  });
}
async function getCurrentWifi() {
  return new Promise(async (resolve, reject) => {
    try {
      // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
      wifi.getCurrentConnections((error, networks) => {
        if (error) {
          console.error(error);
          reject();
        } else {
          // console.log(networks);
          resolve(networks);
        }
      });
    } catch (error) {
      console.error(error);
      reject();
    }
  });
}

async function setIP(info) {
  return new Promise(async (resolve, reject) => {
    try {
      let dns_str = '"';
      for (var i = 0; i < info.dns.length; i++) {
        dns_str += info.dns[i] + " ";
      }
      dns_str += '"';
      const cmd =
        "nmcli con modify '" +
        info.name +
        "' ipv4.addresses " +
        info.ip +
        "/" +
        info.subnet +
        " ipv4.gateway " +
        info.gateway +
        " ipv4.dns " +
        dns_str +
        " ipv4.method manual";

      logger.info("SET IP : " + cmd);
      exec(cmd, async (err, stdout, stderr) => {
        if (err) {
          logger.error("SET IP Error : ", err);
          reject();
        } else {
          exec(
            'nmcli con down "' +
              info.name +
              '" && nmcli con up "' +
              info.name +
              '"',
            async (err, stdout, stderr) => {
              if (err) {
                console.error(`Error: ${err}`);
                reject();
              } else {
                console.log(stdout);
                resolve(stdout);
              }
            }
          );
          // resolve(stdout);
        }
      });
    } catch (error) {
      logger.error("SET IP Error : ", error);
      reject(error);
    }
  });
}

async function setWifi(info) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("setWifi!!", info.name);

      let dns_str = '"';
      for (var i = 0; i < info.dns.length; i++) {
        dns_str += info.dns[i] + " ";
      }
      dns_str += '"';

      const cmd =
        "nmcli con modify " +
        info.name +
        " ipv4.addresses " +
        info.ip +
        "/" +
        info.subnet +
        " ipv4.gateway " +
        info.gateway +
        " ipv4.dns " +
        dns_str +
        " ipv4.method manual";
      console.log("setWifi CMD : ", cmd);
      exec(cmd, async (err, stdout, stderr) => {
        if (err) {
          console.error(`Error: ${err}`);
          reject();
        } else {
          console.log(stdout);

          exec(
            "nmcli con down " + info.name + " && nmcli con up " + info.name,
            async (err, stdout, stderr) => {
              if (err) {
                console.error(`Error: ${err}`);
                reject();
              } else {
                console.log(stdout);
                resolve(stdout);
              }
            }
          );
        }
      });
    } catch (error) {
      console.error(error);
      reject();
    }
  });
}

async function connectWifi(info) {
  return new Promise(async (resolve, reject) => {
    try {
      let cmd_line;
      if (info.password == undefined || info.password == "") {
        cmd_line =
          'echo "rainbow" | sudo -S nmcli dev wifi connect "' + info.ssid + '"';
      } else {
        cmd_line =
          'echo "rainbow" | sudo -S nmcli dev wifi connect "' +
          info.ssid +
          '" password "' +
          info.password +
          '"';
      }
      logger.info("Connect Wifi : " + cmd_line);
      exec(cmd_line, async (err, stdout, stderr) => {
        if (err) {
          logger.error("Connect Wifi Error : " + err);
          if (err.toString().includes("Secrets were required")) {
            resolve({
              ...info,
              result: "fail",
              message: "Secrets were required, but not provided",
            });
          } else if (err.toString().includes("property is invalid")) {
            resolve({
              ...info,
              result: "fail",
              message: "Secrets were required, but not invalid",
            });
          } else {
            resolve(err);
          }
        } else {
          logger.info("Connect Wifi Result : " + stdout);
          if (stdout.includes("successfully")) {
            resolve({ ...info, result: "success" });
          } else if (stdout.includes("Secrets were required")) {
            resolve({
              ...info,
              result: "fail",
              message: "Secrets were required, but not provided",
            });
          } else if (stdout.includes("property is invalid")) {
            resolve({
              ...info,
              result: "fail",
              message: "Secrets were required, but not invalid",
            });
          } else {
            resolve(stdout);
          }
        }
      });
    } catch (error) {
      logger.warn("Connect Wifi Error : " + error);
      if (error.toString().includes("Secrets were required")) {
        resolve({
          ...info,
          result: "fail",
          message: "Secrets were required, but not provided",
        });
      } else if (stdout.toString().includes("property is invalid")) {
        resolve({
          ...info,
          result: "fail",
          message: "Secrets were required, but not invalid",
        });
      } else {
        resolve(error);
      }
    }
  });
}

module.exports = {
  scan: scan,
  getWifiList: getWifiList,
  getNetwork: getNetwork,
  setIP: setIP,
  connectWifi: connectWifi,
};
