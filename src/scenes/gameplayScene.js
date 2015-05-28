var GamePlayScene = function(game, stage)
{
  var self = this;

  var keyer;

  var spline;
  var track;
  var cars = [];
  var sportsmath = [];
  var controllers = [];
  var uis = [];

/*
 var x = [
  [240,15],
  [305,12],
  [405,25],
  [452,68],
  [514,148],
  [524,200],
  [472,285],
  [423,284],
  [376,235],
  [345,187],
  [261,145],
  [236,175],
  [218,248],
  [176,272],
  [65,260],
  [39,197],
  [30,86],
  [84,96] ];
  console.log("[");
  for(var i = 0; i < x.length; i++)
  {
    console.log("["+x[i][0]/550+","+x[i][1]/320+"],");
  }
*/



  self.ready = function()
  {
    keyer = new Keyer({source:stage.dispCanv.canvas});
    var pts = derivePtsFromPtsMode([
       [0.43636363636363634,0.046875],
       [0.5545454545454546,0.0375],
       [0.7363636363636363,0.078125],
       [0.8218181818181818,0.2125],
       [0.9345454545454546,0.4625],
       [0.9527272727272728,0.625],
       [0.8581818181818182,0.890625],
       [0.769090909090909,0.8875],
       [0.6836363636363636,0.734375],
       [0.6272727272727273,0.584375],
       [0.47454545454545455,0.453125],
       [0.4290909090909091,0.546875],
       [0.39636363636363636,0.775],
       [0.32,0.85],
       [0.11818181818181818,0.8125],
       [0.07090909090909091,0.615625],
       [0.05454545454545454,0.26875],
       [0.15272727272727274,0.3]
       ], PTS_MODE_CUBIC_BEZIER, true);
    for(var i = 0; i < pts.length-1; i++)
    {
      pts[i][0] *= stage.drawCanv.canvas.width-200;
      pts[i][1] *= stage.drawCanv.canvas.height-40;
    }
    spline = new Spline(
    pts,
    4,1);
    track = new Track(spline,100,20,stage.drawCanv.canvas.width-200,stage.drawCanv.canvas.height-40);
    for(var i = 0; i < 2; i++)
    {
      cars[i] = new Car(track,(i == 0 ? "#FF0000" : "#0000FF"));
      controllers[i] = new Controller(cars[i], (i == 0 ? 81 : 80));
      keyer.register(controllers[i]);
      sportsmath[i] = new SportsMath(cars[i], controllers[i], stage.drawCanv.canvas.width-100, 120, 100, 500);
      uis[i] = new UI(cars[i], controllers[i], sportsmath[i], i*(stage.drawCanv.canvas.width-200),0,200,400);
    }

    var pt = spline.ptForT(0);
    for(var i = 0; i < cars.length; i++)
    {
      cars[i].x = pt[0];
      cars[i].y = pt[1];
    }
  };

  self.tick = function()
  {
    keyer.flush();
    for(var i = 0; i < cars.length; i++)
    {
      controllers[i].tick();
      cars[i].tick();
      sportsmath[i].tick();
    }
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    for(var i = 0; i < cars.length; i++)
    {
      cars[i].draw(canv);
      uis[i].draw(canv);
    }
  };

  self.cleanup = function()
  {
  };
};

