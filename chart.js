
  window.onload = function () {
    // 데이터 값  

    var dps = [{
      x: 0,
      y: 0
    }]; //dataPoints. 

    var chart = new CanvasJS.Chart("chartContainer", {
      title: {
        text: "Live Data"
      },
      axisX: {
        title: "Axis X Title"
      },
      axisY: {
        title: "Units"
      },
      data: [{
        type: "line",
        dataPoints: dps
      }]
    });

    chart.render();

    var xVal = dps.length + 1;
    var yVal = 15;
    var updateInterval = 500;

    var updateChart = function () {


      yVal = time_H();

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