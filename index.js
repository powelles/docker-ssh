#!/usr/bin/env node

(async () => {
    const chalk = require('chalk')
    const util = require('util')
    const exec = util.promisify(require('child_process').exec)
    const { stdout, stderr } = await exec('docker ps')
    const err = e =>console.log(chalk.red.bold(e))

    if (stderr) {
        err(`Error executing docker ps: ${stderr}`)
        return
    }

    const names = stdout
        .split("\n")
        .slice(1)
        .map(l=>l.split(' ').slice(-1).pop())
        .filter(n=>!!n)

    if (names.length === 0) {
        err('There are no running docker containers')
        return
    }

    const prompts = require('prompts')

    const resContainer = await prompts({
        type: 'select',
        name: 'container',
        message: 'Pick a docker container',
        choices: names.map(n=>({title:n, value: n})),
        initial: 0,
    })

    const container = resContainer.container

    if (!container) {
        err('No container selected')
        return
    }

    const resShell = await prompts({
        type: 'select',
        name: 'shell',
        message: 'Pick shell',
        choices: [
            { title:'/bin/bash', value:'/bin/bash' },
            { title:'/bin/sh', value:'/bin/sh' },
        ],
        initial: 0,
    })

    const shell = resShell.shell

    if (!shell) {
        err('No shell selected')
        return
    }

    const spawn = require('child_process').spawn

    const ssh = spawn('docker', ['exec', '-it', container, shell], { stdio: 'inherit' })
})()