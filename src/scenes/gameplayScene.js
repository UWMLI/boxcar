var GamePlayScene = function(game, stage)
{
  var self = this;

  var keyer;

  var spline;
  var track;
  var car1;
  var car2;
  var sportsmath;
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
    car1 = new Car(spline);
    car2 = new Car(spline);
    controller = new Controller(car1, car2);
    sportsmath = new SportsMath(car1,stage.drawCanv.canvas.width-100, 120, 100, 500);
    sportsmath = new SportsMath(car2,stage.drawCanv.canvas.width-100, 120, 100, 500);

    keyer.register(controller);

    var pt = spline.ptForT(0);
    car1.x = pt[0];
    car1.y = pt[1];
    car2.x = pt[0];
    car2.y = pt[1];
  };

  self.tick = function()
  {
    keyer.flush();
    sportsmath.tick();
    controller.tick();
    car1.tick();
    car2.tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    car1.draw(canv);
    car2.draw(canv);
    sportsmath.draw(canv);
  };

  self.cleanup = function()
  {
  };
};

