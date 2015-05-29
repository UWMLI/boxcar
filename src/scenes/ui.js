var UI = function(car, controller, sportsmath, x,y,w,h, left, key)
{
  var self = this;

  self.k = key;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.car = car;
  self.controller = controller;
  self.sportsmath = sportsmath;
  self.c = String.fromCharCode(self.controller.k).toLowerCase();

  var UI_MODE_COUNT = 0;
  var UI_MODE_RUN = UI_MODE_COUNT; UI_MODE_COUNT++;
  var UI_MODE_TOP = UI_MODE_COUNT; UI_MODE_COUNT++;
  var UI_MODE_CAR = UI_MODE_COUNT; UI_MODE_COUNT++;
  self.mode = UI_MODE_RUN;

  self.draw = function(canv)
  {
    var old_font = canv.context.font;
    var font_size = 0;
    var y_offset = 0;
    var x_offset = 0;


    font_size = 30;
    canv.context.font = font_size+"px Helvetica";
    canv.context.fillStyle = self.car.color;
    canv.context.textAlign = "center";
    canv.context.fillText(self.c,self.x+self.w/2,self.y+font_size);
    y_offset += font_size;

    if(left)
    {
      canv.context.textAlign = "left";
      x_offset = 0;
    }
    else
    {
      canv.context.textAlign = "right";
      x_offset = self.w;
    }

    canv.context.fillStyle = "#000000";
    switch(self.mode)
    {
      case UI_MODE_RUN:
        font_size = 20;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("RUN",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Score:"+Math.round(self.sportsmath.score),self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Laps:"+self.sportsmath.nlap,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Time (AVG):"+Math.round(self.sportsmath.avgtime),self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText(self.sportsmath.time,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        for(var i = 0; i < self.sportsmath.nlap; i++)
        {
          font_size = 15;
          canv.context.font = font_size+"px Helvetica";
          canv.context.fillText(self.sportsmath.times[self.sportsmath.times.length-(self.sportsmath.nlap-i)],self.x+x_offset,self.y+y_offset+font_size);
          y_offset += font_size;
        }
        break;
      case UI_MODE_TOP:
        font_size = 20;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("TOP",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Score:"+Math.round(self.sportsmath.best_score),self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Time:"+self.sportsmath.best_time,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Laps:"+self.sportsmath.best_nlaps,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        break;
      case UI_MODE_CAR:
        font_size = 20;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("CAR",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Laps:"+self.sportsmath.best_nlaps,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Laps:"+self.sportsmath.best_nlaps,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        break;
    }

    canv.context.font = old_font;
  }

  self.key = function(k)
  {
    if(k.keyCode == self.k)
      self.mode = (self.mode+1)%UI_MODE_COUNT;
  }
  self.key_letter = function(k) { }
  self.key_down = function(e) { }
  self.key_up = function(e) { }
}

