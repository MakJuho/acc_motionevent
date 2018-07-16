document.write("<script type='text/javascript' src='script.js'><"+"/script>");  
var tmp=document.getElementById("val").innerHTML;
var data = tmp;

// var data = time_knowing();
// var data=document.getElementById("val");

// data에 값을 꾸준히 넣어서 그래프에 표시되도록 해야한다.

Plotly.plot('chart', [{
y: [data],
type: 'line'
}]);

Plotly.plot('chart2', [{
y: [data],
type: 'line'
}]);

var cnt = 0;
var mainFrame = document.getElementById("val");
var createFrame = document.createElement("div");

setInterval(function () {

Plotly.extendTraces('chart', {
  y: [[data]]
}, [0]);
Plotly.extendTraces('chart', {
  y: [[(-1) * data]]
}, [0]);
cnt += 2;

createFrame.innerHTML = data;
mainFrame.appendChild(createFrame);

if (cnt > 30) {
  Plotly.relayout('chart', {
    xaxis: {
      range: [cnt - 30, cnt]
    }
  })
}
}, 100);

setInterval(function () {
  Plotly.extendTraces('chart2', {
    y: [
      [data]
    ]
  }, [0]);
}, 100);
