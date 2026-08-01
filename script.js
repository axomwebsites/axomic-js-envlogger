function var3() {
    document.getElementById('var2').click();
}

function var4(var11) {
    const var12 = var11.target.files[0];
    if (!var12) return;
    
    if (var12.name.endsWith('.zip')) {
        var13(var12);
    } else {
        const var14 = new FileReader();
        var14.onload = function(var15) {
            document.getElementById('var1').value = var15.target.result;
        };
        var14.readAsText(var12);
    }
}

function var13(var16) {
    const var17 = new JSZip();
    var17.loadAsync(var16).then(function(var18) {
        let var19 = '';
        var18.forEach(function(var20, var21) {
            if (var21.dir) return;
            if (var20.endsWith('.js') || var20.endsWith('.txt')) {
                var21.async('string').then(function(var22) {
                    var19 += '// File: ' + var20 + '\n' + var22 + '\n\n';
                    document.getElementById('var1').value = var19;
                });
            }
        });
    });
}

function var5() {
    const var23 = document.getElementById('var1').value;
    if (!var23.trim()) {
        alert('Please input code first');
        return;
    }
    
    let var24 = var23;
    var24 = var25(var24);
    var24 = var26(var24);
    var24 = var27(var24);
    var24 = var28(var24);
    var24 = var29(var24);
    var24 = var30(var24);
    var24 = var31(var24);
    var24 = var32(var24);
    var24 = var33(var24);
    var24 = var34(var24);
    
    document.getElementById('var6').value = var24;
}

function var25(var35) {
    return var35.replace(/\\u([0-9a-fA-F]{4})/g, function(var36, var37) {
        return String.fromCharCode(parseInt(var37, 16));
    });
}

function var26(var38) {
    return var38.replace(/\\x([0-9a-fA-F]{2})/g, function(var39, var40) {
        return String.fromCharCode(parseInt(var40, 16));
    });
}

function var27(var41) {
    return var41.replace(/["']([a-zA-Z0-9+/=]{20,})["']/g, function(var42, var43) {
        try {
            const var44 = atob(var43);
            if (/^[\x20-\x7E]+$/.test(var44)) {
                return '"' + var44 + '"';
            }
        } catch (var45) {}
        return var42;
    });
}

function var28(var46) {
    var46 = var46.replace(/\b(true|false|null|undefined)\b/g, function(var47) {
        return var47;
    });
    var46 = var46.replace(/==/g, '===');
    var46 = var46.replace(/!=/g, '!==');
    return var46;
}

function var29(var48) {
    const var49 = {};
    let var50 = 0;
    return var48.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, function(var51, var52) {
        if (!var49[var52]) {
            var50++;
            var49[var52] = 'var' + var50;
        }
        return 'var ' + var49[var52] + ' =';
    }).replace(new RegExp('\\b(' + Object.keys(var49).join('|') + ')\\b', 'g'), function(var53) {
        return var49[var53] || var53;
    });
}

function var30(var54) {
    let var55 = 0;
    let var56 = '';
    for (let var57 = 0; var57 < var54.length; var57++) {
        const var58 = var54[var57];
        if (var58 === '{') {
            var55++;
            var56 += '\n' + '  '.repeat(var55) + '{';
        } else if (var58 === '}') {
            var55--;
            var56 += '\n' + '  '.repeat(var55) + '}';
        } else if (var58 === ';') {
            var56 += ';\n' + '  '.repeat(var55);
        } else {
            var56 += var58;
        }
    }
    return var56;
}

function var31(var59) {
    var59 = var59.replace(/if\s*\(\s*true\s*\)/g, 'if (true)');
    var59 = var59.replace(/if\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    var59 = var59.replace(/while\s*\(\s*false\s*\)\s*{[^}]*}/g, '');
    return var59;
}

function var32(var60) {
    return var60.replace(/\[\s*(['"])(.*?)\1\s*\]/g, function(var61, var62, var63) {
        return '.' + var63;
    });
}

function var33(var64) {
    var64 = var64.replace(/String\.fromCharCode\((\d+(?:,\d+)*)\)/g, function(var65, var66) {
        const var67 = var66.split(',').map(Number);
        return '"' + String.fromCharCode(...var67) + '"';
    });
    return var64;
}

function var34(var68) {
    var68 = var68.replace(/\+\s*['"]/g, '+ "');
    var68 = var68.replace(/"\s*\+/g, '" + ');
    var68 = var68.replace(/['"][\s\n]*\+[\s\n]*['"]/g, '');
    return var68;
}

function var7() {
    const var69 = document.getElementById('var6');
    var69.select();
    document.execCommand('copy');
    alert('Copied to clipboard');
}

function var8() {
    const var70 = document.getElementById('var9');
    var70.style.display = var70.style.display === 'none' ? 'inline-block' : 'none';
}

function var10(var71) {
    const var72 = document.getElementById('var6').value;
    if (!var72.trim()) {
        alert('No output to download');
        return;
    }
    
    const var73 = new Blob([var72], { type: 'text/plain' });
    const var74 = URL.createObjectURL(var73);
    const var75 = document.createElement('a');
    var75.href = var74;
    var75.download = 'deobfuscated.' + var71;
    document.body.appendChild(var75);
    var75.click();
    document.body.removeChild(var75);
    URL.revokeObjectURL(var74);
    
    document.getElementById('var9').style.display = 'none';
  }
