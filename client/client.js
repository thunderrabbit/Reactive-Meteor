//Mongodb Collections
var Circles     = new Meteor.Collection('circles');
var Colorful    = new Meteor.Collection('colorfulcircles');
var TextValues  = new Meteor.Collection('textvalues');
var GaugeValues = new Meteor.Collection('gaugevalues');
var ChartValues = new Meteor.Collection('chartvalues');

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
        buildCircles();
    };
    
    //Check Circle Template is rendered
    Template.colorfulCirclesTemplate.rendered = function () {
        buildColorfulCircles();
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
        point;
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
        
        var chart = $('#container-chart').highcharts();
        var series = chart.series[0];
        var x = (new Date()).getTime(), // current time
        y = data;
        series.addPoint([x, y], true, true);     
      }
    });    
}

/*
* Function to draw colorful circles
*/
function buildColorfulCircles() {
    var svg, width = 500, height = 75, x;

    var circleCursor = Colorful.find({});
    var circleNodes = circleCursor.fetch();

    svg = d3.select('#colorful-circles').append('svg')
      .attr('width', width)
      .attr('height', height);

    var drawCircles = function (update) {
      var data = circleCursor.fetch();
      var circles = svg.selectAll('circle').data(data);
      if (!update) {
        circles = circles.enter().append('circle')
          .attr('fill', function(d) {return d.c})
          .attr('cx', function (d, i) { return x(i); })
          .attr('cy', height / 2)
          .on("click", function(d){
            Colorful.update({_id:d._id},{r:Math.random()*90+5,c:d.c});
        });
      } else {
        circles = circles.transition().duration(1000);
      }
      circles.attr('r', function (d) { return d.r; });
    };

   //Colorful Observer
    Colorful.find().observe({
      added: function (doc) {
        circleNodes.push(doc);
        x = d3.scale.ordinal()
          .domain(d3.range(Colorful.find().count()))
          .rangePoints([0, width], 1);
        drawCircles(false);
      },
      changed: function(doc) {
        drawCircles(true);
      }
    });
}

/*
* Function to draw the circles
*/
function buildCircles() {
    var svg, width = 500, height = 75, x;

    svg = d3.select('#circles').append('svg')
      .attr('width', width)
      .attr('height', height);

    var drawCircles = function (update) {
      var data = Circles.findOne().data;
      var circles = svg.selectAll('circle').data(data);
      if (!update) {
        circles = circles.enter().append('circle')
          .attr('class', 'purple')
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

  



