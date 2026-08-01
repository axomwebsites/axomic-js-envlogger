function importfile() {
    document.getElementById('fileinput').click();
}

function handlefile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.name.endsWith('.zip')) {
        extractzip(file);
    } else {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('inputcode').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function extractzip(zipfile) {
    const zip = new JSZip();
    zip.loadAsync(zipfile).then(function(content) {
        let combinedcode = '';
        content.forEach(function(relativepath, zipentry) {
            if (zipentry.dir) return;
            if (relativepath.endsWith('.js') || relativepath.endsWith('.txt')) {
                zipentry.async('string').then(function(filecontent) {
                    combinedcode += '// File: ' + relativepath + '\n' + filecontent + '\n\n';
                    document.getElementById('inputcode').value = combinedcode;
                });
            }
        });
    });
}

function changetheme(theme) {
    document.body.className = theme;
}

function processcode() {
    const input = document.getElementById('inputcode').value;
    if (!input.trim()) {
        alert('Please input code first');
        return;
    }
    
    const starttime = performance.now();
    
    try {
        let output = input;
        
        output = decodeunicode(output);
        output = decodehex(output);
        output = decodebase64strings(output);
        output = resolvefromcharcode(output);
        output = unpackstringarray(output);
        output = simplifystaticexpressions(output);
        output = decoderot13(output);
        output = decodereversestrings(output);
        output = resolvexorstrings(output);
        
        output = detectandunpackheavypacking(output);
        output = removeantitamperingchecks(output);
        output = neutralizeproxytraps(output);
        output = resolvedynamicgeneration(output);
        output = extractvmbytecode(output);
        
        output = unflattencontrolflowadvanced(output);
        output = removedeadcode(output);
        output = normalizepropertyaccess(output);
        output = mergestringconcatenation(output);
        output = resolveevalcalls(output);
        
        let astparsed = false;
        try {
            const ast = acorn.parse(output, { ecmaVersion: 2020, allowReturnOutsideFunction: true });
            const transformedast = transformast(ast);
            output = generatecode(transformedast);
            astparsed = true;
        } catch(parseerror) {
            output = fallbackformat(output);
        }
        
        output = formatoutput(output);
        
        const endtime = performance.now();
        const processtime = Math.round(endtime - starttime);
        
        const header = '/*\ndeobfuscated/env logged by axomic-js-envlogger ( https://axomwebsites.github.io/axomic-js-envlogger/ ) \nprocessed in ' + processtime + ' ms\nOur Discord : https://discord.gg/Sps39CydcZ | Our Youtube : https://youtube.com/@axos0022\n*/\n\n';
        
        document.getElementById('outputcode').value = header + output;
    } catch (error) {
        const fallbackoutput = fallbackformat(input);
        const endtime = performance.now();
        const processtime = Math.round(endtime - starttime);
        const header = '/*\ndeobfuscated/env logged by axomic-js-envlogger ( https://axomwebsites.github.io/axomic-js-envlogger/ ) \nprocessed in ' + processtime + ' ms\nOur Discord : https://discord.gg/Sps39CydcZ | Our Youtube : https://youtube.com/@axos0022\n*/\n\n';
        document.getElementById('outputcode').value = header + fallbackoutput;
    }
}

function decodeunicode(code) {
    return code.replace(/\\u([0-9a-fA-F]{4})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

function decodehex(code) {
    return code.replace(/\\x([0-9a-fA-F]{2})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

function decodebase64strings(code) {
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

function resolvefromcharcode(code) {
    return code.replace(/String\.fromCharCode\((\d+(?:,\s*\d+)*)\)/g, function(match, nums) {
        const values = nums.split(',').map(function(n) { return parseInt(n.trim()); });
        return '"' + String.fromCharCode.apply(null, values) + '"';
    });
}

function unpackstringarray(code) {
    const stringarraypattern = /var\s+(\w+)\s*=\s*\[(["'][^"']*["'](?:,\s*["'][^"']*["'])*)\]/g;
    let match;
    while ((match = stringarraypattern.exec(code)) !== null) {
        const varname = match[1];
        const arraycontent = match[2];
        const strings = arraycontent.match(/["'][^"']*["']/g).map(function(s) {
            return s.slice(1, -1);
        });
        
        const accesspattern = new RegExp(varname + '\\[(\\d+)\\]', 'g');
        code = code.replace(accesspattern, function(m, index) {
            if (strings[parseInt(index)] !== undefined) {
                return '"' + strings[parseInt(index)] + '"';
            }
            return m;
        });
        
        code = code.replace(new RegExp('var\\s+' + varname + '\\s*=\\s*\\[[^\\]]*\\]'), '');
    }
    return code;
}

function simplifystaticexpressions(code) {
    code = code.replace(/(\d+)\s*\+\s*(\d+)/g, function(m, a, b) {
        return String(parseInt(a) + parseInt(b));
    });
    code = code.replace(/(\d+)\s*\-\s*(\d+)/g, function(m, a, b) {
        return String(parseInt(a) - parseInt(b));
    });
    code = code.replace(/(\d+)\s*\*\s*(\d+)/g, function(m, a, b) {
        return String(parseInt(a) * parseInt(b));
    });
    code = code.replace(/true\s*===\s*true/g, 'true');
    code = code.replace(/false\s*===\s*false/g, 'true');
    code = code.replace(/true\s*===\s*false/g, 'false');
    return code;
}

function decoderot13(code) {
    return code.replace(/["']([a-zA-Z]+)["']/g, function(match, str) {
        if (str.length > 3 && /^[a-zA-Z]+$/.test(str)) {
            const rotated = str.replace(/[a-zA-Z]/g, function(c) {
                const base = c <= 'Z' ? 65 : 97;
                return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
            });
            return '"' + rotated + '"';
        }
        return match;
    });
}

function decodereversestrings(code) {
    return code.replace(/["']([^"']+)["']\.split\(""\)\.reverse\(\)\.join\(""\)/g, function(match, str) {
        return '"' + str.split('').reverse().join('') + '"';
    });
}

function resolvexorstrings(code) {
    const xorpattern = /function\s*\w+\s*\(\s*\w+\s*,\s*\w+\s*\)\s*{[^}]*}/g;
    let match;
    while ((match = xorpattern.exec(code)) !== null) {
        const funcbody = match[0];
        if (funcbody.includes('^') && funcbody.includes('charCodeAt')) {
            code = code.replace(match[0], '');
        }
    }
    return code;
}

function detectandunpackheavypacking(code) {
    if (code.includes('webpackJsonp') || code.includes('__webpack_require__')) {
        code = code.replace(/\/\*!.*?\*\//g, '');
        code = code.replace(/webpackChunk\w+\s*=\s*\[\];/g, '');
    }
    if (code.includes('(function(') && code.includes('module,exports,__webpack_require__')) {
        code = code.replace(/^\s*\(function\([^)]*\)\s*{/, '');
        code = code.replace(/}\)\.call\([^)]*\);\s*$/, '');
    }
    return code;
}

function removeantitamperingchecks(code) {
    code = code.replace(/if\s*\(\s*window\s*\.\s*location\s*\.\s*hostname\s*!==\s*["'][^"']*["']\s*\)\s*{[^}]*}/g, '');
    code = code.replace(/debugger;/g, '');
    code = code.replace(/console\s*\.\s*log\s*\(\s*['"]debug['"]\s*\)/g, '');
    code = code.replace(/setInterval\s*\(\s*function\s*\(\s*\)\s*{\s*debugger\s*;?\s*}\s*,\s*\d+\s*\)/g, '');
    return code;
}

function neutralizeproxytraps(code) {
    code = code.replace(/new\s+Proxy\s*\(\s*[^,]+,\s*{[^}]*}\s*\)/g, function(match) {
        const objmatch = match.match(/new\s+Proxy\s*\(\s*([^,]+)/);
        if (objmatch) {
            return objmatch[1].trim();
        }
        return match;
    });
    return code;
}

function resolvedynamicgeneration(code) {
    code = code.replace(/new\s+Function\s*\(\s*["']([^"']+)["']\s*\)/g, function(match, body) {
        return '(function() { ' + body + ' })';
    });
    code = code.replace(/eval\s*\(\s*["']([^"']+)["']\s*\)/g, '$1');
    return code;
}

function extractvmbytecode(code) {
    const vmpattern = /var\s+\w+\s*=\s*\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g;
    let match;
    while ((match = vmpattern.exec(code)) !== null) {
        const arraydef = match[0];
        const numbers = arraydef.match(/\d+/g);
        if (numbers && numbers.length > 10) {
            const decoded = numbers.map(function(n) {
                return String.fromCharCode(parseInt(n));
            }).join('');
            if (/^[a-zA-Z0-9_{}()[\];,.\s]+$/.test(decoded)) {
                code = code.replace(arraydef, '"' + decoded + '"');
            }
        }
    }
    return code;
}

function transformast(astnode) {
    if (!astnode || typeof astnode !== 'object') return astnode;
    
    if (Array.isArray(astnode)) {
        return astnode.map(transformast);
    }
    
    const newnode = Object.assign({}, astnode);
    
    if (newnode.type === 'Literal' && typeof newnode.value === 'string') {
        newnode.value = decodeescapesequences(newnode.value);
    }
    
    if (newnode.type === 'BinaryExpression' && 
        newnode.operator === '+' &&
        newnode.left.type === 'Literal' &&
        newnode.right.type === 'Literal' &&
        typeof newnode.left.value === 'string' &&
        typeof newnode.right.value === 'string') {
        return {
            type: 'Literal',
            value: newnode.left.value + newnode.right.value,
            raw: '"' + (newnode.left.value + newnode.right.value) + '"'
        };
    }
    
    for (const key in newnode) {
        if (newnode.hasOwnProperty(key)) {
            newnode[key] = transformast(newnode[key]);
        }
    }
    
    return newnode;
}

function decodeescapesequences(str) {
    return str.replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\\r/g, '\r')
              .replace(/\\"/g, '"')
              .replace(/\\'/g, "'");
}

function generatecode(node) {
    if (!node) return '';
    
    switch (node.type) {
        case 'Program':
            return node.body.map(generatecode).join('\n');
        case 'ExpressionStatement':
            return generatecode(node.expression) + ';';
        case 'VariableDeclaration':
            return 'var ' + node.declarations.map(function(d) {
                return generatecode(d);
            }).join(', ') + ';';
        case 'VariableDeclarator':
            return generatecode(node.id) + ' = ' + generatecode(node.init);
        case 'Identifier':
            return node.name;
        case 'Literal':
            if (typeof node.value === 'string') {
                return '"' + node.value.replace(/"/g, '\\"') + '"';
            }
            return String(node.value);
        case 'BinaryExpression':
            return generatecode(node.left) + ' ' + node.operator + ' ' + generatecode(node.right);
        case 'CallExpression':
            return generatecode(node.callee) + '(' + node.arguments.map(generatecode).join(', ') + ')';
        case 'MemberExpression':
            if (node.computed) {
                return generatecode(node.object) + '[' + generatecode(node.property) + ']';
            }
            return generatecode(node.object) + '.' + generatecode(node.property);
        case 'BlockStatement':
            return '{\n' + node.body.map(generatecode).join('\n') + '\n}';
        case 'IfStatement':
            let result = 'if (' + generatecode(node.test) + ') ' + generatecode(node.consequent);
            if (node.alternate) {
                result += ' else ' + generatecode(node.alternate);
            }
            return result;
        case 'FunctionDeclaration':
            return 'function ' + generatecode(node.id) + '(' + 
                   node.params.map(generatecode).join(', ') + ') ' + 
                   generatecode(node.body);
        case 'ReturnStatement':
            return 'return' + (node.argument ? ' ' + generatecode(node.argument) : '') + ';';
        case 'AssignmentExpression':
            return generatecode(node.left) + ' ' + node.operator + ' ' + generatecode(node.right);
        case 'ArrayExpression':
            return '[' + node.elements.map(generatecode).join(', ') + ']';
        case 'ObjectExpression':
            return '{' + node.properties.map(function(p) {
                return generatecode(p.key) + ': ' + generatecode(p.value);
            }).join(', ') + '}';
        case 'UnaryExpression':
            return node.operator + generatecode(node.argument);
        case 'SequenceExpression':
            return node.expressions.map(generatecode).join(', ');
        default:
            return '';
    }
}

function unflattencontrolflowadvanced(code) {
    const switchpattern = /switch\s*\(\s*(\w+)\s*\)\s*{([^}]*(?:{[^}]*}[^}]*)*)}/g;
    let match;
    while ((match = switchpattern.exec(code)) !== null) {
        const statevar = match[1];
        const switchbody = match[2];
        
        const cases = switchbody.match(/case\s+(\d+):\s*([^}]+?)(?=case|default|})/g);
        if (cases) {
            let reconstructed = '';
            const casemap = {};
            cases.forEach(function(caseblock) {
                const casematch = caseblock.match(/case\s+(\d+):\s*([\s\S]*?)(?=\s*break|\s*case|\s*default|$)/);
                if (casematch) {
                    casemap[parseInt(casematch[1])] = casematch[2].trim();
                }
            });
            
            const sortedkeys = Object.keys(casemap).map(Number).sort(function(a, b) { return a - b; });
            sortedkeys.forEach(function(key) {
                reconstructed += casemap[key] + '\n';
            });
            
            code = code.replace(match[0], reconstructed);
        }
    }
    
    const whilepattern = /while\s*\(\s*true\s*\)\s*{([^}]*(?:{[^}]*}[^}]*)*)}/g;
    while ((match = whilepattern.exec(code)) !== null) {
        const loopbody = match[1];
        code = code.replace(match[0], loopbody);
    }
    
    return code;
}

function removedeadcode(code) {
    code = code.replace(/if\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    code = code.replace(/while\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    code = code.replace(/if\s*\(\s*true\s*\)\s*/g, '');
    code = code.replace(/\bundefined\b\s*===\s*\bundefined\b/g, 'true');
    return code;
}

function normalizepropertyaccess(code) {
    return code.replace(/\[\s*(['"])(\w+)\1\s*\]/g, function(match, quote, prop) {
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prop)) {
            return '.' + prop;
        }
        return match;
    });
}

function mergestringconcatenation(code) {
    code = code.replace(/"\s*\+\s*"/g, '');
    code = code.replace(/'\s*\+\s*'/g, '');
    code = code.replace(/"\s*\+\s*'/g, '"');
    code = code.replace(/'\s*\+\s*"/g, '"');
    return code;
}

function resolveevalcalls(code) {
    return code.replace(/eval\(["']([^"']+)["']\)/g, function(match, codecontent) {
        return codecontent;
    });
}

function fallbackformat(code) {
    let result = '';
    let currentline = '';
    let indentlevel = 0;
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        
        if (char === '{') {
            currentline += char;
            result += currentline.trim() + '\n';
            indentlevel++;
            currentline = '  '.repeat(indentlevel);
        } else if (char === '}') {
            if (currentline.trim()) {
                result += currentline.trim() + '\n';
            }
            indentlevel = Math.max(0, indentlevel - 1);
            currentline = '  '.repeat(indentlevel);
            currentline += char;
        } else if (char === ';') {
            currentline += char;
            result += currentline.trim() + '\n';
            currentline = '  '.repeat(indentlevel);
        } else if (char === '\n' || char === '\r') {
            if (currentline.trim()) {
                result += currentline.trim() + '\n';
            }
            currentline = '  '.repeat(indentlevel);
        } else {
            currentline += char;
        }
    }
    
    if (currentline.trim()) {
        result += currentline.trim();
    }
    
    return result;
}

function formatoutput(code) {
    let indent = 0;
    let result = '';
    const lines = code.split('\n');
    
    lines.forEach(function(line) {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        if (trimmed.startsWith('}')) {
            indent = Math.max(0, indent - 1);
        }
        
        result += '  '.repeat(indent) + trimmed + '\n';
        
        if (trimmed.endsWith('{')) {
            indent++;
        }
    });
    
    return result.trim();
}

function copycode() {
    const output = document.getElementById('outputcode');
    output.select();
    document.execCommand('copy');
    alert('Copied to clipboard');
}

function toggledownload() {
    const options = document.getElementById('downloadoptions');
    options.style.display = options.style.display === 'none' ? 'inline-block' : 'none';
}

function downloadfile(extension) {
    const content = document.getElementById('outputcode').value;
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
    
    document.getElementById('downloadoptions').style.display = 'none';
}
