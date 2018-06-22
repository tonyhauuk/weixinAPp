function loadXML(xmlString) {
    var xmlDoc = null
    var DOMParser = require('xmldom/dom-parser').DOMParser
    var domParser = new DOMParser()
    try {
        xmlDoc = domParser.parseFromString(xmlString, 'text/xml')
    } catch (e) {
        console.log('LoadXML error: ' + e)
    }
    return xmlDoc
}

module.exports.loadXML = loadXML