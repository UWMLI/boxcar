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

  var UI = function(car, controller, sportsmath, key, x,y,w,h)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.car = car;
    self.controller = controller;
    self.sportsmath = sportsmath;
    self.key = key;

    var UI_MODE_COUNT = 0;
    var UI_MODE_TIME  = UI_MODE_COUNT; UI_MODE_COUNT++;
    var UI_MODE_LAPS  = UI_MODE_COUNT; UI_MODE_COUNT++;
    var UI_MODE_SCORE = UI_MODE_COUNT; UI_MODE_COUNT++;
    self.mode = UI_MODE_TIME;

    self.draw = function(canv)
    {
      var old_font = canv.context.font;
      var font_size = 0;
      var y_offset = 0;

      font_size = 30;
      canv.context.font = font_size+"px Helvetica";
      canv.context.fillText(self.key,self.x+self.w/2-(font_size/2),self.y+font_size);
      y_offset += font_size;

      switch(self.mode)
      {
        case UI_MODE_TIME:
          font_size = 20;
          canv.context.fillText("TIME",self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Time:"+self.sportsmath.time,self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Best:"+self.sportsmath.best_time,self.x,self.y+y_offset+font_size);
          y_offset += font_size;

/*
          for(var i = 0; i < self.times.length; i++)
          {
            canv.context.fillText((self.times.length-i)+": "+self.times[self.times.length-i-1],self.x,y);
            y+=20;
          }
*/

          break;
        case UI_MODE_LAPS:
          font_size = 20;
          canv.context.fillText("LAPS",self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Laps:"+self.sportsmath.nlap,self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Best:"+self.sportsmath.best_nlaps,self.x,self.y+y_offset+font_size);
          y_offset += font_size;
          break;
        case UI_MODE_SCORE:
          font_size = 20;
          canv.context.fillText("SCORE",self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Score:"+self.sportsmath.score,self.x,self.y+y_offset+font_size);
          y_offset += font_size;

          font_size = 15;
          canv.context.fillText("Best:"+self.sportsmath.best_score,self.x,self.y+y_offset+font_size);
          y_offset += font_size;
          break;
      }

      canv.context.font = old_font;
    }
  }

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
       ], PTS_MODE_CUBIC_BEZIER, true)
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
      cars[i] = new Car(track);
      controllers[i] = new Controller(cars[i], (i == 0 ? 80 : 81));
      keyer.register(controllers[i]);
      sportsmath[i] = new SportsMath(cars[i], controllers[i], stage.drawCanv.canvas.width-100, 120, 100, 500);
      uis[i] = new UI(cars[i], controllers[i], sportsmath[i], i ? 'p' : 'q', i*(stage.drawCanv.canvas.width-200),0,200,400);
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

