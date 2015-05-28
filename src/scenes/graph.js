var SimpGraph = function(x,y,w,h,min,max,color)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.min = min;
  self.max = max;
  self.color = color;

  self.canv = [];
  self.canv[0] = new Canv({width:self.w,height:self.h});
  self.canv[1] = new Canv({width:self.w,height:self.h});
  self.canv[0].clear();
  self.canv[1].clear();
  self.canv[0].context.fillStyle   = self.color;
  self.canv[0].context.strokeStyle = self.color;
  self.canv[1].context.fillStyle   = self.color;
  self.canv[1].context.strokeStyle = self.color;
  self.curcanv = 0;

  self.plot = function(n)
  {
    self.canv[(self.curcanv+1)%2].clear();
    self.canv[(self.curcanv+1)%2].context.drawImage(self.canv[self.curcanv].canvas, 0, 0, self.w, self.h, 2, 0, self.w-2, self.h);
    self.curcanv = (self.curcanv+1)%2;

    self.canv[self.curcanv].context.strokeStyle = self.color;
    self.canv[self.curcanv].context.beginPath();
    var y = ((n-self.min)/(self.max-self.min))*self.h
      self.canv[self.curcanv].context.moveTo(0,self.h-y);
    self.canv[self.curcanv].context.lineTo(2,self.h-y);
    self.canv[self.curcanv].context.stroke();
  }
  self.draw = function(canv)
  {
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
    canv.context.drawImage(self.canv[self.curcanv].canvas, 0, 0, self.w, self.h, self.x, self.y, self.w, self.h);
  }
}
