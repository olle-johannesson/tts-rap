const path = require("path");
const {filesNotToCache, rootDir, swName, supportedAssets} = require("./variables");
const fs = require("fs").promises;

 function getTargetServiceWorkerPath(config) {
    return path.join(rootDir, config.sourceDir, swName)
}

function removeFromString(remove) {
    return (from) => from.replace(remove, '')
}

function shouldInclude(fileName) {
    return supportedAssets
        .map(a => new RegExp(`\.${a}$`))
        .some(type => type.test(fileName))
}

function shouldExclude(fileName) {
    return !filesNotToCache.includes(path.basename(fileName))
}

function keepOnlyKnownAssetTypes(fileNames) {
    return fileNames.filter(shouldInclude)
}

function removeFilenamesThatShouldNotBeCached(fileNames) {
    return fileNames.filter(shouldExclude)
}

// https://stackoverflow.com/a/45130990/17519505
async function getFiles(dir, nameTransform) {
    const dirents = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res, nameTransform) : nameTransform(res);
    }))

    return Array
        .prototype
        .concat(...files)
}

module.exports = {
    getTargetServiceWorkerPath,
    removeFromString,
    shouldInclude,
    keepOnlyKnownAssetTypes,
    shouldExclude,
    removeFilenamesThatShouldNotBeCached,
    getFiles
}