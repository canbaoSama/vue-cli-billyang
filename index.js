#!/usr/bin/env node

import fs from 'fs'
import { program } from 'commander'
import clone from 'git-clone'
import handlebars from 'handlebars'
import inquirer from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'
import symbols from 'log-symbols'

const templateMap = {
    'vue-template': 'https://github.com/canbaoSama/web-template.git',
    'uni-app-template': 'https://github.com/canbaoSama/uni-app-template.git'
}

program.version('1.0.0', '-v, --version')
    .command('vue-temp <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
                    type: 'list',  // 选择列表类型
                    name: 'template',  // 存储用户选择结果的属性名
                    message: '请选择创建模板',  // 问题提示信息
                    choices: ['uni-app-template', 'vue-template']  // 可选项数组 
                },
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('正在下载模板...');
                spinner.start();
                clone(templateMap[answers.template], name, {clone: true}, (err) => {
                    if(err){
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    }else{
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if(fs.existsSync(fileName)){
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
