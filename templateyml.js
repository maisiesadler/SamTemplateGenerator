const fs = require('fs');

function readYmlTemplate(templatePath, template) {
    let fileContents = fs.readFileSync(`${templatePath}/${template}.yml`, 'utf8');
    return fileContents;
}

function replaceProperty(original, property, replacement) {
    const regexp = new RegExp(`{{${property}}}`)
    return original.replace(regexp, replacement);
}

function generate(templatePath, lambdaDefinitions) {
    const lines = [];
    const template = readYmlTemplate(templatePath, 'base');
    lines.push(template);

    let functionTemplate = readYmlTemplate(templatePath, 'function');
    lambdaDefinitions.forEach(definition => {
        const {
            localRelativePath,
            method,
            urlPath } = definition;

        let clean = localRelativePath
            .replace(/\//g, '') // replace all / with nothing
            .replace(/_/g, '') // replace all _ with nothing
            .replace(/[\{\}]/g, ''); // replace brackets with nothing

        const codeUri = /(.*)\/\w+$/g.exec(localRelativePath)[1]
        const handler = /(\/\w+)$/g.exec(localRelativePath)[1]

        let template = functionTemplate;
        if (definition.overrideTemplate) {
            template = readYmlTemplate(templatePath, definition.overrideTemplate)
        }
        template = replaceProperty(template, 'Name', clean);
        template = replaceProperty(template, 'CodeUri', codeUri);
        template = replaceProperty(template, 'Handler', handler);
        template = replaceProperty(template, 'Path', urlPath);
        template = replaceProperty(template, 'Method', method);

        lines.push(template);
    });

    return lines;
}

module.exports = generate;