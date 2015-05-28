var Track = function(spline,x,y,w,h)
{
  var self = this;

  self.spline = spline;
  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.canv = new Canv({width:self.w,height:self.h});
  var stampSpline = function(c,s,r,w)
  {
    var pt = [0,0];
    c.context.lineWidth = w;
    c.context.beginPath();

    pt = s.ptForT(0);
    c.context.moveTo(pt[0],pt[1]);
    for(var i = 1; i < r; i++)
    {
      pt = s.ptForT(i/r);
      c.context.lineTo(pt[0],pt[1]);
    }
    pt = s.ptForT(1);
    c.context.lineTo(pt[0],pt[1]);

    c.context.stroke();
  }
  self.refreshCanv = function()
  {
    self.canv.clear();
    self.canv.context.strokeStyle = "#999999";
    stampSpline(self.canv,self.spline,1000,20);
    self.canv.context.strokeStyle = "#000000";
    stampSpline(self.canv,self.spline,1000,1);
  }
  self.refreshCanv();

  self.draw = function(canv)
  {
    canv.context.drawImage(self.canv.canvas, 0, 0, self.canv.canvas.width, self.canv.canvas.height, self.x, self.y, self.w, self.h);
  }
}

