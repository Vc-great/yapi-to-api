# yapi-to-api

根据Yapi提供的接口文档，生成请求js请求、ts请求、ts声明、json schema。

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
//全局安装,不侵入项目
npm i yapi-to -g
//验证 
yapi -v
```

使用
```js
//进⼊项⽬根⽬录下
cd project

//⽣成配置⽂件,自动将.yapi文件夹添加到.gitignore
yapi init

//在.yapi/yapi.config.js中填写yapi配置
module.exports = {
    yapiUrl: 'http://yapi.xxxx.com:8080', // example: www.baidu.com
    typeResponseArray: false, //返回值ts类型是否为数组 false: Promise<response> true: [object,Promise<response>]
    jsonSchema: true, //是否生成jsonSchema
    projects: [
        {
            title: '', //项目名称,用于生成目录
            token: '' //项目token
        }
    ]
}

//生成api
yapi i  
// or
yapi install
```
## 生成目录结构
```bazaar
.
├── .gitignore
└── .yapi
    ├── js
    │   └── 宠物
    │       ├── 公共分类.js
    │       └── 宠物店.js
    ├── jsonSchema
    │   └── 宠物
    │       ├── 公共分类.js
    │       └── 宠物店.js
    ├── ts
    │   └── 宠物
    │       ├── 公共分类.ts
    │       ├── 公共分类Types.ts
    │       ├── 宠物店.ts
    │       └── 宠物店Types.ts
    └── yapi.config.js

```

## ts声明
```ts
 //新建宠物信息
export interface CreateResponse {
    code: number;
    data: {
        /**
         * 宠物ID编号
         */
        id: number;
        category: {
            /**
             * 分组ID编号
             */
            id?: number;
            /**
             * 分组名称
             */
            name?: string;
            [k: string]: unknown;
        };
        /**
         * 名称
         */
        name: string;
        /**
         * 照片URL
         */
        photoUrls: string[];
        /**
         * 标签
         */
        tags: {
            /**
             * 标签ID编号
             */
            id?: number;
            /**
             * 标签名称
             */
            name?: string;
            [k: string]: unknown;
        }[];
        /**
         * 宠物销售状态
         */
        status: "available" | "pending" | "sold";
        [k: string]: unknown;
    };
    [k: string]: unknown;
}
```

## 生成tsApi
```ts
import type {
    PetidResponse,
    DetailResponse,
    CreateDataRequest,
    CreateResponse,
    UpdateDataRequest,
    UpdateResponse
} from './types'
import request from '@/api/request'
/*
 *@分类名称 宠物店.
 *@分类描述 undefined.
 *@创建时间 2022-09-16 21:55:39.
 *@更新时间 2022-09-16 21:55:39.
 */
class ApiName {
    /*
     *删除宠物信息
     *@接口分类  宠物店
     *@接口名称  删除宠物信息
     *@接口地址  http://yapi.xxxx.com:8080/project/167/interface/api/37861
     *@创建人  user
     *@创建时间 2022-09-16 21:55:39
     *@更新时间  2022-09-16 21:55:39
     */
    petId(petId,data): Promise<PetidResponse> {
        return request.delete({
            url: `/pet/${petId}`,
            data
        })
    }

    /*
     *查询宠物详情
     *@接口分类  宠物店
     *@接口名称  查询宠物详情
     *@接口地址  http://yapi.xxxx.com:8080/project/167/interface/api/37867
     *@创建人  user
     *@创建时间 2022-09-16 21:55:40
     *@更新时间  2022-09-20 17:16:39
     */
    detail(petId): Promise<DetailResponse> {
        return request.get({
            url: `/pet/${petId}`
        })
    }

    /*
     *新建宠物信息
     *@接口分类  宠物店
     *@接口名称  新建宠物信息
     *@接口地址  http://yapi.xxxx.com:8080/project/167/interface/api/37873
     *@创建人  user
     *@创建时间 2022-09-16 21:55:40
     *@更新时间  2022-09-16 21:55:40
     */
    create(data: CreateDataRequest): Promise<CreateResponse> {
        return request.post({
            url: `/pet`,
            data
        })
    }

    /*
     *修改宠物信息
     *@接口分类  宠物店
     *@接口名称  修改宠物信息
     *@接口地址  http://yapi.xxxx.com:8080/project/167/interface/api/37879
     *@创建人  user
     *@创建时间 2022-09-16 21:55:40
     *@更新时间  2022-09-16 21:55:40
     */
    update(data: UpdateDataRequest): Promise<UpdateResponse> {
        return request.put({
            url: `/pet`,
            data
        })
    }
}
const apiName = new ApiName()

export { apiName }
```


## 生成jsApi

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

## 生成json schema
```js
const jsonSchema = {
    "CreateResponse": {
        "type": "object",
        "properties": {
            "code": {
                "type": "integer",
                "minimum": 0,
                "maximum": 0
            },
            "data": {
                "required": [
                    "name",
                    "photoUrls",
                    "id",
                    "category",
                    "tags",
                    "status"
                ],
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64",
                        "minimum": 1,
                        "maximum": 5000,
                        "description": "宠物ID编号"
                    },
                    "category": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "integer",
                                "format": "int64",
                                "minimum": 1,
                                "description": "分组ID编号"
                            },
                            "name": {
                                "type": "string",
                                "description": "分组名称"
                            }
                        },
                        "xml": {
                            "name": "Category"
                        },
                        "x-apifox-orders": [
                            "id",
                            "name"
                        ],
                        "x-apifox-ignore-properties": [],
                        "x-apifox-folder": "宠物店",
                        "_null_": "#/components/schemas/Category"
                    },
                    "name": {
                        "type": "string",
                        "example": "doggie",
                        "description": "名称"
                    },
                    "photoUrls": {
                        "type": "array",
                        "xml": {
                            "name": "photoUrl",
                            "wrapped": true
                        },
                        "items": {
                            "type": "string"
                        },
                        "description": "照片URL"
                    },
                    "tags": {
                        "type": "array",
                        "xml": {
                            "name": "tag",
                            "wrapped": true
                        },
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "integer",
                                    "format": "int64",
                                    "minimum": 1,
                                    "description": "标签ID编号"
                                },
                                "name": {
                                    "type": "string",
                                    "description": "标签名称"
                                }
                            },
                            "xml": {
                                "name": "Tag"
                            },
                            "x-apifox-orders": [
                                "id",
                                "name"
                            ],
                            "x-apifox-ignore-properties": [],
                            "x-apifox-folder": "宠物店",
                            "_null_": "#/components/schemas/Tag"
                        },
                        "description": "标签"
                    },
                    "status": {
                        "type": "string",
                        "description": "宠物销售状态",
                        "enum": [
                            "available",
                            "pending",
                            "sold"
                        ]
                    }
                },
                "xml": {
                    "name": "Pet"
                },
                "x-apifox-orders": [
                    "id",
                    "category",
                    "name",
                    "photoUrls",
                    "tags",
                    "status"
                ],
                "x-apifox-ignore-properties": [],
                "x-apifox-folder": "宠物店",
                "_null_": "#/components/schemas/Pet"
            }
        },
        "required": [
            "code",
            "data"
        ],
        "x-apifox-orders": [
            "code",
            "data"
        ],
        "x-apifox-ignore-properties": [],
        "title": "CreateResponse"
    }
}
```

