var Slider = function(x,y,w,h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.v = 0.5;
  self.draw = function(canv)
  {
    canv.context.strokeRect(self.x,self.y+self.h/2-1,self.w,2);
    canv.context.strokeRect(self.x+self.v*self.w-2,self.y,4,self.h);
  }

  self.dragging = false;
  self.dragStart = function(evt)
  {
    if(ptNear(evt.doX,evt.doY,self.x+self.v*self.w,self.y+self.h/2,10))
      self.dragging = true;
  }
  self.drag = function(evt)
  {
    self.v = (evt.doX-self.x)/self.w;
    if(self.v < 0) self.v = 0;
    if(self.v > 1) self.v = 1;
  }
  self.dragFinish = function()
  {
    self.dragging = false;
  }
}
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

  self.m_slider = new Slider(0,0,100,10);
  self.p_slider = new Slider(0,0,100,10);
  self.f_slider = new Slider(0,0,100,10);

  var UI_MODE_COUNT = 0;
  var UI_MODE_RUN = UI_MODE_COUNT; UI_MODE_COUNT++;
  var UI_MODE_ALL = UI_MODE_COUNT; UI_MODE_COUNT++;
  var UI_MODE_CAR = UI_MODE_COUNT; UI_MODE_COUNT++;
  self.mode = UI_MODE_RUN;

  self.draw = function(canv)
  {
    var old_font = canv.context.font;
    var font_size = 0;
    var y_offset = 0;
    var x_offset = 0;

    y_offset = 20;
    canv.context.lineWidth = 1;
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
    canv.context.lineWidth = 3;
    drawPt(canv,[self.x+self.w/2,self.y+40],30);
    canv.context.save();
    canv.context.beginPath();
    canv.context.moveTo(self.x,(self.y+40+30)-((self.sportsmath.speed/10)*60));
    canv.context.lineTo(self.x+self.w,(self.y+40+30)-((self.sportsmath.speed/10)*60));
    canv.context.lineTo(self.x+self.w,self.y+40+30);
    canv.context.lineTo(self.x,self.y+40+30);
    canv.context.clip();
    drawPt(canv,[self.x+self.w/2,self.y+40],30);
    canv.context.fillStyle = car.color.replace("00","55").replace("00","55");
    canv.context.fill();
    canv.context.restore();

    font_size = 30;
    canv.context.font = font_size+"px Helvetica";
    canv.context.fillStyle = self.car.color;
    canv.context.textAlign = "center";
    canv.context.fillText(self.c,self.x+self.w/2,self.y+y_offset+font_size-4);
    y_offset += font_size*1.5;

    if(left)
    {
      canv.context.textAlign = "left";
      x_offset = 10;
    }
    else
    {
      canv.context.textAlign = "right";
      x_offset = self.w-10;
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
        canv.context.fillText("AvgTime:"+Math.round(self.sportsmath.avgtime),self.x+x_offset,self.y+y_offset+font_size);
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
      case UI_MODE_ALL:
        font_size = 20;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("ALL",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("TopScore:"+Math.round(self.sportsmath.best_score),self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("BestTime:"+self.sportsmath.best_time,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("MostLaps:"+self.sportsmath.best_nlaps,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        y_offset += font_size;

        var tscore = self.sportsmath.score;
        for(var i = 0; i < self.sportsmath.scores.length; i++)
          tscore += self.sportsmath.scores[i];
        tscore = Math.round(tscore);
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Total Score:"+tscore,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        var tlaps = self.sportsmath.nlap;
        for(var i = 0; i < self.sportsmath.nlaps.length; i++)
          tlaps += self.sportsmath.nlaps[i];
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Total Laps:"+tlaps,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Total Wrecks:"+self.sportsmath.nlaps.length,self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        break;
      case UI_MODE_CAR:
        font_size = 20;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("CAR",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillStyle = "#FF00FF";
        canv.context.fillText("Speed:"+Math.round(self.sportsmath.speed*10)/10+"m/s",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Top:"+Math.round(self.sportsmath.top_speed*10)/10+"m/s",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillStyle = "#00FFFF";
        canv.context.fillText("Accel:"+Math.round(self.sportsmath.accel*1000)/1000+"m/s/s",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Top:"+Math.round(self.sportsmath.top_accel*1000)/1000+"m/s/s",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        y_offset += font_size;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillStyle = "#00FF00";
        canv.context.fillText("Friction:"+Math.round(self.sportsmath.fric*10)/10+"N",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Top:"+Math.round(self.sportsmath.top_fric*10)/10+"N",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        y_offset += font_size;

        /*
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("KinEnergy:"+Math.round(self.sportsmath.energy*10)/10+"J",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;
        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillText("Top:"+Math.round(self.sportsmath.top_energy*10)/10+"J",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        y_offset += font_size;
        */

        //Energy
        /* hack */
        self.car.mass = 5 + (self.m_slider.v * 20);
        self.sportsmath.mass = self.car.mass;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillStyle = "#000000";
        canv.context.fillText("Mass:"+Math.round(self.sportsmath.mass*10)/10+"kg",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        if(left) self.m_slider.x = self.x+x_offset;
        else     self.m_slider.x = self.x+x_offset-100;
        self.m_slider.y = self.y+y_offset;
        self.m_slider.w = 100;
        self.m_slider.draw(canv);

        y_offset += font_size;

        //Power
        /* hack */
        self.car.impulse = 0.2 + (self.p_slider.v * 4);
        self.sportsmath.impulse = self.car.impulse;

        font_size = 15;
        canv.context.font = font_size+"px Helvetica";
        canv.context.fillStyle = "#000000";
        canv.context.fillText("Power:"+Math.round(self.sportsmath.impulse*10)/10+"N",self.x+x_offset,self.y+y_offset+font_size);
        y_offset += font_size;

        if(left) self.p_slider.x = self.x+x_offset;
        else     self.p_slider.x = self.x+x_offset-100;
        self.p_slider.y = self.y+y_offset;
        self.p_slider.w = 100;
        self.p_slider.draw(canv);

        y_offset += font_size;

/*
        if(left) self.f_slider.x = self.x+x_offset;
        else     self.f_slider.x = self.x+x_offset-100;
        self.f_slider.y = self.y+y_offset;
        self.f_slider.w = 100;
        self.f_slider.draw(canv);
*/

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

