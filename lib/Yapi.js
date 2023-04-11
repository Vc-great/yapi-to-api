//生成api
const YapiApi = require('./Yapi-api')
const _ = require('lodash')
const fs = require('fs-extra')
const dayjs = require('dayjs')
const path = require('path')
const chalk = require('chalk')
const { success, error } = require('./color-console')
//格式化时间
const formatterTime = time => dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')

class Yapi {
    constructor(config) {
        this.option = config
        this.yapiData = []
    }

    async getProjectData() {
        success('开始获取Yapi数据。')
        const result = await this.getYapiData()
        success('Yapi数据获取完成。')
        return result
    }

    //获取yapi数据
    async getYapiData() {
        const yapi = new YapiApi(this.option)
        //获取项目id
        const [e, res] = await yapi.getProjectBaseInfo()

        if (res.errcode !== 0) {
            error(`errcode:${res.errcode},errmsg:${res.errmsg}`)
        }

        const { _id } = res
        //获取所有分类
        const [e1, { data: menusData }] = await yapi.getMenus(_id)

        const getApiDetails = _.flow([formatterResult, apiDetailsMap, flattenApiDetailsMap])(menusData)

        const detailData = await Promise.all(getApiDetails)

        //分类合并详情
        const yapiData = menusMergeDetail(menusData, formatterDetailData(detailData))
        this.yapiData = yapiData
        return yapiData
        //***************utils**********************
        //获取接口详细
        function formatterResult(data) {
            return _.map(data, x => x.list)
        }

        function formatterDetailData(data) {
            return _.map(data, ([e, res]) => {
                if (e) {
                    console.log('请求yapi接口失败', e)
                }
                return res.data
            })
        }

        function apiDetailsMap(data) {
            return _.map(data, (typeItem, index) => {
                return _.map(typeItem, detailItem => {
                    return yapi.getApiDetail(detailItem._id)
                })
            })
        }

        function flattenApiDetailsMap(data) {
            return _.flatten(data)
        }

        // map 请求
        function typeApi(data) {
            return _.map(data, (item, index) => {
                return yapi.getList_cat(item._id)
            })
        }

        function setDetailsMap(data) {
            const map = new Map()
            _.forEach(data, item => map.set(item._id, item))
            return map
        }

        //类型合并详情
        function menusMergeDetail(menusData, detailData) {
            const detailsMap = setDetailsMap(_.map(detailData, x => x))
            return _.map(menusData, item => {
                return {
                    ...item,
                    list: _.map(item.list, detail => detailsMap.get(detail._id))
                }
            })
        }
    }

    //生成接口代码
    generatorApiCode() {
        //生成分类文件
        const typeTemplate = _.map(this.yapiData, item => {
            return {
                fileName: item.name,
                template: generatorClass(item, this.option)
            }
        })
        //写入文件 outputFileSync
        _.map(typeTemplate, item => {
            const filePath = path.join(this.option.projectDir, `.yapi/apis/${item.fileName}.js`)
            success(`${filePath}`)
            return fs.outputFileSync(filePath, item.template)
        })

        //*******************utils***************************

        function generatorClass(menusItem, option) {
            const list = menusItem.list
            const firstItem = list[0]

            const str = `import request from '@/api/request'
/*
 *@分类名称 ${menusItem.name}.
 *@分类描述 ${menusItem.desc}.
 *@创建时间 ${formatterTime(menusItem.add_time)}.
 *@更新时间 ${formatterTime(menusItem.up_time)}.
 */
class ApiName {
    ${list
        .map(item => {
            const [funcParams, requestParams] = generatorArguments(item)
            const basePath = crudPath(list)
            return `${generatorJSDoc(item, option, menusItem.name)}
    ${generatorFuncName(item, basePath)}(${funcParams}){
        return request.${item.method.toLowerCase()}({
            url:${generatorPath(item)}${requestParams ? ',\n' : ''}${requestParams}
        })
    }`
        })
        .join('')}
}
const apiName = new ApiName

export default apiName
                `
            return str.replace(/\n\s*/g, a => {
                return a //  '\n'
            })
        }

        //
        function crudPath(list) {
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
        function generatorArguments(item) {
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

            const funcParams = `${pathStr}${queryStr}${dataStr}`

            const requestParams = `${query ? '            params' : ''}${query && !isGET ? ',\n' : ''}${
                isGET ? '' : '            data'
            }`
            return [funcParams, requestParams]
        }

        //生成path
        function generatorPath(item) {
            const path = item.path.replace(/{([\w-]+)}/g, (matchData, params) => {
                return '${' + params + '}'
            })

            return '`' + path + '`'
        }

        //函数注释
        function generatorJSDoc(item, option, menusItemName) {
            const params = handleParams(item)
            const query = handleQuery(item)
            const data = handleData(item)
            const describe = handleDescribe(item, option, menusItemName)
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

            function handleDescribe(item, option, menusItemName) {
                const url = `${option.yapiUrl}/project/${item.project_id}/interface/api/${item._id}`

                return `*@接口分类  ${menusItemName}
    *@接口名称  ${item.title}
    *@接口地址  ${url}
    *@创建人  ${item.username}
    *@创建时间 ${dayjs.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss')}
    *@更新时间  ${dayjs.unix(item.up_time).format('YYYY-MM-DD HH:mm:ss')}`
            }

            function handleQuery(item) {
                const addRequired = (required, name) => `${required ? '[' : ''}params.${name}${required ? ']' : ''}`
                return (item.req_query || []).map(x => {
                    return `*@param ${addRequired(x.required, x.name)}  ${x.desc}`
                })
            }

            //路径参数
            function handleParams(item) {
                const addRequired = (required, name) => `${required ? '[' : ''}${name}${required ? ']' : ''}`
                return (item.req_params || []).map(x => {
                    return `*@param  ${addRequired(x.required, x.name)}     ${x.desc}`
                })
            }

            // data参数
            function handleData(item) {
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
        }

        //
        function generatorFuncName(item, basePath) {
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

            if (path[path.length - 1].includes('{')) {
                const detailPath = item.path.replace(/\/{([^/]+)}/g, '')
                //detail 命名
                if (detailPath === basePath && item.method === 'GET') {
                    return name.get('DETAIL')
                }
                return path[path.length - 2]
            } else {
                return path[path.length - 1]
            }
        }
    }
}

module.exports = Yapi
