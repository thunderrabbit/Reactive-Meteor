//Mongodb Collections
var Circles     = new Meteor.Collection('circles');
var Colorful    = new Meteor.Collection('colorfulcircles');
var TextValues  = new Meteor.Collection('textvalues');
var GaugeValues = new Meteor.Collection('gaugevalues');
var ChartValues = new Meteor.Collection('chartvalues');

var textArray   = ["Sam", "Sarah", "Dwight", "Bandit", "Michael"];
var circleArray = [5,10,15,20,25,30];
var gaugeArray  = [1,90,14,56,22,100,0,150,180,90,44,200];
var chartArray  = [0.1,0.5,0.15,0.2,0.4,0.3,0.5,0.34];

// Each of these represents a different record in the DB
var colorfulCircleArray  = [
{r: 5, c:'#ffffff'},
{r:10, c:'#ff00ff'},
{r:15, c:'#ffff00'},
{r:20, c:'#00ffff'},
{r:25, c:'#f00fff'},
];

/*****************************METEOR SERVER CODE******************************/
if (Meteor.isServer) {
  Meteor.startup(function () {
    //Populate Circles database with initial values
    if (Circles.find().count() === 0) {
      Circles.insert({data: circleArray });
    }
    //Populate ColorfulCircles database with initial values
    if (Colorful.find().count() === 0) {
      // Create a record for each item in the array
      colorfulCircleArray.forEach(function(item) {
        Colorful.insert(item);
      })
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
