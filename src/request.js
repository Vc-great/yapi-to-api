const axios = require('axios')

class Http {
    constructor() {
        this.baseURL = '/'
        this.timeout = 60000
        this.token = ''
    }

    setInterceptor(instance) {
        instance.interceptors.request.use(async config => {
            const token = ''
            config.headers['Authorization'] = token || 'Bearer'
            return config
        }, error => error)

        instance.interceptors.response.use(res => {
            const isCode = res.data?.code >= 200 && res.data?.code < 300
            const isDownload = !!res.headers['content-disposition']
            const isHttpStatus = res.status >= 200 && res.status < 300

            if (isCode || isDownload || isHttpStatus) {
                return [undefined, res.data]
            } else {
                return [res.data, undefined]
            }
        }, (error) => {
            return [error, undefined]
        })
    }

    mergeOptions(options) {
        return {
            baseURL: this.baseURL,
            timeout: this.timeout,
            ...options
        }
    }

    request(options) {
        const instance = axios.create()
        const opts = this.mergeOptions(options)
        this.setInterceptor(instance)
        return instance(opts)
    }

    get(config = {}) {
        return this.request({
            method: 'get',
            ...config
        })
    }

    post(config = {}) {
        return this.request({
            method: 'post',
            ...config
        })
    }

    put(config = {}) {
        return this.request({
            method: 'put',
            ...config
        })
    }

    del(config = {}) {
        return this.request({
            method: 'DELETE',
            ...config
        })
    }

    patch(config = {}) {
        return this.request({
            method: 'PATCH',
            ...config
        })
    }
}

module.exports = new Http()
