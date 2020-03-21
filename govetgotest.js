function generate(lambdaDefinitions) {
    const lines = [];
    lambdaDefinitions.forEach(({ localRelativePath }) => lines.push(`go vet ./functions${localRelativePath}`));
    lines.push('');
    lambdaDefinitions.forEach(({ localRelativePath }) => lines.push(`go test ./functions${localRelativePath}`));

    return lines;
}

module.exports = generate;