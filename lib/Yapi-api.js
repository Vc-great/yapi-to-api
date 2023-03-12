const request = require('./request.js')

class Yapi {
    constructor({projectToken: token, yapiUrl}) {
        this.token = token
        this.url = yapiUrl
    }

    //获取项目基本信息
    getProjectBaseInfo() {
        return request.get({
            url: this.url + '/api/project/get',
            params: {
                token: this.token
            }
        })
    }

    //菜单列表
    getMenus(project_id) {
        return request.get({
            url: this.url + '/api/interface/list_menu',
            params: {
                project_id,
                token: this.token
            }
        })
    }

    /*
    获取某个分类下接口列表
    token	是		项目token
    catid	是		分类id
    page	否	1	当前页面
    limit	否	10	每页数量，默认为10，如果不想要分页数据，可将 limit 设置为比较大的数字，比如 1000
    * */
    getList_cat() {
        return request.get({
            url: this.url + '/api/interface/list_cat',
            params: {
                token: this.token,
                page: 1,
                limit: 1000
            }
        })
    }

    // 接口详情
    getApiDetail(id) {
        return request.get({
            url: this.url + '/api/interface/get',
            params: {
                id,
                token: this.token,
            }
        })
    }

}


module.exports = Yapi
