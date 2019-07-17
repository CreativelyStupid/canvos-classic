var col = {
    mix:(c, ...a)=>{var r=c[0],g=c[1],b=c[2],t=c[3];for(var i=0;i<a.length;i++) {r=(r+a[i][0])/2;g=(g+a[i][1])/2;b=(b+a[i][2])/2;t=(t+a[i][3])/2;}return[Math.floor(r),Math.floor(g),Math.floor(b),Math.floor(t)]},
    black:   [0,   0,   0,   255],
    white:   [255, 255, 255, 255],
    red:     [255, 0,   0,   255],
    green:   [0,   255, 0,   255],
    blue:    [0,   0,   255, 255],
    yellow:  [255, 255, 0,   255],
    cyan:    [0,   255, 255, 255],
    magenta: [255, 0,   255, 255],
    clear:   [0,   0,   0,   0  ],
    clearw:  [255, 255, 255, 0  ]
};
var mouse = new Array(100).fill({x: Math.Infinity, y: Math.Infinity, b: [], bf: [], bl: []});
var mousei = {btns: 9, cursor: "regular"};
var loadedAssets = {};
var loadingAssets = [];
var module={};
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mousedown', onMouseBtnPress, false);
document.addEventListener('mouseup', onMouseBtnUnpress, false);
document.addEventListener('mouseenter', onMouseUpdate, false);
document.addEventListener('mouseout', (e) => {mouse[0].x = Math.Infinity; mouse[0].y = Math.Infinity}, false);
function onMouseUpdate(e) {
    mouse[0].x = e.pageX * 1280 / ($("#canvas").width());
    mouse[0].y = e.pageY * 1280 / ($("#canvas").width());
}
function onMouseBtnPress(e) {
    mouse[0].b = new Array(mousei.btns);
    for (var i = 0; i < mousei.btns; i++) {
        if (e.button === i) {
            mouse[0].b[i] = true;
            mouse[0].bf[i] = true;
        }
    }
}
function onMouseBtnUnpress(e) {
    mouse[0].b = new Array(mousei.btns);
    for (var i = 0; i < mousei.btns; i++) {
        if (e.button === i)
            mouse[0].b[i] = false;
            mouse[0].bl[i] = true;
    }
}
var loadAsset=(a,b)=>{loadedAssets[b]=a;};
var loadAssetFromFile=(a)=>{loadingAssets.push({"t":"f","d":a});};
var loadAssetFromScript=(a)=>{loadingAssets.push({"t":"s","d":a});};
var getAsset=(a)=>{return loadedAssets[a]};
var finLoadAsset=(callback)=>{var a=loadingAssets.shift();if(a.t==="f"){$.get(a.d,(b)=>{loadAsset(b,a.d);startLoadingAssets(callback);});}else{$.get(a.d,(b)=>{eval(b);loadAsset(module.exports,a.d);startLoadingAssets(callback);});}};
var startLoadingAssets=(callback)=>{if(loadingAssets.length>0){finLoadAsset(callback);}else{callback;}};
var stopframerunning = false;
function rframe(time) {
    //gfx.clear();
    if (stopframerunning) return;
    
    for (var i = mouse.length-1; i > 0; i--) {
        mouse[i].x = mouse[i-1].x;
        mouse[i].y = mouse[i-1].y;
        for (var j = 0; j < mousei.btns; j++) {
            mouse[i].b[j] = mouse[i-1].b[j];
        }
    }
    frame(time);
    for (var j = 0; j < mousei.btns; j++) {
        mouse[0].bf[j] = false;
        mouse[0].bl[j] = false;
    }
    
    //gfx.border()
    requestAnimationFrame(rframe);
}
requestAnimationFrame(rframe);

var lastTime = 0;
var timeCount = 0;
var timeStep = 0;
var fps = 0;

function frame (time) {
    /*for (var i = 5-1; i > 1; i--) {
        //gfx.line(mouse[i].x, mouse[i].y, mouse[i-1].x, mouse[i-1].y, col.red, (x, y, c) => {gfx.bitmap(x, y, getAsset("gfx/cursor.json"));});
        gfx.bitmap(mouse[i].x, mouse[i].y, getAsset("gfx/cursor.json"));
        
    }*/
    os_renderdesktop();
    os_renderapps();
    timeCount++;
    if (timeCount >= 10) {
        timeCount-=10;
        timeStep = time/1000 - lastTime/1000;
        fps = 1/timeStep;
    }
    lastTime = time;
    var strs = [];
    strs.push("0".repeat(4-(Math.round(fps)).toString().length) + (Math.round(fps)).toString() + " fps");
    strs.push($("#canvas").width().toString() + "px x " + Math.floor($("#canvas").height()).toString() + "px");
    gfx.rect(0, 0, 1280, 32, [127, 127, 127, 255]);
    gfx.text(1280, 0, strs[0], getAsset("gfx/oled-font-5x7.js"), 16, col.black, true);
    gfx.text(1280, 16, strs[1], getAsset("gfx/oled-font-5x7.js"), 16, col.black, true);
    gfx.bitmap(mouse[0].x, mouse[0].y, getAsset("gfx/cursors/" + mousei.cursor + ".json"), 1, 1);
}

loadAssetFromFile("gfx/cursors/regular.json");
loadAssetFromFile("gfx/cursors/grab.json");
loadAssetFromScript("gfx/oled-font-5x7.js");
loadAssetFromFile("gfx/ui/menubar.json");
loadAssetFromFile("gfx/ui/starticon.json");
//loadAssetFromFile("gfx/bg.json");
loadAssetFromFile("gfx/ui/logo.json");
loadAssetFromFile("gfx/ui/app/topbar.json");
loadAssetFromFile("gfx/ui/app/close/unpressed.json");
loadAssetFromFile("gfx/ui/app/close/pressed.json");
loadAssetFromFile("gfx/ui/app/fullscreen/unpressed.json");
loadAssetFromFile("gfx/ui/app/fullscreen/pressed.json");
loadAssetFromFile("gfx/ui/app/unfullscreen/unpressed.json");
loadAssetFromFile("gfx/ui/app/unfullscreen/pressed.json");
loadAssetFromFile("gfx/ui/app/fullwindow/unpressed.json");
loadAssetFromFile("gfx/ui/app/fullwindow/pressed.json");
loadAssetFromFile("gfx/ui/app/smallwindow/unpressed.json");
loadAssetFromFile("gfx/ui/app/smallwindow/pressed.json");
loadAssetFromFile("gfx/ui/app/minimize/unpressed.json");
loadAssetFromFile("gfx/ui/app/minimize/pressed.json");
loadAssetFromFile("gfx/ui/app/drag/unpressed.json");
loadAssetFromFile("gfx/ui/app/drag/pressed.json");
startLoadingAssets();










var appsRunning = [];
var appVisibility = [];
var appsAvailable = [];
var appsLoading = [];
$.post("apps/", JSON.stringify({"request": "dirs", "data": []}), (data) => {
    data = JSON.parse(JSON.stringify(data));
    for (var i = 0; i < data.folders.length; i++) {
        loadAssetFromScript("apps/" + data.folders[i] + "/cosapp.js");
        loadAssetFromFile("apps/" + data.folders[i] + "/icon7px.json");
        loadAssetFromFile("apps/" + data.folders[i] + "/icon22px.json");
        appsLoading.push(data.folders[i]);
    }
    startLoadingAssets();
});
var currentWallpaper = undefined;
var currentWallpaperW = undefined;
var currentWallpaperH = undefined;
var startMenuPos = -550;
var startMenuShown = false;

function os_renderdesktop() {
    if (appsLoading.length > 0) {
        var nextApp = appsLoading[0];
        if (getAsset("apps/" + nextApp + "/cosapp.js") !== undefined) {
            appsAvailable.push(getAsset("apps/" + nextApp + "/cosapp.js"));
            appsLoading.shift();
        }
    }
    /*
    if (getAsset("gfx/bg.json") !== undefined) {
        currentWallpaper = getAsset("gfx/bg.json");
        currentWallpaperW = 1280 / gfx.bitmapsize(currentWallpaper)[0];
        currentWallpaperH = 688 / gfx.bitmapsize(currentWallpaper)[1];
    }
    if (currentWallpaper !== undefined) gfx.bitmap(0, 32, currentWallpaper, currentWallpaperW, currentWallpaperH);
    */
    gfx.rect(0, 32, 1280, 688, [7, 15, 63, 255]);
    gfx.bitmap(0, 688, getAsset("gfx/ui/menubar.json"), 1280, 2);
    if (in_box(mouse[0].x, mouse[0].y, 0, 688, 64, 32)) {
        if (mouse[0].bf[0]) {
            startMenuShown = !startMenuShown;
        }
        if (mouse[0].b[0]) {
            gfx.bitmap(0, 688, getAsset("gfx/ui/starticon.json"), 1, 1, {}, [1.75, 1.75, 1.75, 1]);
        } else {
            gfx.bitmap(0, 688, getAsset("gfx/ui/starticon.json"), 1, 1, {}, [1.5, 1.5, 1.5, 1]);
        }
    } else {
        gfx.bitmap(0, 688, getAsset("gfx/ui/starticon.json"), 1, 1, {}, [1, 1, 1, 1]);
    }
    startMenuPos = lerp(startMenuPos, startMenuShown ? 0 : -510, timeStep * 7.5);
    if (startMenuPos > -1) startMenuPos = 0;
    gfx.rect(startMenuPos, 188, 500, 500, [31, 31, 127, 255]);
    gfx.text(startMenuPos + 4, 192, "Start", getAsset("gfx/oled-font-5x7.js"), 32, [127, 127, 191, 255], false);
    drawlogo(1248, 688, 16, [201, 218, 248, 255], [61, 133, 198, 255]);
    for (var i = 0; i < appsAvailable.length; i++) {
        if (in_box(mouse[0].x, mouse[0].y, startMenuPos + 4, 224 + i * 24, 492, 24)) {
            if (mouse[0].bf[0] && appsRunning.indexOf(appsAvailable[i]) === -1) {
                appsRunning.push(appsAvailable[i]);
                appVisibility.push(appsRunning.length - 1);
                appsRunning[appsRunning.length - 1].onStart();
            }
            if (mouse[0].b[0]) {
                gfx.rect(startMenuPos + 4, 224 + i * 24, 492, 24, [63, 63, 255, 255]);
            } else {
                gfx.rect(startMenuPos + 4, 224 + i * 24, 492, 24, [47, 47, 191, 255]);
            }
        }
        gfx.rectline(startMenuPos + 4, 224 + i * 24, 492, 24, 1, [127, 127, 191, 255]);
        gfx.bitmap(startMenuPos + 6, 226 + i * 24, getAsset("apps/" + appsAvailable[i].folder + "/icon22px.json"), 1, 1);
        gfx.text(startMenuPos + 29, 226 + i * 24, appsAvailable[i].title, getAsset("gfx/oled-font-5x7.js"), 24, [127, 127, 191, 255], false);
    }
    //gfx.bitmap(startMenuPos + 4, 224, getAsset("gfx/logo.json"), undefined, undefined, 50, 50);
}
var currentWindowDragXOffset = 0;
var currentWindowDragYOffset = 0;
var currentWindowIsDragging = null;
function os_renderapps() {
    for (var i = 0; i < appVisibility.length; i++) {
        if (appVisibility[i] === null) continue;
        var app = appsRunning[appVisibility[i]];
        var awindow = app.window;
        if (mouse[0].bf[0] && i === visible_app(mouse[0].x, mouse[0].y)) {
            appVisibility.push(appVisibility.splice(i, 1)[0]);
            
        }
        if (awindow.b === 0) {
            gfx.rectline(awindow.x, awindow.y, awindow.w + 3, awindow.h + 12, 1, [127, 127, 127, 255]);
            gfx.rect(awindow.x + 1, awindow.y + 10, awindow.w + 2, awindow.h + 2, [63, 63, 63, 255]);
            gfx.bitmap(awindow.x + 1, awindow.y + 1, getAsset("gfx/ui/app/topbar.json"), awindow.w + 3, 0.9, undefined, [0.625, 0.625, 0.625, 1]);
            gfx.bitmap(awindow.x + 2, awindow.y + 2, getAsset("apps/" + app.folder + "/icon7px.json"), 1, 1);
            gfx.text(awindow.x + 10, awindow.y + 2, app.title, getAsset("gfx/oled-font-5x7.js"), 8, [0, 0, 0, 255], false);
            if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 6, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                gfx.bitmap(awindow.x + awindow.w - 6, awindow.y + 1, getAsset("gfx/ui/app/close/pressed.json"), 1, 1);
            } else {
                gfx.bitmap(awindow.x + awindow.w - 6, awindow.y + 1, getAsset("gfx/ui/app/close/unpressed.json"), 1, 1);
                if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 6, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                    appsRunning[appVisibility[i]] = null;
                    appVisibility[i] = null;
                }
            }
            if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 33, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                gfx.bitmap(awindow.x + awindow.w - 33, awindow.y + 1, getAsset("gfx/ui/app/minimize/pressed.json"), 1, 1);
            } else {
                gfx.bitmap(awindow.x + awindow.w - 33, awindow.y + 1, getAsset("gfx/ui/app/minimize/unpressed.json"), 1, 1);
                if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 33, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                    
                }
            }
            if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 24, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                gfx.bitmap(awindow.x + awindow.w - 24, awindow.y + 1, getAsset("gfx/ui/app/fullscreen/pressed.json"), 1, 1);
            } else {
                gfx.bitmap(awindow.x + awindow.w - 24, awindow.y + 1, getAsset("gfx/ui/app/fullscreen/unpressed.json"), 1, 1);
                if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 24, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                    
                }
            }
            if (awindow.f) {
                if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 15, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                    gfx.bitmap(awindow.x + awindow.w - 15, awindow.y + 1, getAsset("gfx/ui/app/smallwindow/pressed.json"), 1, 1);
                } else {
                    gfx.bitmap(awindow.x + awindow.w - 15, awindow.y + 1, getAsset("gfx/ui/app/smallwindow/unpressed.json"), 1, 1);
                    if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 15, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                        
                    }
                }
            } else {
                if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 15, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                    gfx.bitmap(awindow.x + awindow.w - 15, awindow.y + 1, getAsset("gfx/ui/app/fullwindow/pressed.json"), 1, 1);
                } else {
                        gfx.bitmap(awindow.x + awindow.w - 15, awindow.y + 1, getAsset("gfx/ui/app/fullwindow/unpressed.json"), 1, 1);
                    if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 15, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                        
                    }
                }
            }
            if (i === visible_app(mouse[0].x, mouse[0].y) && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 42, awindow.y + 1, 7, 7) && mouse[0].b[0]) {
                gfx.bitmap(awindow.x + awindow.w - 42, awindow.y + 1, getAsset("gfx/ui/app/drag/pressed.json"), 1, 1);
                if (mouse[0].bf[0]) {
                    currentWindowDragXOffset = mouse[0].x - awindow.x;
                    currentWindowDragYOffset = mouse[0].y - awindow.y;
                    currentWindowIsDragging = i;
                }
            } else {
                gfx.bitmap(awindow.x + awindow.w - 42, awindow.y + 1, getAsset("gfx/ui/app/drag/unpressed.json"), 1, 1);
                if (mouse[0].bl[0] && in_box(mouse[0].x, mouse[0].y, awindow.x + awindow.w - 42, awindow.y + 1, 7, 7) && i === visible_app(mouse[0].x, mouse[0].y)) {
                    currentWindowIsDragging = null;
                }
            }
            if (currentWindowIsDragging === i) {
                awindow.x = mouse[0].x - currentWindowDragXOffset;
                awindow.y = mouse[0].y - currentWindowDragYOffset;
            }
        }
    }
}

function in_box(x, y, bx, by, bw, bh) {
    return x >= bx && x <= bx + bw - 1 && y >= by && y <= by + bh - 1;
}

function in_poly(x, y, px, py) {
    var counted;
    for (var i = 0; i < px.length; i++) {
        var xs = px[i];
        var ys = py[i];
        var xe = px[(i + 1) % px.length];
        var ye = py[(i + 1) % px.length];
        if (ys < y && ye < y)
            continue;
        if ((xs - x) / Math.abs(xs - x) === (xe - x) / Math.abs(xe - x))
            continue;
        if (xs === xe && xe === x) {
            if ((ys - y) / Math.abs(ys - y) === 1 && (ye - y) / Math.abs(ye - y) === 1) {
                counted++;
                continue;
            }
            return 1;
        }
        //     P2y - P1y           P2y - P1y    
        // y = --------- X + P1y - --------- P1x
        //     P2x - P1x           P2x - P1x    
        var m = (ye - ys) / (xe - xs);
        var lny = (m * x) + ys - (m * xs);
        if (lny > y) {
            counted++;
            continue;
        }
        if (lny === y)
            return 1;
    }
    if (counted % 2 === 1)
        return 2;
    return 0;
}
function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}
function drawlogo(x, y, s, mc, bc) {
    gfx.circle(x + s, y + s, s, s, bc);
    gfx.circle(x + s, y + s, 3 * s / 4, 3 * s / 4, mc);
    gfx.circle(x + 5 * s / 4, y + s, 3 * s / 4, 3 * s / 4, bc);
}
function visible_app(x, y) {
    for (var i = appVisibility.length - 1; i >= 0; i--) {
        if (appVisibility[i] === null) continue;
        var app = appsRunning[appVisibility[i]];
        if (app.window.b === 0)
            if (in_box(x, y, app.window.x, app.window.y, app.window.w + 4, app.window.h + 13)) return i;
    }
    return null;
}
