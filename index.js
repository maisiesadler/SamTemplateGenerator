const fs = require('fs');
const gobuild = require('./gobuild');
const govetgotest = require('./govetgotest');
const templateyml = require('./templateyml');

function extension(file) {
    const match = /\.(\w+)$/.exec(file)
    if (match != null) {
        return match[1]
    }

    return null
}

function isHttpMethod(dir) {
    return dir == 'get'
        || dir == 'post'
        || dir == 'put'
        || dir == 'delete';
}

const lambdaDefinitions = [];

function readLambdaDefinition(localPath, localRelativePath, relativePath, dir) {

    const directoryContents = fs.readdirSync(localPath);

    let hasGoFiles = false;
    directoryContents.forEach(file => {
        if (extension(file) == 'go') {
            hasGoFiles = true;
        }
    });

    if (!hasGoFiles) {
        console.log(`Http path does not have go files: ${localRelativePath}`);
    }

    const urlPath = relativePath
        .replace(/\/p_([\w]+)\//g, '/{$1}/')
        .replace(/\/$/, '');
    localRelativePath = localRelativePath.replace(/\/$/, '');

    return {
        localRelativePath, // for build scripts
        method: dir,
        urlPath,
        hasGoFiles,
    }
}

function traverseDirectory(localBasePath, relativePath) {
    const directoryContents = fs.readdirSync(localBasePath);

    directoryContents.forEach(file => {
        let localRelativePath = relativePath + file + '/';
        let localPath = localBasePath + file + '/';

        const stat = fs.statSync(localPath)
        if (stat.isDirectory()) {
            if (isHttpMethod(file)) {
                const definition = readLambdaDefinition(localPath, localRelativePath, relativePath, file)
                lambdaDefinitions.push(definition);
            } else {
                traverseDirectory(localPath, localRelativePath)
            }
        } else if (stat.isFile()) {
            console.log('Unexpected file', localPath, file)
        } else {
            console.error('unexpected file type')
        }
    });
}


module.exports = function (templatePath, localBasePath, outputDirectory) {
    if (localBasePath[localBasePath.length - 1] != '/') {
        localBasePath += '/';
    }
    
    const relativePath = '/';
    traverseDirectory(localBasePath, relativePath);

    const gobuild_sh = gobuild(lambdaDefinitions);
    const govetgotest_sh = govetgotest(lambdaDefinitions);
    const template_yml = templateyml(templatePath, lambdaDefinitions);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }

    fs.writeFileSync(`${outputDirectory}/gobuild.sh`, gobuild_sh.join('\n'));
    fs.writeFileSync(`${outputDirectory}/govet_gotest.sh`, govetgotest_sh.join('\n'));
    fs.writeFileSync(`${outputDirectory}/template.yml`, template_yml.join('\n'));
}
