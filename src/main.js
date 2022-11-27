#! /usr/bin/env node

const {Command} = require('commander');
const fs = require('fs-extra')
const path = require('path')
const configTemplate = require('../template/config.js')
const GeneratorCode = require('./generator-code.js')
const chalk = require('chalk');
const packageJson = require('../package.json')
const {success} = require('./color-console')
const program = new Command();
const projectDir = process.cwd() //当前工作目录


program
    .name("yapi")
    .usage('<command>')
    .version(packageJson.version, '-v, --version', '版本号')


program
    .command('init')
    .description('初始化,生成配置文件')
    .action(function (source) {
        init()
    })
program
    .command('install')
    .description('生成代码')
    .action(function (source) {
        run()
    })
program
    .command('i')
    .description('生成代码（简写形式）')
    .action(function (source) {
        run()
    })

program
    .parse(process.argv);


function init() {
    //创建.yapi 文件夹
    const dir = path.join(projectDir, '.yapi')
    const dirPath = fs.ensureDirSync(dir)
    //添加gitignore
    addGitignore()

    //todo 未创建成功的容错

    const configFileDir = path.join(projectDir, '.yapi/yapi.config.js')
    const configResult = fs.outputFileSync(configFileDir, configTemplate)
    success("yapi初始化成功，请填写配置文件。");
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
    success("读取配置文件成功。");
    const generatorCode = new GeneratorCode(config)
    generatorCode.run()
}

function addGitignore() {
    const gitignorePath = path.join(projectDir, '.gitignore')
    if (fs.pathExistsSync(gitignorePath)) { //文件存在
        const fileContent = fs.readFileSync(gitignorePath, {encoding: 'utf8', flag: 'r'})
        const hasYapi = fileContent.split('\n').some(item => item.includes('.yapi') && !item.includes('#'))

        if (!hasYapi) {
            fs.writeFileSync(gitignorePath, `${fileContent}\n# 根据yapi文件生成api\n.yapi`, 'utf8')
            success("向.gitignore文件添加.yapi成功");
        }
    } else {//文件不存在
        fs.writeFileSync(gitignorePath, `# 根据yapi文件生成api\n.yapi`, 'utf8')
        success("创建.gitignore文件成功");
    }
}
