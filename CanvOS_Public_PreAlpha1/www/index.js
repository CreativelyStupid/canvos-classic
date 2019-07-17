var _scr = document.getElementById("canvas").getContext("2d");

var _func = {
    sind: (d) => {return Math.sin(d * Math.PI / 180)},
    cosd: (d) => {return Math.cos(d * Math.PI / 180)},
};

var gfx = {
    ctx: _scr,
    rect: (x, y, w, h, c) => {
        if (x < 0) {
            w += x;
            x = 0;
        }
        if (x + w > 1280) {
            w = 1280 - x;
        }
        if (x > 1280) {
            return 0;
        }
        if (y < 0) {
            h += y;
            y = 0;
        }
        if (y + h > 720) {
            h = 720 - y;
        }
        if (y > 720) {
            return 0;
        }
        if (c[3] !== 0) {
            gfx.ctx.fillStyle = "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + c[3]/255 + ")";
            gfx.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
            return 2;
        }
        return 1;
    },
    pixel: (x, y, c) => {gfx.rect(x, y, 1, 1, c);},
    vline: (x, y, l, c) => {gfx.rect(x, y, 1, l, c);},
    hline: (x, y, l, c) => {gfx.rect(x, y, l, 1, c);},
    line: (x0, y0, x1, y1, c, fu) => {
        if (x0 == x1) {
            gfx.vline(x0, y0, y1 - y0, c);
        } else if (y0 == y1) {
            gfx.hline(x0, y0, x1 - x0, c);
        } else {
            // Bresenham's algorithm - thx adafruit gfx library
            if (fu === undefined) fu = gfx.pixel;
            var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
            if (steep) {
                var i = x0;
                x0 = y0;
                y0 = i;
                var i = x1;
                x1 = y1;
                y1 = i;
            }
            if (x0 > x1) {
                var i = x0;
                x0 = x1;
                x1 = i;
                var i = y0;
                y0 = y1;
                y1 = i;
            }
            var dx, dy;
            dx = x1 - x0;
            dy = Math.abs(y1 - y0);
            var err = dx / 2;
            var ystep;
            if (y0 < y1) {
                ystep = 1;
            } else {
                ystep = -1;
            }
            for (; x0 <= x1; x0++) {
                if (steep) {
                    fu(y0, x0, c);
                } else {
                    fu(x0, y0, c);
                }
                err -= dy;
                if (err < 0) {
                    y0 += ystep;
                    err += dx;
                }
            }
        }
    },
    rectline: (x, y, w, h, t, c) => {
        for (var i = 0; i < t; i++) {
            gfx.hline(x, y, w, c);
            gfx.vline(x, y, h, c);
            gfx.hline(x, y + h, w + 1, c);
            gfx.vline(x + w, y, h, c);
            x++;
            y++;
            w -= 2;
            h -= 2;
        }
    },
    tri: (x0, y0, x1, y1, x2, y2, c) => {
        // thx adafruit
        var a, b, y, last;
        if (y0 > y1) {
            var i = y0;
            y0 = y1;
            y1 = i;
            var i = x0;
            x0 = x1;
            x1 = i;
        }
        if (y1 > y2) {
            var i = y2;
            y2 = y1;
            y1 = i;
            var i = x2;
            x2 = x1;
            x1 = i;
        }
        if (y0 > y1) {
            var i = y0;
            y0 = y1;
            y1 = i;
            var i = x0;
            x0 = x1;
            x1 = i;
        }
        if (y0 == y2) {
            a = b = x0;
            if (x1 < a) a = x1;
            else if (x1 > b) b = x1;
            if (x2 < a) a = x2;
            else if (x2 > b) b = x2;
            gfx.hline(a, y0, b - a + 1, c);
        } else {
            var dx01 = x1 - x0;
            var dy01 = y1 - y0;
            var dx02 = x2 - x0;
            var dy02 = y2 - y0;
            var dx12 = x2 - x1;
            var dy12 = y2 - y1;
            var sa = 0;
            var sb = 0;
            if (y1 == y2) last = y1;
            else last = y1 - 1;
            for (y = y0; y < last; y++) {
                a = x0 + sa / dy01;
                b = x0 + sb / dy02;
                sa += dx01;
                sb += dx02;
                if (a > b) {
                    var i = a;
                    a = b;
                    b = i;
                }
                gfx.hline(a, y, b - a + 1, c);
            }
            sa = dx12 * (y - y1);
            sb = dx02 * (y - y0);
            for (; y <= y2; y++) {
                a = x1 + sa / dy12;
                b = x0 + sb / dy02;
                sa += dx12;
                sb += dx02;
                if (a > b) {
                    var i = a;
                    a = b;
                    b = i;
                }
                gfx.hline(a, y, b - a + 1, c);
            }
        }
    },
    triline: (x0, y0, x1, y1, x2, y2, c) => {
        gfx.line(x0, y0, x1, y1, c);
        gfx.line(x1, y1, x2, y2, c);
        gfx.line(x2, y2, x0, y0, c);
    },
    circle: (x, y, w, h, c) => {
        // thx https://duckduckgo.com/?q=filled+ellipse+algorithm&t=canonical&atb=v141-4__&ia=qa&iax=qa
        var hh = h * h;
        var ww = w * w;
        var hhww = hh * ww;
        var x0 = w;
        var dx = 0;
        for (var xc = -w; xc <= w; xc++) {
            gfx.pixel(x + xc, y, c);
        }
        for (var yc = 1; yc <= h; yc++) {
            var x1 = x0 - (dx - 1);
            for (; x1 > 0; x1--) {
                if (x1 * x1 * hh + yc * yc * ww <= hhww) break;
            }
            dx = x0 - x1;
            x0 = x1;
            for (var xc = 0; xc < x0; xc++) {
                gfx.pixel(x + xc, y - yc, c);
                gfx.pixel(x + xc, y + yc, c);
                gfx.pixel(x - xc, y - yc, c);
                gfx.pixel(x - xc, y + yc, c);
            }
        }
    },
    circleline: (x, y, w, h, c, t = 0) => {
        // thx https://www.mathopenref.com/coordcirclealgorithm.html and https://sites.google.com/site/ruslancray/lab/projects/bresenhamscircleellipsedrawingalgorithm/bresenham-s-circle-ellipse-drawing-algorithm
        if (t === 0) {
            var a2 = w * w;
            var b2 = h * h;
            var fa2 = 4 * a2, fb2 = 4 * b2;
            var x0, y0, si;
            for (x0 = 0, y0 = h, si = 2 * b2 + a2 * (1 - 2 * h); b2 * x0 <= a2 * y0; x0++) {
                gfx.pixel(x + x0, y + y0, c);
                gfx.pixel(x - x0, y + y0, c);
                gfx.pixel(x + x0, y - y0, c);
                gfx.pixel(x - x0, y - y0, c);
                if (si >= 0) {
                    si += fa2 * (1 - y0);
                    y0--;
                }
                si += b2 * ((4 * x0) + 6);
            }
            for (x0 = w, y0 = 0, si = 2 * a2 + b2 * (1 - 2 * w); a2 * y0 <= b2 * x0; y0++) {
                gfx.pixel(x + x0, y + y0, c);
                gfx.pixel(x - x0, y + y0, c);
                gfx.pixel(x + x0, y - y0, c);
                gfx.pixel(x - x0, y - y0, c);
                if (si >= 0) {
                    si += fb2 * (1 - x0);
                    x0--;
                }
                si += a2 * ((4 * y0) + 6);
            }
        } else {
            var step = 2;
            var oldx = x+w, oldy = y;
            for (var th = 0; th <= 360; th += step) {
                var x0 = x + w * _func.cosd(th);
                var y0 = y - h * _func.sind(th);
                gfx.line(oldx, oldy, x0, y0, c);
                oldx = x0;
                oldy = y0;
            }
        }
    },
    polygon: (x, y, c) => {

    },
    polygonline: (x, y, c) => {
        for (var i = 0; i < x.length; i++) {
            gfx.line(x[i], y[i], x[(i + 1) % x.length], y[(i + 1) % y.length], c);
        }
    },
    clear: () => {
        gfx.rect(0, 0, 1280, 720, [255, 255, 255, 255]);
    },
    border: () => {
        //gfx.rectline(0, 0, 1280, 720, 4, [0, 0, 0, 255]);
    },
    bitmap: (x, y, bitmap, xs, ys, col2, hue, xpx, ypx) => {
        var xoff = 0, yoff = 0;
        if (xpx === undefined) xpx = 1;
        if (ypx === undefined) ypx = 1;
        var getBitmapChs = (bmp, x, y, huemod) => {
            // bitmap["cols"][bitmap["gfx"][yc][2*xc] + bitmap["gfx"][yc][2*xc+1]]
            var out = "";
            for (var i = 0; i < bmp["chars"]; i++) {
                out += bmp["gfx"][y][bmp["chars"]*x+i];
            }
            return [bmp["cols"][out][0] * huemod[0], bmp["cols"][out][1] * huemod[1], bmp["cols"][out][2] * huemod[2], bmp["cols"][out][3] * huemod[3]];
        };
        if (hue === undefined) hue = [1, 1, 1, 1];
        if (col2 !== undefined)
            Object.keys(col2).forEach(function(key) {
                bitmap["cols"][key] = col2[key];
            });
        if (bitmap !== undefined) {
            if (bitmap["startpos"] !== undefined) {
                xoff = -bitmap["startpos"][0];
                yoff = -bitmap["startpos"][1];
            }
            for (var yc = 0; yc < bitmap["gfx"].length; yc+=ypx) {
                for (var xc = 0; xc < bitmap["gfx"][0].length/bitmap["chars"]; xc+=xpx) {
                    gfx.rect(xoff + x + xc * xs, yoff + y + yc * ys, xpx * xs + 0.99, ypx * ys + 0.99, getBitmapChs(bitmap, xc, yc, hue));
                }
            }
        }
    },
    bitmapsize: (bitmap) => {
        return [bitmap["gfx"][0].length/bitmap["chars"], bitmap["gfx"].length];
    },
    _: {
        fonttobitmap: (f, c) => {
            var out = {"chars": 1, "cols": {"1": [0, 0, 0, 255], "0": [0, 0, 0, 0]}, gfx: []};
            var pos = 0;
            for (var i = 0; i < f.lookup.length; i++) {
                if (f.lookup[i] === c) {
                    pos = i;
                }
            }
            for (var i = 0; i < f.height; i++) {
                out.gfx.push("");
            }
            for (var i = 0; i < f.width; i++) {
                var char = f.fontData[pos * f.width + i].toString(2);
                char = "0".repeat(f.height-char.length) + char;
                char = char.split("").reverse().join("");
                for (var j = 0; j < f.height; j++) {
                    if (char[j] === "1") {
                        out.gfx[j] += "1";
                    } else {
                        out.gfx[j] += "0";
                    }
                }
            }
            return out;
        },
        drawcharacter: (x, y, f, c, s, l) => {
            if (f !== undefined) gfx.bitmap(x, y, gfx._.fonttobitmap(f, c), s/(f.height+1), s/(f.height+1), {"1": l});
        }
    },
    text: (x, y, s, f, v, c, r) => {
        if (r === undefined) r = false;
        if (f !== undefined) {
            if (r) {
            var x0 = x - (f.width) * v/(f.height+1), y0 = y;
                for (var i = s.length-1; i >= 0; i--) {
                    if (s[i] === '\n') {
                        x0 = x;
                        y0 += f.height + 1;
                    } else if (s[i] === '\t') {
                        x0 -= 4 * (f.width + 1) * v/(f.height+1);
                    } else {
                        gfx._.drawcharacter(x0, y, f, s[i], v, c);
                    }
                    x0 -= (f.width + 1) * v/(f.height+1);
                    
                }
            } else { 
                var x0 = x, y0 = y;
                for (var i = 0; i < s.length; i++) {
                    if (s[i] === '\n') {
                        x0 = x;
                        y0 += f.height + 1;
                    } else if (s[i] === '\t') {
                        x0 += 4 * (f.width + 1) * v/(f.height+1);
                    } else {
                        gfx._.drawcharacter(x0, y, f, s[i], v, c);
                    }
                    x0 += (f.width + 1) * v/(f.height+1);
                    
                }
            }
        }
    },
    textwidth: (s, f, v) => {
        if (f !== undefined) return s.length * (f.width+1)*v/(f.height+1)
        return 0;
    }
};
