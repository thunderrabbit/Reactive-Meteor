//Mongodb Collections
var Circles     = new Meteor.Collection('circles');
var TextValues  = new Meteor.Collection('textvalues');
var GaugeValues = new Meteor.Collection('gaugevalues');
var ChartValues = new Meteor.Collection('chartvalues');

var textArray   = ["Sam", "Sarah", "Dwight", "Bandit", "Michael"];
var gaugeArray  = [1,90,14,56,22,100,0,150,180,90,44,200];
var chartArray  = [0.1,0.5,0.15,0.2,0.4,0.3,0.5,0.34];

/*****************************METEOR SERVER CODE******************************/
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Circles.find().count() === 0) {
      Circles.insert({data: [5,10,15,20,25,30]});
    }
    //Populate TextValues database with initial values
    if (TextValues.find().count() === 0) {
      TextValues.insert({data: textArray });
    }
    
    //Populate GaugeValues database with initial values
    if (GaugeValues.find().count() === 0) {
      GaugeValues.insert({data: gaugeArray });
    }
    
    //Populate ChartValues database with initial values
    if (ChartValues.find().count() === 0) {
      ChartValues.insert({data: chartArray });
    }
  });

//This function just updates the circles and text collections every 2 seconds
  Meteor.setInterval(function () {
    
    //Shuffle Circles and change collection to shuffled
    var newCircleData = _.shuffle(Circles.findOne().data);
    Circles.update({}, {data: newCircleData});
    
    //Select random array member and change collection to it
    var randomIndex = Math.floor( Math.random() * textArray.length );
    var element = textArray[randomIndex];
    TextValues.update({}, {data: element});
    
    //Select random data value and change collection to it
    var randomIndex2 = Math.floor( Math.random() * gaugeArray.length );
    var dataPoint = gaugeArray[randomIndex2];
    GaugeValues.update({}, {data: dataPoint});
    
    //Select random data value and change collection to it
    var randomIndex3 = Math.floor( Math.random() * chartArray.length );
    var dataPoint2 = chartArray[randomIndex3];
    ChartValues.update({}, {data: dataPoint2});
    
  }, 1000);
}


/*****************************METEOR CLIENT CODE******************************/
if (Meteor.isClient) {
  
    // Template Helpers
    Template.textTemplate.helpers({
      latestData: function () {
        return Session.get("latestData");
      }
    });
    
    Template.gaugeDemo.rendered = function () {
        buildGauge(); //When template has rendered build the gauge
    }
    
   Template.chartDemo.rendered = function () {
        buildChart(); //When template has rendered build the chart
    }
    
    //Check Circle Template is rendered
    Template.circlesTemplate.rendered = function () {
    
    var svg, width = 500, height = 75, x;

    svg = d3.select('#circles').append('svg')
      .attr('width', width)
      .attr('height', height);

    var drawCircles = function (update) {
      var data = Circles.findOne().data;
      var circles = svg.selectAll('circle').data(data);
      if (!update) {
        circles = circles.enter().append('circle')
          .attr('cx', function (d, i) { return x(i); })
          .attr('cy', height / 2);
      } else {
        circles = circles.transition().duration(1000);
      }
      circles.attr('r', function (d) { return d; });
    };   

   //Circles Observer
    Circles.find().observe({
      added: function () {
        x = d3.scale.ordinal()
          .domain(d3.range(Circles.findOne().data.length))
          .rangePoints([0, width], 1);
        drawCircles(false);
      },
      changed: _.partial(drawCircles, true)
    });
  };
    
    //TextValues Observer
    TextValues.find().observe({
      added: function (text) {
        //console.log("TextValues Added, Latest Data: ", text.newValue);
      },
      changed: function() {
        var data = TextValues.findOne().data;
        console.log("TextValues Changed, Latest Data: " , data);
        Session.set("latestData", data); 
      }
    });
    
    //GaugeValues Observer
    GaugeValues.find().observe({
      added: function (text) {
        //console.log("TextValues Added, Latest Data: ", text.newValue);
      },
      changed: function() {
        var data = GaugeValues.findOne().data;
        console.log("GaugeValues Changed, Latest Data: " , data);
        
        var chart = $('#container-gauge').highcharts(),
        point,
        newVal,
        inc;
        point = chart.series[0].points[0];
        point.update(data);       
      }
    });  
    
    //ChartValues Observer
    ChartValues.find().observe({
      added: function (text) {
        //console.log("ChartValues Added, Latest Data: ", text.newValue);
      },
      changed: function() {
        var data = ChartValues.findOne().data;
        console.log("ChartValues Changed, Latest Data: " , data);
        
        var chart = $('#container-chart').highcharts(),
        point,
        newVal,
        inc;
        var series = chart.series[0];
        point = chart.series[0].points[0];
        var x = (new Date()).getTime(), // current time
        y = data;
        series.addPoint([x, y], true, true);     
      }
    });    
}



/*
* Function to draw the gauge
*/
function buildGauge() {

  $('#container-gauge').highcharts({
      chart: {
          type: 'solidgauge'
      },
  
      title: null,
  
      pane: {
          center: ['50%', '85%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
              backgroundColor: '#EEE',
              innerRadius: '60%',
              outerRadius: '100%',
              shape: 'arc'
          }
      },
  
      tooltip: {
          enabled: false
      },
  
      yAxis: {
          min: 0,
          max: 200,
          title: {
              text: 'Speed'
          },
  
          stops: [
              [0.1, '#55BF3B'],
              [0.5, '#DDDF0D'],
              [0.9, '#DF5353']
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          title: {
              y: -70
          },
          labels: {
              y: 16
          }
      },
  
      plotOptions: {
          solidgauge: {
              dataLabels: {
                  y: 5,
                  borderWidth: 0,
                  useHTML: true
              }
          }
      },
  
      credits: {
          enabled: false
      },
  
      series: [{
          name: 'Speed',
          data: [80],
          dataLabels: {
              format: '<div style="text-align:center"><span style="font-size:25px;color:#7e7e7e">{y}</span><br/>' +
                  '<span style="font-size:12px;color:silver">km/h</span></div>'
          },
          tooltip: {
              valueSuffix: ' km/h'
          }
      }]
  });
}

/*
* Function to draw the Line Graph
*/
function buildChart() {
   $('#container-chart').highcharts({
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
 
            },
            title: {
                text: 'Live random data'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Random data',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: Math.random()
                        });
                    }
                    return data;
                }())
            }]
        });
}
  
          // // set up the updating of the chart each second
          // var series = this.series[0];
          // setInterval(function () {
          //     var x = (new Date()).getTime(), // current time
          //         y = Math.random();
          //     series.addPoint([x, y], true, true);
          // }, 1000);
  



