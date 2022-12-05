const path = require("path")

// yeah, lets skip html for now...
module.exports.supportedAssets = ['js',/*'html',*/ 'css','png','jpg','gif','svg','eot','ttf','woff', 'mp3', 'mp4', 'wav']

module.exports.filesNotToCache = ['sw.js', 'serviceWorker.js', 'service-worker.js']

module.exports.swName = `service-worker.js`

module.exports.templateName = 'sw.template'

module.exports.linkName = 'link.template'

module.exports.rootDir = path.join(__dirname, '..')

module.exports.templatePath = path.join(__dirname, this.templateName)

module.exports.linkPath = path.join(__dirname, this.linkName)
