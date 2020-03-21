function generate(lambdaDefinitions) {
    const lines = [];
    lines.push('mkdir bin');
    lines.push('');

    lambdaDefinitions.forEach(({ localRelativePath }) => lines.push(`go build -o bin${localRelativePath} ./functions${localRelativePath}`))

    return lines;
}

module.exports = generate;