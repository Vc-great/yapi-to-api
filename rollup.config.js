import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input:'src/main.js',
    output:{
        file:'dist/bundle.cjs.js',//输出文件的路径和名称
        format:'cjs',//五种输出格式：amd/es6/iife/umd/cjs
        name:'bundleName'//当format为iife和umd时必须提供，将作为全局变量挂在window下
    },
    plugins:[
               babel({exclude:"node_modules/**"}),
        typescript(),
        terser(),
        resolve(),
        commonjs(),
   ]
}


