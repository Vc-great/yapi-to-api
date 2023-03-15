const path = require('path')
const fs = require('fs-extra')
const configTemplate = require('../template/config')
const { success } = require('./color-console')
const Generator = require('./Generator')
const Yapi = require('./Yapi')
//const dynamicallyConfigPath = require("./dynamically");
// 命令运行时的目录
const cwd = process.cwd()
const configPath = path.join(cwd, '.yapi/yapi.config.js')

//生成配置文件
exports.createFile = () => {
    createGitignore()
    createConfig()
}

//生成代码
exports.createCode = async () => {
    //读取配置文件
    const config = {
        ...require(configPath),
        projectDir: cwd
    }
    success('读取配置文件成功。')
    //获取yapi数据
    const yapi = new Yapi(config)
    const result = await yapi.getProjectData()
    //生成code
    const generator = new Generator(result, config)
    await generator.generate()
}

/***
 * 创建yapi配置文件
 * @returns {*}
 */
function createConfig() {
    const dir = path.join(cwd, '.yapi')
    const configFileDir = path.join(cwd, '.yapi/yapi.config.js')

    if (fs.pathExistsSync(dir) && fs.pathExistsSync(configFileDir)) {
        return success('yapi.config.js文件存在，请填写配置文件。')
    }

    fs.ensureDirSync(dir, {})

    if (fs.pathExistsSync(configFileDir)) {
        success('yapi.config.js文件存在，请填写配置文件。')
    } else {
        fs.outputFileSync(configFileDir, configTemplate)
        success('yapi初始化成功，请填写配置文件。')
    }
}

/**
 * 创建gitignore文件
 */
function createGitignore() {
    const gitignorePath = path.join(cwd, '.gitignore')

    if (fs.pathExistsSync(gitignorePath)) {
        //文件存在
        const fileContent = fs.readFileSync(gitignorePath, { encoding: 'utf8', flag: 'r' })
        const hasYapi = fileContent.split('\n').some(item => item.includes('.yapi') && !item.includes('#'))

        if (!hasYapi) {
            fs.writeFileSync(gitignorePath, `${fileContent}\n# 根据yapi文件生成api\n.yapi`, 'utf8')
            success('向.gitignore文件添加.yapi成功')
        }
    } else {
        //文件不存在
        fs.writeFileSync(gitignorePath, `# 根据yapi文件生成api\n.yapi`, 'utf8')
        success('创建.gitignore文件成功')
    }
}
