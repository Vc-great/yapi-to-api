const _ = require('lodash')
const path = require('path')
const { success } = require('./color-console')
const fs = require('fs-extra')
const dayjs = require('dayjs')
const format = require('prettier-eslint')
const { compile } = require('json-schema-to-typescript')

const schemaOptions = {
    bannerComment: ''
}
class Generator {
    constructor(apiData, option) {
        this.apiData = apiData
        this.option = option
    }
    async generate() {
        const codeData = await this.generateCode()
        success('yapi接口文档读取完成。')
        const formatCodeData = await this.formatterCode(codeData)
        this.writeFile(formatCodeData, this.option.title)
        success('🎉 文件写入完成。')
    }
    async generateCode() {
        const types = await Promise.all(this.apiData.map(async item => await this.generatorTypes(item)))

        return _.map(this.apiData, (item, index) => {
            return {
                fileName: item.name,
                code: this.generatorClass(item, this.option),
                types: types[index]
            }
        })
    }

    generatorClass(menusItem, option) {
        const list = menusItem.list
        //const firstItem = list[0]

        const str = `
                    import request from '@/api/request'
                    ${this.generatorClassJSDoc(menusItem)}
                    class ApiName {
                        ${list
                            .map(item => {
                                const [funcParams, requestParams] = this.generatorArguments(item)
                                const basePath = this.crudPath(list)

                                return `
                        ${this.generatorFuncJSDoc(item, option, menusItem.name)}
                        ${this.generatorFuncName(item, basePath)}(${funcParams}){
                            return request.${item.method.toLowerCase()}({
                                url:${this.generatorPath(item)}${requestParams ? ',\n' : ''}${requestParams}
                            })
                        }`
                            })
                            .join('')}
                        }
                        const apiName = new ApiName
                        
                        export default apiName
                    `
        return str //.replace(/\n\s*/g, (a) =>a)  //  '\n'
    }

    generatorClassJSDoc(menusItem) {
        return `/*
                     *@分类名称 ${menusItem.name}.
                     *@分类描述 ${menusItem.desc}.
                     *@创建时间 ${this.formatterTime(menusItem.add_time)}.
                     *@更新时间 ${this.formatterTime(menusItem.up_time)}.
                     */`
    }
    formatterTime(time) {
        return dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')
    }

    //
    crudPath(list) {
        const obj = {
            path: '',
            length: Number.MAX_SAFE_INTEGER
        }
        list.forEach(x => {
            const path = x.path.split('/').filter(x => x)
            if (path.length < obj.length) {
                obj.length = path.length
                obj.path = x.path
            }
        })
        return obj.path
    }

    //函数参数
    generatorArguments(item) {
        //params路径参数
        const path = item.req_params.map(x => x.name).join(',')
        //query 查询参数
        const query = item.req_query.map(x => x.name).join(',')
        //data body参数
        const body = item.req_body_other === 'json' ? 'data' : ''
        const isGET = item.method === 'GET'

        const pathStr = `${path ? path : ''}${path && query ? ',' : ''}`
        const queryStr = `${query ? 'params' : ''}${query && !isGET ? ',' : ''}`
        const dataStr = `${isGET ? '' : 'data'}`

        const funcParams = this.replaceStr(`${pathStr}${queryStr}${dataStr}`)

        const requestParams = `${query ? '            params' : ''}${query && !isGET ? ',\n' : ''}${
            isGET ? '' : '            data'
        }`
        return [funcParams, requestParams]
    }

    //生成path
    generatorPath(item) {
        const path = item.path.replace(/{([\w-]+)}/g, (matchData, params) => {
            return '${' + params + '}'
        })

        return '`' + path + '`'
    }

    //函数注释
    generatorFuncJSDoc(item, option, menusItemName) {
        const params = this.handleParams(item)
        const query = this.handleQuery(item)
        const data = this.handleData(item)
        const describe = this.handleDescribe(item, option, menusItemName)
        const arr = [describe, ...params, ...query, ...data]
        let result = arr.reduce((str, item, index) => {
            str += `    ${item}${arr.length - 1 !== index ? '\n' : ''}`
            return str
        }, '')

        const str = `
    /*
    *${item.title}${result ? '\n' : ''}${result}
    */`
        return str
    }

    handleDescribe(item, option, menusItemName) {
        const url = `${option.yapiUrl}/project/${item.project_id}/interface/api/${item._id}`

        return `*@接口分类  ${menusItemName}
    *@接口名称  ${item.title}
    *@接口地址  ${url}
    *@创建人  ${item.username}
    *@创建时间 ${dayjs.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss')}
    *@更新时间  ${dayjs.unix(item.up_time).format('YYYY-MM-DD HH:mm:ss')}`
    }

    handleQuery(item) {
        const addRequired = (required, name) => `${required ? '[' : ''}params.${name}${required ? ']' : ''}`
        return (item.req_query || []).map(x => {
            return `*@param ${addRequired(x.required, x.name)}  ${x.desc}`
        })
    }

    //路径参数
    handleParams(item) {
        const addRequired = (required, name) => `${required ? '[' : ''}${name}${required ? ']' : ''}`
        return (item.req_params || []).map(x => {
            return `*@param  ${addRequired(x.required, x.name)}     ${x.desc}`
        })
    }

    // data参数
    handleData(item) {
        //
        const addRequired = (required, name) => `${required ? '[' : ''}data.${name}${required ? ']' : ''}`
        if (!item?.req_body_other) {
            return []
        }

        const req_body_other = JSON.parse(item?.req_body_other)

        const properties = req_body_other?.items?.properties

        const result = _.reduce(
            properties,
            (result, value, key) => {
                //  const type = req_body_other?.item?.type

                const str = `*@param {${value.type}} ${addRequired(value.required, key)}  ${value.description}`
                return result.concat(str)
            },
            []
        )
        return result
    }

    //
    generatorFuncName(item, basePath) {
        const name = new Map([
            ['GET', 'list'],
            ['POST', 'create'],
            ['PUT', 'update'],
            ['DELETE', 'del'],
            ['PATCH', 'update_patch'],
            ['DETAIL', 'detail']
        ])

        const isMethod = ['PUT', 'DELETE', 'PATCH'].includes(item.method)
        const isMatch = item.path === basePath && name.has(item.method)
        // isMethod||
        if (isMatch) {
            return name.get(item.method)
        }

        const path = item.path.split('/').filter(x => x)
        const hasBracket = path[path.length - 1].includes('{')
        const detailPath = item.path.replace(/\/{([^/]+)}/g, '')
        const isDetail = detailPath === basePath && item.method === 'GET'
        //detail
        if (hasBracket && isDetail) {
            return name.get('DETAIL')
        }
        //其他带括号
        if (hasBracket) {
            const popItem = [...path].pop()
            return this.replaceStr(popItem.slice(1, popItem.length - 1))
        }

        return this.replaceStr(path[path.length - 1])
    }

    async generatorTypes(menuItem) {
        const list = menuItem.list
        const basePath = this.crudPath(list)
        const result = []
        for (const item of list) {
            const typeName = this.generatorFuncName(item, basePath)
            //query
            if (!_.isEmpty(item.req_query)) {
                const queryStr = `
//${item.title}
export interface ${typeName}_query {
${item.req_query
    .map(x => {
        return `//${x.desc}
${x.name}${x.required === '1' ? '' : '?'}:string\n`
    })
    .join('')}
}
                `
                result.push(queryStr)
            }
            //params
            if (this.checkIsJSON(item.res_body)) {
                const bodyObj = JSON.parse(item.res_body.replace(/\$\$ref|\$ref/g, '_null_'))
                bodyObj.title = `${typeName}_params`
                delete bodyObj['$$ref']

                const res_body = await compile(bodyObj, 'res_body', schemaOptions).catch(e => {
                    console.log('-> 错误信息:', e)
                    return ''
                })
                if (res_body) {
                    result.push(`//${item.title}\n`)
                    result.push(res_body)
                }
            }
            // 返回值
            if (this.checkIsJSON(item.req_body_other)) {
                const bodyOtherObj = JSON.parse(item.req_body_other.replace(/\$\$ref|\$ref/g, '_null_'))
                bodyOtherObj.title = `${typeName}_data`
                delete bodyOtherObj['$$ref'] //= `#/definitions/${bodyOtherObj.title}`
                const req_body_other = await compile(bodyOtherObj, 'req_body_other', schemaOptions).catch(e => {
                    console.log('-> 错误信息:', e)
                    return ''
                })
                if (req_body_other) {
                    result.push(`//${item.title}\n`)
                    result.push(req_body_other)
                }
            }
        }
        return result.join(' ')
    }
    checkIsJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str)
                if (typeof obj == 'object' && obj) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                return false
            }
        }
        return false
    }

    async formatterCode(codeData) {
        const OPTION = {
            text: codeData,
            eslintConfig: {
                parserOptions: {
                    ecmaVersion: 7
                },
                rules: {
                    semi: ['error', 'never']
                }
            },
            prettierOptions: {
                bracketSpacing: true,
                tabWidth: 4,
                parser: 'babel' //解析器，默认是babylon，与babel相同。
            },
            fallbackPrettierOptions: {
                singleQuote: false
            }
        }
        const formatMap = _.map(codeData, async (item, index) => {
            const option = _.cloneDeep(OPTION)
            option.text = item.code
            return {
                ...item,
                code: await format(option)
            }
        })

        return await Promise.all(formatMap).catch(err => {
            console.log('格式化错误', err)
            console.log('-> 跳过格式化')
            return codeData
        })
    }

    writeFile(codaData, title) {
        _.map(codaData, item => {
            const filePath = path.join(this.option.projectDir, `.yapi/apis/${title}`, `${item.fileName}.js`)
            fs.outputFileSync(filePath, item.code)
            const typesFilePath = path.join(this.option.projectDir, `.yapi/apis/${title}`, `${item.fileName}Types.ts`)
            fs.outputFileSync(typesFilePath, item.types)
            success(`${item.fileName}`)
        })
    }

    replaceStr(str) {
        return str.replace(/-/g, '_')
    }
}

module.exports = Generator
