var GamePlayScene = function(game, stage)
{
  var self = this;

  var dragger;
  var hoverer;
  var drawer;

  var spline;
  var track;
  var car;
  var sportsmath;

  self.ready = function()
  {
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
    car = new Car(spline);
    sportsmath = new SportsMath(car,stage.drawCanv.canvas.width-100, 120, 100, 500);

    var pt = spline.ptForT(0);
    car.x = pt[0];
    car.y = pt[1];
  };

  self.tick = function()
  {
    sportsmath.tick();
    car.tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    car.draw(canv);
    sportsmath.draw(canv);
  };

  self.cleanup = function()
  {
  };
};

