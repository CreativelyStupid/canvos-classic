var fs = require("fs"),
    PNG = require("pngjs2").PNG;

var file = process.cwd() + "/" + process.argv[2];
var fileOut = process.cwd() + "/" + process.argv[3];
console.log(file + " => " + fileOut);

var gfx = [];

fs.createReadStream(file)
    .pipe(new PNG())
    .on('parsed', function() {
        for (var y = 0; y < this.height; y++) {
            gfx.push("");
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;
                var color = [this.data[idx], this.data[idx+1], this.data[idx+2], this.data[idx+3]];
                gfx[y] += to_char((color[0] * 2**24) + (color[1] * 2**16) + (color[2] * 2**8) + color[3]);
                var percent = Math.floor((2400 * idx) / (this.width * this.height)) / 100;
                process.stdout.write(" " + percent.toString() + "%     \r");
            }
        }
        fs.writeFile(fileOut, JSON.stringify({"chars": 6, "cols": "rgb", "gfx": gfx}), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(" 100%     ");
            console.log("DONE! Colors used: " + 2**32 + " / " + (basearr.length ** 6).toString() + ".");
        }); 

        //this.pack().pipe(fs.createWriteStream(fileOut));
    });
// base 64
var basearr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijjlmnopqrstuvwxyz+/";
console.log(basearr.length.toString() + " chars, " + (basearr.length ** 6).toString() + " combos");
function to_char(id) {
    var n1 = id % basearr.length;
    var n2 = Math.floor(id / basearr.length) % basearr.length;
    var n3 = Math.floor(id / basearr.length ** 2) % basearr.length;
    var n4 = Math.floor(id / basearr.length ** 3) % basearr.length;
    var n5 = Math.floor(id / basearr.length ** 4) % basearr.length;
    var n6 = Math.floor(id / basearr.length ** 5) % basearr.length;
    return basearr[n6] + basearr[n5] + basearr[n4] + basearr[n3] + basearr[n2] + basearr[n1];
}