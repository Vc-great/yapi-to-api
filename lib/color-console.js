const chalk = require('chalk')
const dayjs = require('dayjs')
const _ = require('lodash')
const STATES = {
    error: 'red',
    warn: 'yellow',
    success: 'green'
}

const time = function () {
    return '[' + dayjs().format('HH:mm:ss') + ']'
}

const logs = _.reduce(
    _.keys(STATES),
    (result, key) => {
        result[key] = function (log) {
            const color = STATES[key]
            const type = `[${key.toUpperCase()}]`
            console.log(`${time()} ${chalk[color](type)} ${log}`)
        }
        return result
    },
    {}
)

module.exports = {
    ...logs
}
