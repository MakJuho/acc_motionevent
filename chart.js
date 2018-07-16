  // document.write('<script type="text/javascript" src="script.js"></script>');
  window.onload = function () {
    // 데이터 값  

    var dps = [{
      x: 0,
      y: 0
    }]; //dataPoints. 
    
    // document.write("<script type='text/javascript' src='script.js'><" + "/script>");

    var chart = new CanvasJS.Chart("chartContainer", {
      title: {
        text: "진동 측정"
      },
      axisX: {
        title: "시간"
      },
      axisY: {
        title: "진동 세기"
      },
      data: [{
        type: "line",
        dataPoints: dps
      }]
    });

    chart.render();

    var xVal = dps.length + 1;
    var yVal = time_knowing();
    var updateInterval = 500;
    

    var updateChart = function () {


      // yVal = time_knowing();
      dps.push({
        x: xVal,
        y: yVal
        
      });
      xVal++;
      if (dps.length > 10) {
        dps.shift();
      }

      chart.render();

      // update chart after specified time. 

    };

    setInterval(function () {
      updateChart()
    }, updateInterval);
  } 