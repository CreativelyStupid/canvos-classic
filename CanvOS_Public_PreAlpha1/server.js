var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    os = require('os');

var fileExt = 1;


var fileExtensions = JSON.parse(fs.readFileSync("./extensions.json", { encoding: "utf-8" }));

var CustomError=(name="CustomError",message="")=>{Error.call(message);this.name=name;this.message=message;};CustomError.prototype=Error.prototype;

argvProperties = [
    [
    ],
    [
        ["num", "-port", 80],
        ["bool", "-ip", false]
    ]
];
argvs = parseArgvs(process.argv, argvProperties);

if (argvs["-ip"]) {
    var ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                process.stdout.write("\n" + ifname + ':' + alias + ": " + iface.address);
            } else {
                // this interface has only one ipv4 adress
                process.stdout.write("\n" + ifname + ': ' + iface.address);
            }
            ++alias;
        });
    });
}

process.on('SIGINT', function() {
    server.close();
    console.log(" Caught! Exiting...");
    process.exit(0);
});

var lastIp = "";

var server = http.createServer(function (req, res) {
	var q = url.parse(req.url, true);
	/*if (q.pathname === "/exit") {
		res.end("closed");
		server.close();
		process.exit(0);
	}*/
    var filename = "./www" + q.pathname;
    var newIp = req.connection.remoteAddress.toString();
    if (newIp !== lastIp) {
        lastIp = newIp;
        process.stdout.write("\n" + "From " + newIp);
    }
    process.stdout.write("\n" + filename + " " + req.method);
    if (req.method === "POST") {
        var body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            var data = JSON.parse(Buffer.concat(body).toString()),
                request = data.request;
            data = data.data;
            if (request === "dirs") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                var out = {
                    "folders": getDirectories(filename).filter((value) => {
                        return data.indexOf(value) === -1;
                    })
                };
                process.stdout.write("\n" + JSON.stringify(out));
                res.write(JSON.stringify(out));
                res.end();
                return;
            }
        });
    } else if (req.method === "GET") {
        fs.stat(filename, function (err, stats) {
            if (res.err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("404 Not Found: res error");
                //throw res.err;
                return;
            }
            if (stats === undefined) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("404 Not Found: stats error");
            }
            if (stats.isDirectory) {
                if (fileExt) {
                    var i = filename.split(".");
                    if (fileExtensions[i[i.length - 1]] === undefined) {
                        filename += "/index.html";
                    }
                } else {
                    filename += "/index.html";
                }
            }
            process.stdout.write(" " + Math.round(10000 * stats.size / 2**10) / 10000 + "KB");
            fs.readFile(filename, function (err, data) {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end("404 Not Found: fs error");
                    //throw err;
                    return;
                }
                var i = filename.split(".");
                res.writeHead(200, { 'Content-Type': fileExtensions[i[i.length - 1]] });
                res.write(data);
                return res.end();
            });
        });
    }
}).listen(argvs["-port"]);
process.stdout.write("running on port " + argvs["-port"]);
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

var stdin = process.openStdin();

var handleData = function(d) {
    var str = d.toString().trim();
    
};

stdin.addListener("data", handleData);

function parseArgvs(argv, properties = []) {
    var pr = properties;
    var outVals = {};
    argv = argv.slice(2);
    for (var i = 0; i < pr[1].length; i++) {
        outVals[pr[1][i][1]] = pr[1][i][2];
    }
    for (var i = 0; i < pr[0].length; i++) {
        var t = getType(argv[i]);
        if (t[0] === pr[0][i][0]) {
            outVals[pr[0][i][1]] = t[1];
        } else {
            throw new CustomError("ArgvError", "type mismatch");
        }
    }
    for (var i = 0; i < pr[1].length; i++) {
        var t = argv.indexOf(pr[1][i][1]);
        if (t !== -1) {
            if (pr[1][i][0] === "bool") {
                outVals[pr[1][i][1]] = true;
            } else {
                t = getType(argv[t + 1]);
                if (t[0] === pr[1][i][0]) {
                    outVals[pr[1][i][1]] = t[1];
                } else {
                    throw new CustomError("ArgvError", "type mismatch");
                }
            }
        }
    }
    return outVals;
}

function getType(value) {
    var t;
    t = parseFloat(value);
    if (value === "NaN" || !Number.isNaN(t)) {
        return ["num", t];
    }
    t = "JSON parse failed!";
    try {
        t = JSON.parse(value);
    } catch (err) {
        t = "JSON parse failed!";
    }
    if (t !== "JSON parse failed!") {
        if (t && typeof t === 'object' && t.constructor === Array) return ["arr", t];
        if (t && typeof t === 'object' && t.constructor === Object) return ["obj", t];
    }
    if (value === "true" || value === "false") {
        return ["bool", value === "true" ? true : false];
    }
    if (value === undefined || value === "null") return ["null", null];
    return ["str", value];
}
