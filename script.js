function importFile() {
    document.getElementById('fileInput').click();
}

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.name.endsWith('.zip')) {
        extractZip(file);
    } else {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('inputCode').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function extractZip(zipFile) {
    const zip = new JSZip();
    zip.loadAsync(zipFile).then(function(content) {
        let combinedCode = '';
        content.forEach(function(relativePath, zipEntry) {
            if (zipEntry.dir) return;
            if (relativePath.endsWith('.js') || relativePath.endsWith('.txt')) {
                zipEntry.async('string').then(function(fileContent) {
                    combinedCode += '// File: ' + relativePath + '\n' + fileContent + '\n\n';
                    document.getElementById('inputCode').value = combinedCode;
                });
            }
        });
    });
}

function processCode() {
    const input = document.getElementById('inputCode').value;
    if (!input.trim()) {
        alert('Please input code first');
        return;
    }
    
    let output = input;
    output = decodeUnicode(output);
    output = decodeHex(output);
    output = decodeBase64(output);
    output = simplifyExpressions(output);
    output = renameVariables(output);
    output = formatCode(output);
    output = removeDeadCode(output);
    output = unpackArrays(output);
    output = resolveStrings(output);
    output = normalizeControlFlow(output);
    
    document.getElementById('outputCode').value = output;
}

function decodeUnicode(code) {
    return code.replace(/\\u([0-9a-fA-F]{4})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

function decodeHex(code) {
    return code.replace(/\\x([0-9a-fA-F]{2})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

function decodeBase64(code) {
    return code.replace(/["']([a-zA-Z0-9+/=]{20,})["']/g, function(match, str) {
        try {
            const decoded = atob(str);
            if (/^[\x20-\x7E]+$/.test(decoded)) {
                return '"' + decoded + '"';
            }
        } catch (e) {}
        return match;
    });
}

function simplifyExpressions(code) {
    code = code.replace(/\b(true|false|null|undefined)\b/g, function(val) {
        return val;
    });
    code = code.replace(/==/g, '===');
    code = code.replace(/!=/g, '!==');
    return code;
}

function renameVariables(code) {
    const varMap = {};
    let counter = 0;
    return code.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, function(match, name) {
        if (!varMap[name]) {
            counter++;
            varMap[name] = 'v' + counter;
        }
        return 'var ' + varMap[name] + ' =';
    }).replace(new RegExp('\\b(' + Object.keys(varMap).join('|') + ')\\b', 'g'), function(name) {
        return varMap[name] || name;
    });
}

function formatCode(code) {
    let indent = 0;
    let result = '';
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        if (char === '{') {
            indent++;
            result += '\n' + '  '.repeat(indent) + '{';
        } else if (char === '}') {
            indent--;
            result += '\n' + '  '.repeat(indent) + '}';
        } else if (char === ';') {
            result += ';\n' + '  '.repeat(indent);
        } else {
            result += char;
        }
    }
    return result;
}

function removeDeadCode(code) {
    code = code.replace(/if\s*\(\s*true\s*\)/g, 'if (true)');
    code = code.replace(/if\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    code = code.replace(/while\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    return code;
}

function unpackArrays(code) {
    return code.replace(/\[\s*(['"])(.*?)\1\s*\]/g, function(match, quote, prop) {
        return '.' + prop;
    });
}

function resolveStrings(code) {
    code = code.replace(/String\.fromCharCode\((\d+(?:,\d+)*)\)/g, function(match, nums) {
        const values = nums.split(',').map(Number);
        return '"' + String.fromCharCode(...values) + '"';
    });
    return code;
}

function normalizeControlFlow(code) {
    code = code.replace(/\+\s*['"]/g, '+ "');
    code = code.replace(/"\s*\+/g, '" + ');
    code = code.replace(/['"][\s\n]*\+[\s\n]*['"]/g, '');
    return code;
}

function copyCode() {
    const output = document.getElementById('outputCode');
    output.select();
    document.execCommand('copy');
    alert('Copied to clipboard');
}

function toggleDownload() {
    const options = document.getElementById('downloadOptions');
    options.style.display = options.style.display === 'none' ? 'inline-block' : 'none';
}

function downloadFile(extension) {
    const content = document.getElementById('outputCode').value;
    if (!content.trim()) {
        alert('No output to download');
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deobfuscated.' + extension;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    document.getElementById('downloadOptions').style.display = 'none';
}
