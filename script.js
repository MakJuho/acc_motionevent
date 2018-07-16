;window.addEventListener("load", function () {
    "use strict";

    // vec math
    var add = function (a, b) {
        return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z};
    };
    var sub = function (a, b) {
        return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
    };
    var dot = function (a, b) {
        return a.x*b.x + a.y*b.y + a.z*b.z;
    };
    var cross = function (a, b) {
        return {x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x};
    };
    var mul = function (r, v) {
        return {x: r * v.x, y: r * v.y, z: r *v.z};
    };
    var abs = function (a) {
        return Math.sqrt(dot(a, a));
    };
    
    // split vertical/horizontal elements of acceleration
    var splitVH = function (ev) {
        var acc = ev.acceleration, accg = ev.accelerationIncludingGravity;
        // calc gravity element
        var g = sub(accg, acc);
        var gl = abs(g);
        var ez = mul(1/gl, g); // unit vector
        // calc vertical(= gravity direction) part
        var vl = dot(acc, ez);
        var v = mul(vl, ez);
        // split horizontal(= orthogonal plane of gravity) part
        var h = sub(acc, v);
        // orthogonal plane elements(y: top-bottom, x: right->left)
        // (as left hand system)
        var ex = cross({x: 0, y: 1, z: 0}, ez);
        var ey = cross(ez, ex);
        var yl = dot(h, ey);
        var xl = dot(h, ex);
        return {
            a: {x: acc.x, y: acc.y, z: acc.z},
            ag: {x: accg.x, y: accg.y, z: accg.z},
            v: v, h: h, ez: ez, vl: vl, ex: ex, ey: ey, xl: xl, yl: yl
        };
    };

    // Record acceleration data at devicemotion event for views
    // NOTE: not drawing in "devicemotion" event handlers because of delaying
    var lastvh = null;
    var xl = 0.0;
    var yl = 0.0;
    var zlsize = 300;
    var zl1s = new Array(zlsize);
    var zl2s = new Array(zlsize);
    for (var i = 0; i < zlsize; i++) zl1s[i] = zl2s[i] = 0.0;
    var cur = 0;
    var recordXYZ = function (vh) {
        lastvh = vh;
        xl = 0.9 * xl + 0.1 * vh.xl;
        yl = 0.9 * yl + 0.1 * vh.yl;
        cur = (cur + 1) % zlsize;
        zl1s[cur] = vh.vl;
        zl2s[cur] = 0.9 * zl2s[(zlsize + cur - 1) % zlsize] + 0.1 * vh.vl;
    };
    
    // view of direct event acceleration values
    var v1 = {
        x: document.getElementById("x1"),
        y: document.getElementById("y1"),
        z: document.getElementById("z1"),
        abs: document.getElementById("abs1"),
        xn: document.getElementById("x1n"),
        yn: document.getElementById("y1n"),
        zn: document.getElementById("z1n"),
        absn: document.getElementById("abs1n"),
    };
    var v2 = {
        x: document.getElementById("x2"),
        y: document.getElementById("y2"),
        z: document.getElementById("z2"),
        abs: document.getElementById("abs2"),
        xn: document.getElementById("x2n"),
        yn: document.getElementById("y2n"),
        zn: document.getElementById("z2n"),
        absn: document.getElementById("abs2n"),
    };
    var showAccel = function (v, accel) {
        v.x.value = v.xn.value = accel.x;
        v.y.value = v.yn.value = accel.y;
        v.z.value = v.zn.value = accel.z;
        v.abs.value = v.absn.value = abs(accel);
    };

    // view of vertical/horizontal elements in acceleration
    var vhview = {
        v: document.getElementById("v"),
        vn: document.getElementById("vn"),
        h: document.getElementById("h"),
        hn: document.getElementById("hn"),
    };
    var showVH = function (vh) {
        vhview.v.value = vhview.vn.value = Math.abs(vh.vl);
        vhview.h.value = vhview.hn.value = abs(vh.h);
    };

    // x-y accel view
    var xyview = document.getElementById("xyview");
    var drawXY = function (vh) {
        var c2d = xyview.getContext("2d");
        var w = xyview.width, h = xyview.height, unit = w / 20;
        c2d.clearRect(0, 0, w, h);
        c2d.save();
        c2d.beginPath();
        c2d.arc(w/2, h/2, unit * 5, 0, 2*Math.PI);
        c2d.strokeStyle = "black";
        c2d.lineWidth = 3;
        c2d.stroke();
        c2d.restore();
        c2d.save();
        c2d.translate(w/2, h/2);
        c2d.beginPath();
        c2d.moveTo(0, 0);
        c2d.lineTo(vh.xl * -unit, vh.yl * unit);
        c2d.strokeStyle = "red";
        c2d.lineWidth = 3;
        c2d.stroke();
        c2d.beginPath();
        c2d.moveTo(0, 0);
        c2d.lineTo(xl * -unit, yl * unit);
        c2d.strokeStyle = "blue";
        c2d.lineWidth = 3;
        c2d.stroke();
        c2d.restore();
    };
    // z accel view
    var zview = document.getElementById("zview");
    var drawZ = function (vh) {
        var c2d = zview.getContext("2d");
        var w = zview.width, h = zview.height;
        c2d.clearRect(0, 0, w, h);
        c2d.lineWidth = 2;
        c2d.beginPath();
        c2d.moveTo(0, h/2);
        c2d.lineTo(w, h/2);
        c2d.strokeStyle = "black";
        c2d.stroke();
        drawChart(c2d, zl1s, "red");
        drawChart(c2d, zl2s, "blue");
    };


    var drawChart = function (c2d, data, stroke) {
        var start = (cur + 1) % zlsize;
        var x = 0;
        var dx = zview.width / zlsize;
        var unit = zview.height / 20, center = zview.height / 2;
        c2d.beginPath();
        c2d.moveTo(x, center + data[start] * -unit);
        for (var i = (start + 1) % zlsize; i < zlsize; i++) {
            x += dx;
            c2d.lineTo(x, center + data[i] * -unit);
            // document.getElementById("vibrate_value").innerHTML=data[i];
        }
        for (var i = 0; i < start; i++) {
            x += dx;
            c2d.lineTo(x, center + data[i] * -unit);
        }
        c2d.strokeStyle = stroke;
        c2d.stroke();
    };


    // Example Application: Simple Walk Counter
    // (state)
    var vl = 0.0; // noise filtered value
    var count = 0;
    var updown = 0;
    var thresholds = {up: 0.25, down: -0.25};
    // (event handler)
    var walking = function (vh) {
        vl = 0.9 * vl + 0.1 * vh.vl; //low-pass filtering
        switch (updown){
        case -1:
            if (vl > thresholds.up) {
                updown = +1;
                count += 1;
            }
            break;
        case +1:
            if (vl < thresholds.down) {
                updown = -1;
            }
            break;
        default:
            if (vl < 0) updown = -1;
            if (vl >= 0) updown = +1;
            break;
        }
    };
    // (view)
    var counter = document.getElementById("counter");
    var updateWalking = function () {
        counter.textContent = count;
    };
    var reset = document.getElementById("reset");
    reset.addEventListener("click", function () {
        vl = 0.0;
        count = 0;
        updown = 0;
    }, false);
    
    var value = document.getElementById("vibrate_value");
    var updateValue = function(){
        
        var tmp_vibrate=Math.abs(zl1s[cur]*1000);
        tmp_vibrate=Math.floor(tmp_vibrate);
        value.textContent = tmp_vibrate;
    };

    // Event Handlers
    // see: http://www.w3.org/TR/orientation-event/
    window.addEventListener("devicemotion", function (ev) {
        try {
            var vh = splitVH(ev);
            walking(vh);
            recordXYZ(vh);
            

        } catch (ex) {
            document.getElementById("log").textContent = ex.toString();
        }
    }, false); 

    requestAnimationFrame(function loop() {
        updateWalking();
        setTimeout(updateValue(), 10000);
        // updateValue();
        
        
        if (lastvh) {
            showAccel(v1, lastvh.a);
            showAccel(v2, lastvh.ag);
            showVH(lastvh);
            drawXY(lastvh);
            drawZ(lastvh);
        }
        requestAnimationFrame(loop);
    });
}, false);
