
const wifi = require('node-wifi');
const os = require('os');
const dns = require('dns')
const { exec } = require('child_process');
const { connect } = require('http2');
// Wi-Fi 초기화
wifi.init({
    iface: null // 디폴트 네트워크 인터페이스를 사용합니다.
});

var wifi_list =[];
async function scan(){
    console.log("scan start");
    return new Promise(async(resolve, reject) =>{
        try{
            // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
            wifi.scan((error, networks) => {
                if (error) {
                    console.error(error);
                    reject();
                }else{
                    // console.log("검색된 Wi-Fi 네트워크:");
                    // console.log(networks);
                    wifi_list2 = networks;
                    wifi_list = [];
                    for(const net of networks){
                        var flag = false;
                        if(net.ssid != ''){
                            for(var w of wifi_list){
                                if(w.ssid == net.ssid){
                                    // console.log("already in ",w.ssid, w.quality, net.quality);
                                    if(w.quality>net.quality){
                                        // console.log("pass");
                                        flag = true;
                                    }else{
                                        w=net;
                                        flag = true;
                                    }
                                    break;
                                }
                            }
                            if(!flag){
                                // console.log("wifi push : ",net);
                                wifi_list.push(net);
                            }
                        }
                    }
                    resolve(wifi_list);
                }
            });    
        }catch(error){
            console.error(error);
            reject();
        }
    });
}

async function getWifiList(){
    return wifi_list;
}

async function getNetwork(){
    return new Promise(async(resolve, reject) =>{
        var net_infos = {ethernet:{},wifi:{},bt:{}};
        exec('nmcli device show', async(err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err}`);
                reject();
            }else{
                try{
                    const networks = stdout.split(/\n\s*\n/);
                    for(const i in networks){
                        const json = await transNMCLI(networks[i]);
                        var _dns=[];
                        for(const key in json.IP4){
                            if(key.startsWith('DNS')){
                                _dns.push(json.IP4[key]);
                            }
                        }
                        if(json.GENERAL.TYPE == 'ethernet'){
                            net_infos.ethernet.type=json.GENERAL.TYPE;
                            net_infos.ethernet.state=parseInt(json.GENERAL.STATE);
                            net_infos.ethernet.device=json.GENERAL.DEVICE;
                            net_infos.ethernet.mac=json.GENERAL.HWADDR;
                            net_infos.ethernet.name=json.GENERAL.CONNECTION;
                            if(net_infos.ethernet.state == 100){
                                net_infos.ethernet.ip=json.IP4['ADDRESS[1]'].split('/')[0];
                                net_infos.ethernet.gateway=json.IP4.GATEWAY;
                                net_infos.ethernet.dns=_dns;
                                net_infos.ethernet.subnet=json.IP4['ADDRESS[1]'].split('/')[1];
                            }
                        }else if(json.GENERAL.TYPE == 'wifi'){
                            net_infos.wifi.type=json.GENERAL.TYPE;
                            net_infos.wifi.state=parseInt(json.GENERAL.STATE);
                            net_infos.wifi.device=json.GENERAL.DEVICE;
                            net_infos.wifi.mac=json.GENERAL.HWADDR;
                            net_infos.wifi.name=json.GENERAL.CONNECTION;
                            if(net_infos.wifi.state == 100){
                                net_infos.wifi.ip=json.IP4['ADDRESS[1]'].split('/')[0];
                                net_infos.wifi.gateway=json.IP4.GATEWAY;
                                net_infos.wifi.dns=_dns;
                                net_infos.wifi.subnet=json.IP4['ADDRESS[1]'].split('/')[1];
                            }
                        }else if(json.GENERAL.TYPE == 'bt'){
                            net_infos.bt.type=json.GENERAL.TYPE;
                            net_infos.bt.state=parseInt(json.GENERAL.STATE);
                            net_infos.bt.device=json.GENERAL.DEVICE;
                            net_infos.bt.mac=json.GENERAL.HWADDR;
                            net_infos.bt.name=json.GENERAL.CONNECTION;
                            if(net_infos.bt.state == 100){
                                net_infos.bt.ip=json.IP4['ADDRESS[1]'].split('/')[0];
                                net_infos.bt.gateway=json.IP4.GATEWAY;
                                net_infos.bt.dns=_dns;
                                net_infos.bt.subnet=json.IP4['ADDRESS[1]'].split('/')[1];
                            }
                        }
                    }

                    //wifi

                    const wifi_detail = await getCurrentWifi();
                    // console.log(wifi_detail);

                    if(wifi_detail[0]){
                        net_infos.wifi.signal_level = wifi_detail[0].signal_level;
                        net_infos.wifi.quality = wifi_detail[0].quality;
                        net_infos.wifi.security = wifi_detail[0].security;
                    }
                    resolve(net_infos);
                }catch(error){
                    console.error(error);
                    reject();
                }
            }
        });
    })
}
async function transNMCLI(inputString){
    return new Promise(async(resolve, reject) =>{
        try{
            const resultObject = {};
            // 입력 문자열을 줄 단위로 분할하여 처리
            inputString.split('\n').forEach(line => {

                // 각 줄을 ':'을 기준으로 키(key)와 값(value)으로 분리
                const split_str = line.split(':');
                const keyWithValue = split_str.shift().trim();
                var value = split_str;
                if(split_str.length>1){
                    var string ='';
                    while(split_str.length > 0){
                        const st = split_str.shift().trim();
                        string += st + ':';
                    }
                    value = string.slice(0, -1);
                }else if(split_str.length == 0){
                    value = '';
                }else{
                    value = split_str.shift().trim();
                }
            
                // 키를 '.'을 기준으로 분리하여 서브키(subkey) 배열로 만듦
                const keys = keyWithValue.split('.');
            
                // 첫 번째 요소를 주 키(mainKey)로 사용
                const mainkey = keys.shift().trim();
                if(!resultObject[mainkey])
                    resultObject[mainkey] = {};
                if(keys.length > 0){
                    const servKey = keys.shift().trim();
                    resultObject[mainkey][servKey] = value;
                }else{
                    resultObject[mainkey] = value;
                }

            });
            resolve(resultObject);
        }catch(error){
            console.error(error);
            reject();
        }
    });
}
async function getCurrentWifi(){
    return new Promise(async(resolve, reject) =>{
        try{
            // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
            wifi.getCurrentConnections((error, networks) => {
                if (error) {
                    console.error(error);
                    reject();
                }else{
                    // console.log(networks);
                    resolve(networks);
                }
            });    
        }catch(error){
            console.error(error);
            reject();
        }
    });
}
async function setEthernet(info){

}
async function connectWifi(info){
    return new Promise(async(resolve, reject) =>{
        try{
            console.log("connectWifi!!",info.ssid);
            exec('nmcli dev wifi connect '+info.ssid, async(err, stdout, stderr) => {
                if (err) {
                    console.error(`Error: ${err}`);
                    reject();
                }else{
                    console.log(stdout);
                    resolve(stdout);
                }
            });
        }catch(error){
            console.error(error);
            reject();
        }
    });
}

module.exports = {
    scan: scan,
    getWifiList:getWifiList,
    getNetwork:getNetwork,
    setEthernet:setEthernet,
    connectWifi:connectWifi
}