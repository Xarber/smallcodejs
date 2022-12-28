function SmallCode(code, flags) {
    flags = flags.toLowerCase().split(";");
    this.flags = {};
    for (var flag of flags) {
        if (flag === "runreplace") this.flags.runReplace = true;
    };
    if (!this.flags.runReplace) {} else {
        if (code.indexOf('http://') === 0 || code.indexOf('https://') === 0) return false; //CODE IS A LINK, IT CAN NOT BE EXECUTED SYNCRONOUSLY
        if (typeof modules != "object") modules = {};
        this.SCmethod = flags;
        this.disassembly = function(SCode) {
            var result = [];
            var lines = (SCode.split("\n")).length;
            for (let i = 0;i != lines;i++) {
                var codePartO = SCode.split("\n")[i];
                var codePart = codePartO.toLowerCase().replace(/^\s+|\s+$/gm,'');
                var splitted = {type: "", content: codePart, fullContent: codePartO, jscontent: ""};
                if (codePart == 'parsing:()[') SC.allowParsing = true;
                if (codePart == ']//,') SC.allowParsing = false;
                if (SC.allowParsing === true) {
                    if (codePart.indexOf('//') === 0) splitted.type = "comment";
                    if (codePart.indexOf('define') === 0) splitted.type = "define";
                    if (codePart.indexOf('import') === 0) splitted.type = "import";
                    if (codePart.indexOf('method') === 0) splitted.type = "method";
                    if (codePart.indexOf('get') === 0) splitted.type = "get";
                    if (codePart.indexOf('print') === 0) splitted.type = "print";
                    if (codePart.indexOf('if') === 0) splitted.type = "ifStmt";
                    if (codePart.indexOf('->') === 0) splitted.type = "ifStmtCode";
                    if (codePart.indexOf('or') === 0) splitted.type = "elseIfStmt";
                    if (codePart.indexOf('but') === 0) splitted.type = "elseStmt";
                    if (codePart.indexOf('catch') === 0) splitted.type = "catch";
                    if (codePart.indexOf('for each') === 0) splitted.type = "forLoop";
                    if (codePart.indexOf('break') === 0) splitted.type = "endForLoop";
                };
                if (splitted.type.length > 0 && SC.allowParsing) result.push(splitted);
            };
            return result;
        };
        this.compile = function(disassembled) {
            //This converts SC into JS and then runs it.
            disassembled = disassembled ?? SC.disassembled ?? [];
            var converted = [];
            for (var cmd of disassembled) {
                //define a string 'ciao mamma'
                if (cmd.content.substring(cmd.content.length - 1, cmd.content.length) === ";") cmd.content = cmd.content.substring(0, cmd.content.length - 1);
                if (cmd.type === "define") {
                    var defineBase = 'define '+cmd.content.split(' ')[1];
                    if (cmd.content.indexOf(defineBase+' string') === 0) {
                        cmd.jscontent = defineBase.replace('define ', 'window["')+"\"] ="+cmd.content.replace(' string', '').replace(defineBase, '');
                    } else if (cmd.content.indexOf(defineBase+' array') === 0) {
                        cmd.jscontent = defineBase.replace('define ', 'window["')+"\"] ="+cmd.content.replace('array |', '{').replaceAll(' of ', ': ').replaceAll(' &&', ',').replace(defineBase, '');
                        cmd.jscontent = (cmd.jscontent.substring(0, cmd.jscontent.length - 1)) + "}";
                    } else if (cmd.content.indexOf(defineBase+' var') === 0) {
                        cmd.jscontent = defineBase.replace('define ', 'window["')+"\"] = window['"+cmd.content.replace(defineBase+' var ', '')+"'];";
                    }
                };
                if (cmd.type === "import") {
                    //import po from module module.input.pogiolo
                    var newVarName = cmd.content.split(' ')[1];
                    var modulename = cmd.content.replace('import '+newVarName+' from module module.input.', '');
                    cmd.jscontent = cmd.content.replace('import ', 'window["').replace(' from module module.input.', '"] = ' + JSON.stringify(SC.modules[modulename])).replace(modulename, '');
                };
                if (cmd.type === "method") {
                    var methodTmp = cmd.content.replace('method ', '').replaceAll('.', '_');
                    var methodName = methodTmp.substr(0, methodTmp.indexOf('('));
                    var methodArgs = methodTmp.replace(methodName, '');
                    methodArgs = methodArgs.substr(1, methodArgs.lastIndexOf(')') - 1);
                    var methodArgsSplitted = methodArgs.split(',');
                    var newSplitted = [];
                    methodArgsSplitted.forEach(arg => {
                        newSplitted.push(arg.replace(/^\s+|\s+$/gm,''));
                    });
                    methodArgsSplitted = newSplitted;
                    cmd.jscontent = SC.methods[methodName](methodArgsSplitted);
                };
                if (cmd.type === "get") {
    
                };
                if (cmd.type === "print") {
                    var defineBase = 'print '+cmd.content.split(' ')[1];
                    if (cmd.content.indexOf('print string ') === 0) {
                        cmd.jscontent = cmd.content.replace('print string ', 'document.open();document.write('+cmd.content.replace('print string ', '')+');document.close();');
                        cmd.jscontent = cmd.jscontent.substring(0, ('document.open();document.write('+cmd.content.replace('print string ', '')+');document.close();').length);
                    } else if (cmd.content.indexOf('print var ') === 0) {
                        cmd.jscontent = cmd.content.replace('print var ', 'document.open();document.write(window["'+cmd.content.replace('print var ', '')+'"]);document.close();');
                        cmd.jscontent = cmd.jscontent.substring(0, ('document.open();document.write(window["'+cmd.content.replace('print var ', '')+'"]);document.close();').length);
                    }
                };
                if (cmd.type === "ifStmt") {
    
                };
                if (cmd.type === "ifStmtCode") {
    
                };
                if (cmd.type === "elseIfStmt") {
    
                };
                if (cmd.type === "elseStmt") {
    
                };
                if (cmd.type === "catch") {
    
                };
                if (cmd.type === "forLoop") {
    
                };
                if (cmd.type === "endForLoop") {
    
                };
                if (typeof cmd.jscontent !== "undefined") cmd.jscontent = cmd.jscontent.replaceAll("''", "'");
                if (SC.SCmethod.indexOf('autoExec;') != -1) eval(cmd.jscontent);
                converted.push(cmd);
            };
            return converted;
        };
        this.methods = {
            array_print: function(array) {
                if (Array.isArray(array)) array = array[0];
                array = (typeof array === "object") ? array : window[array];
                array = array ?? false;
                if (!array) return false;
                return "document.open();document.write('"+JSON.stringify(array)+"');document.close();";
            },
            array_push: function(array, key, value) {
                if (Array.isArray(array)) {
                    key = array[1];
                    value = array[2];
                    array = array[0];
                };
                var arrayName = false;
                if (typeof array === "string") arrayName = array;
                array = (!typeof array === "object") ? array : window[array];
                array = array ?? false;
                if (!array) return false;
                if (key.charAt(0) === "'") key = key.replace("'", '');
                if (key.charAt(0) === '"') key = key.replace('"', '');
                if (key.charAt(key.length - 1) === "'") key = key.substr(0, key.length - 1);
                if (key.charAt(key.length - 1) === '"') key = key.substr(0, key.length - 1);
                if (value.charAt(0) === "'") value = value.replace("'", '');
                if (value.charAt(0) === '"') value = value.replace('"', '');
                if (value.charAt(value.length - 1) === "'") value = value.substr(0, value.length - 1);
                if (value.charAt(value.length - 1) === '"') value = value.substr(0, value.length - 1);
                array[key] = value;
                return "window["+arrayName+"] = JSON.parse('"+JSON.stringify(array)+"');";
            },
            array_getValue: function(array, key) {
                if (Array.isArray(array)) {
                    key = array[1];
                    array = array[0];
                }
                array = (!typeof array === "object") ? array : window[array];
                array = array ?? false;
                if (!array) return false;
                if (key.charAt(0) === "'") key = key.replace("'", '');
                if (key.charAt(0) === '"') key = key.replace('"', '');
                if (key.charAt(key.length - 1) === "'") key = key.substr(0, key.length - 1);
                if (key.charAt(key.length - 1) === '"') key = key.substr(0, key.length - 1);
                return array[key];
            },
            loop_getValue: function(arrayLOOP, key) {
                if (Array.isArray(array)) {
                    key = arrayLOOP[1];
                    arrayLOOP = arrayLOOP[0];
                }
            },
            redirect: function(arrayURL, newTab) {
                if (Array.isArray(arrayURL)) {
                    newTab = arrayURL[1] ?? false;
                    arrayURL = arrayURL[0];
                };
                if (newTab) return "window.open('"+arrayURL+"');";
                if (!newTab) return "location.href = '"+arrayURL+"';";
            },
            session_manager_initialize: function() {
    
            },
            session_manager_inizialize: function() {
    
            },
            session_manager_set: function() {
    
            },
            session_manager_get: function() {
    
            },
            hash_combine: function() {
    
            },
            HTTP_get: function() {
    
            },
            json_import: function() {
    
            }
        };
        this.allowParsing = false;
        this.code = code;
        this.modules = modules;
        var SC = this;
        //Run the engine
        this.disassembled = this.disassembly(this.code);
        this.compiled = this.compile();
        this.JScode = [];
        this.compiled.forEach((c)=>{SC.JScode.push(c.jscontent)});
        return this.JScode;
    }
}