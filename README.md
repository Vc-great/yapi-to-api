# yapi-to-api

根据Yapi提供的接口文档，生成api。

## 文档
```js
yapi -h
Commands:
  init            初始化,生成配置文件
  install         生成代码
  i               生成代码（简写形式）
```
## 使用
安装
```js
npm i yapi-to-api -g
//验证 
yapi -v
```

使用
```js
//进⼊项⽬根⽬录下
cd project

//⽣成配置⽂件
yapi init

//在.yapi/yapi.config.js中填写yapi配置
module.exports = {
    yapiUrl:'www.baidu.com', // yapi访问地址
    projectToken:'dff7d02796ffac69eb7b01f'  //yapi中项⽬的token
}

//生成api
yapi i  
// or
yapi install
```
在.yapi/apis查看生成的api



## 生成api

```js
import request from '@/api/request'

/*
 *@分类名称 报表管理.
 *@分类描述 Report Controller.
 *@创建时间 2022-09-24 14:31:28.
 *@更新时间 2022-09-24 14:31:28.
 */
class ApiName {

    /*
    *获取报表列表
    *@接口分类  报表管理
    *@接口名称  获取报表列表
    *@接口地址  http://www.yapi.com/project/140/interface/api/38365
    *@创建人  user
    *@创建时间 2022-09-24 14:31:44
    *@更新时间  2022-09-24 14:31:44
    *@param  isDelete  query参数   删除标识
    *@param  modelTypeId  query参数   专题分类Id
    *@param  page  query参数   页码 (0..N)
    *@param  size  query参数   每页显示的数目
    *@param  sort  query参数   以下列格式排序标准：property[,asc | desc]。 默认排序顺序为升序。 支持多种排序条件：如：id,asc
    *@param  statisticalType  query参数   统计类型 0-总体统计，1-企业列表，2-机构列表，3-区县列表
    */
    list(params) {
        return request.get({
            url: `/reports`,
            params
        })
    }

    /*
    *新增报表
    *@接口分类  报表管理
    *@接口名称  新增报表
    *@接口地址  http://www.yapi.com/project/140/interface/api/38371
    *@创建人  user
    *@创建时间 2022-09-24 14:31:44
    *@更新时间  2022-09-24 14:31:44
    */
    create(data) {
        return request.post({
            url: `/reports`,
            data
        })
    }

    /*
    *编辑报表
    *@接口分类  报表管理
    *@接口名称  编辑报表
    *@接口地址  http://www.yapi.com/project/140/interface/api/38377
    *@创建人  user
    *@创建时间 2022-09-24 14:31:45
    *@更新时间  2022-09-24 14:31:45
    */
    update(data) {
        return request.put({
            url: `/reports`,
            data
        })
    }

    /*
    *删除报表
    *@接口分类  报表管理
    *@接口名称  删除报表
    *@接口地址  http://www.yapi.com/project/140/interface/api/38383
    *@创建人  user
    *@创建时间 2022-09-24 14:31:45
    *@更新时间  2022-09-24 14:31:45
    */
    del(data) {
        return request.delete({
            url: `/reports`,
            data
        })
    }

    /*
    *获取报表id查询报表详情
    *@接口分类  报表管理
    *@接口名称  获取报表id查询报表详情
    *@接口地址  http://www.yapi.com/project/140/interface/api/38389
    *@创建人  user
    *@创建时间 2022-09-24 14:31:45
    *@更新时间  2022-09-24 14:31:45
    *@param  id  路径参数   id
    */
    detail(id) {
        return request.get({
            url: `/reports/${id}`
        })
    }
}

const apiName = new ApiName

export default apiName


```

