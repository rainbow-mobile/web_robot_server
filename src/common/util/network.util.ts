import * as os from 'os';

export function getMacAddresses() {
  const networkInterfaces = os.networkInterfaces();
  const macAddresses = [];

  for (const [interfaceName, interfaces] of Object.entries(networkInterfaces)) {
    interfaces.forEach((iface) => {
      if (!iface.internal && iface.mac) {
        macAddresses.push({
          interface: interfaceName,
          mac: iface.mac,
        });
      }
    });
  }

  return macAddresses;
}

export function stringifyAllValues(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      // 객체일 경우 재귀적으로 순회
      stringifyAllValues(obj[key]);
    } else {
      // 문자열로 변환하여 할당
      obj[key] = String(obj[key]);
    }
  }
  return obj;
}

module.exports = {
  getMacAddresses: getMacAddresses,
  stringifyAllValues: stringifyAllValues,
};
