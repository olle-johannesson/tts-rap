#!/usr/bin/env node
const fs = require('fs').promises
const path = require('path')
const defaults = require('lodash.defaults')
const template = require('lodash.template')
const  HTMLParser = require('node-html-parser')
const { rootDir, linkPath, swName, templatePath} = require("./variables");
const { removeFromString,
        removeFilenamesThatShouldNotBeCached,
        keepOnlyKnownAssetTypes,
        getTargetServiceWorkerPath,
        getFiles} = require("./functions");

//const chalk = require('chalk')
//const { packageDirectory } = require('pkg-dir')

async function readConfig() {
    //const rootDir = await packageDirectory()
    //const configFile = require(path.join(__dirname, '..', '.swrc.json'))
    const configFile = await fs
        .readFile(path.join(rootDir, '.swrc.json'))
        .catch(() => {})

    return defaults(configFile, {
        sourceDir: 'dist/',
        entryPoint: 'index.html'
    })
}

async function getCoreAssets(config) {
    const buildDir = path.join(rootDir, config.sourceDir)
    return getFiles(config.sourceDir, removeFromString(buildDir))
        .then(removeFilenamesThatShouldNotBeCached)
        .then(keepOnlyKnownAssetTypes)
        .then(files => files.map(file => `/${file}`))
        .then(files => files.sort())
}

async function resolveServiceWorkerTemplate(coreAssets) {
    const serviceWorkerTemplate = await fs.readFile(templatePath)
    return template(serviceWorkerTemplate)({ coreAssets: JSON.stringify(coreAssets) })
}

async function writeServiceWorkerToDisk(config, serviceWorker) {
    await fs.writeFile(getTargetServiceWorkerPath(config), serviceWorker)
}

async function makeServiceWorker(config) {
    const coreAssets = await getCoreAssets(config)
    // console.log(/*chalk.blue(*/'\nMaking service-worker to pre-cache')//)
    // console.log(coreAssets
    //     .replaceAll(/[\[\],]/g, '\n')
    //     .replaceAll('"', ''))
    //
    const serviceWorker = await resolveServiceWorkerTemplate(coreAssets)
    await writeServiceWorkerToDisk(config, serviceWorker)
    // const serviceWorkerTemplate = await fs.readFile(templatePath)
    // await fs.writeFile(getTargetServiceWorkerPath(config), template(serviceWorkerTemplate)({ coreAssets }))
    return config
}

async function resolveRegisteringScriptTemplate() {
    const registeringScriptTemplate = await fs.readFile(linkPath)
    return template(registeringScriptTemplate)({ swPath: swName })
}

async function addServiceWorkerScriptToEntrypoint(config, registeringScript) {
    const htmlFilePath = path.join(config.sourceDir, config.entryPoint)
    const htmlFile = await fs.readFile(htmlFilePath, 'utf-8')
    const document = HTMLParser.parse(htmlFile)

    document
        .querySelector('body')
        .insertAdjacentHTML('afterbegin', registeringScript)

    await fs.writeFile(htmlFilePath, document.outerHTML)
}

async function registerServiceWorker(config) {
    const script = await resolveRegisteringScriptTemplate()
    await addServiceWorkerScriptToEntrypoint(config, script)
    return config
}

readConfig()
    .then(makeServiceWorker)
    .then(registerServiceWorker)


