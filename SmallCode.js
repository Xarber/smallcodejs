function SmallCode(code) {
    code = code.split("\n");
    var parsingAllowed = false;
    this.code = [];
    this.currentCodeOrder = [];
    this.methods = {
        session_manager_get: (method)=>{
            method = method.join(" ").split('(')[1].split(')')[0];
            method = method.split("'")[1];
            return sessionStorage[method] ?? "''";
        }
    }
    this.execMethod = function(method) {
        var methodname = method.join(" ").replaceAll('.', '_').split('(')[0].split(" ");
        return SC.methods[methodname](method);
    };
    var SC = this;
    for (var line of code) {
        line = line.replace(/^\s+|\s+$/gm,'').split(" ");
        var command = line.shift().toLowerCase().replaceAll('\r', '');
        if (command === "parsing:()[") {parsingAllowed = true;continue}
        if (command === "]//,") parsingAllowed = false;
        if (!parsingAllowed) continue;

        if (command === "get") {
            var resource = "";
            var variable = line.shift();
            line.shift(); //Removes "from"
            var method = line.shift().toLowerCase().replaceAll('\r', '');
            if (method === "method") resource = SC.execMethod(line);
            //*RUNNING CODE
            window[variable] = resource;
        }

        if (command === "if") {
            line.pop();
            var condition = line;
            console.log(condition)
        }

        this.code.push(line);
    };
    return this.code;
}