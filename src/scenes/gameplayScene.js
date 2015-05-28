var GamePlayScene = function(game, stage)
{
  var self = this;

  var keyer;

  var spline;
  var track;
  var cars = [];
  var sportsmath = [];
  var controller;

  self.ready = function()
  {
    keyer = new Keyer({source:stage.dispCanv.canvas});
    spline = new Spline(
     derivePtsFromPtsMode([
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
      [84,96] ], PTS_MODE_CUBIC_BEZIER, true),
    4,1);
    track = new Track(spline,0,0,stage.drawCanv.canvas.width,stage.drawCanv.canvas.height);
    for(var i = 0; i < 2; i++)
      cars[i] = new Car(spline);
    for(var i = 0; i < cars.length; i++)
      sportsmath[i] = new SportsMath(cars[i],stage.drawCanv.canvas.width-100, 120, 100, 500);
    controller = new Controller(cars[0], cars[1]);

    keyer.register(controller);

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
    controller.tick();
    for(var i = 0; i < cars.length; i++)
      cars[i].tick();
    for(var i = 0; i < sportsmath.length; i++)
      sportsmath[i].tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    for(var i = 0; i < cars.length; i++)
      cars[i].draw(canv);
    for(var i = 0; i < sportsmath.length; i++)
      sportsmath[i].draw(canv);
  };

  self.cleanup = function()
  {
  };
};

