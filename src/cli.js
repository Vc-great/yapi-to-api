const path = require('path')

async function init() {
    console.log("-> 读取配置文件！");
    const configFile = path.join(projectDir, '.yapi/yapi.config.js')
    //读取配置文件
    const config = require(configFile).default
    console.log("-> 读取配置文件成功", config);

}

init()
