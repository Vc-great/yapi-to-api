#! /usr/bin/env node

const {Command} = require('commander');
const fs = require('fs-extra')
const path = require('path')
const configTemplate = require('../template/config.js')
const GeneratorCode = require('./generatorCode.js')
//import packageJson from '../package.json' assert {type: "json"};
const program = new Command();
const projectDir = process.cwd() //当前工作目录
//packageJson.version

program
    .version('0.0.1', '-v, --version')
    .description('Yapi-to-api,通过Yapi生成api')
    //
    .command('init')
    .description('初始化,生成配置文件')
    //
    .command('install')
    .description('生成代码')
    //
    .command('i')
    .description('生成代码')
    .action(function (a, b) {
        // console.log('a',a);
        // console.log('b',b);
        const command = b.args[0]
        switch (command) {
            case 'init':
                init()
                break
            case 'install':
                run()
                break
            case 'i':
                run()
                break
        }
    })
    .parse(process.argv);


function init() {
    //创建.yapi 文件夹
    const dir = path.join(projectDir, '.yapi')
    const dirPath = fs.ensureDirSync(dir)
    //todo 未创建成功的容错
    //
    const configFileDir = path.join(projectDir, '.yapi/yapi.config.js')
    const configResult = fs.outputFileSync(configFileDir, configTemplate)
    console.log("-> .yapi初始化成功，请填写配置文件！");
}

//生成代码
async function run() {
    //获取配置文件路径
    const configFile = path.join(projectDir, '.yapi/yapi.config.js')
    //读取配置文件
    const config = {
        ...require(configFile),
        projectDir
    }
    console.log("-> 读取配置文件成功", config);

    const generatorCode = new GeneratorCode(config)
    generatorCode.run()
}
