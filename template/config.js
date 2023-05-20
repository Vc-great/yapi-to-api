const temp = `
module.exports = {
    yapiUrl:'',  // example: www.baidu.com
    typeResponseArray:false,  //返回值ts类型是否为数组 false: Promise<response> true: [object,Promise<response>]
    jsonSchema:true,  //是否生成jsonSchema
    projects:[
        {
            title:'',  //项目名称 
            token:''  //项目token
        }
    ]
}
`

module.exports = temp
