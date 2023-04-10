import babel from '@rollup/plugin-babel'
//import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const { cleandir } = require('rollup-plugin-cleandir')
const removeShebang = (options = {}) => ({
    name: 'rollup-plugin-remove-shebang',
    transform: (code, id) => {
        const includes = options.include || ['node_modules']
        if (includes.some(include => id.includes(include))) {
            return code.replace(/[\s\n]*#!.*[\s\n]*/, '')
        }
        return null
    }
})
export default {
    input: 'bin/main.js',
    output: {
        file: 'dist/common.js',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
        exports: 'default'
    },
    plugins: [
        removeShebang({ include: ['/bin/main.js'] }),
        commonjs({
            ignoreDynamicRequires: true
        }),
        resolve(),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled'
        }),
        json(),
        terser(),
        cleandir('./dist')
        //     typescript(),
    ]
}

/*{
                dynamicRequireTargets: [
                    'lib/dynamically.js'
                ],
      ignoreDynamicRequires:true
}*/
