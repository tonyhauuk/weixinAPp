function loadXML(xmlString) {
    var xmlDoc = null;
    //var DOMParser = require('xmldom').DOMParser;
    try {
        var domParser = new DOMParser();
        xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
    } catch (e) {
        console.log(e);
    }
    return xmlDoc;
}

module.exports.loadXML = loadXML;