var UI = function(car, controller, sportsmath, x,y,w,h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.car = car;
  self.controller = controller;
  self.sportsmath = sportsmath;
  self.key = String.fromCharCode(self.controller.k).toLowerCase();

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
    canv.context.fillStyle = self.car.color;
    canv.context.fillText(self.key,self.x+self.w/2-(font_size/2),self.y+font_size);
    y_offset += font_size;

    canv.context.fillStyle = "#000000";
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

