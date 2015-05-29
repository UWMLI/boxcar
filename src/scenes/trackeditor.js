var TrackEditor = function(x,y,w,h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.spline;

  self.seed_pts =
  [
  [0.4840909090909091,0.27],
  [0.57,0.215],
  [0.725909090909091,0.25],
  [0.7736363636363636,0.3175],
  [0.7895454545454546,0.515],
  [0.7990909090909091,0.6399999999999999],
  [0.7354545454545454,0.7775],
  [0.6686363636363637,0.8],
  [0.6285454545454544,0.6640625],
  [0.6145454545454545,0.5675],
  [0.5079545454545454,0.5099999999999999],
  [0.431590909090909,0.535],
  [0.38545454545454544,0.7274999999999999],
  [0.31545454545454543,0.76],
  [0.23272727272727273,0.58],
  [0.2152272727272727,0.475],
  [0.2868181818181818,0.29],
  [0.3615909090909091,0.22749999999999998]
  ];

/*
  for(var i = 0; i < self.seed_pts.length; i++)
  {
    console.log("["+((0.7*(self.seed_pts[i][0]))+0.15)+","+((0.7*(self.seed_pts[i][1]))+0.15)+"],");
  }
*/

  self.scaled_seed_pts = [];
  for(var i = 0; i < self.seed_pts.length; i++)
    self.scaled_seed_pts[i] = [0,0]; //fill with garbage to alloc mem

  self.scale_seeds = function()
  {
    for(var i = 0; i < self.seed_pts.length; i++)
    {
      copy(self.seed_pts[i],self.scaled_seed_pts[i]);
      self.scaled_seed_pts[i][0] *= self.w;
      self.scaled_seed_pts[i][1] *= self.h;
      self.scaled_seed_pts[i][0] += self.x;
      self.scaled_seed_pts[i][1] += self.y;
    }
  }
  self.seed_scales = function()
  {
    for(var i = 0; i < self.seed_pts.length; i++)
    {
      copy(self.scaled_seed_pts[i],self.seed_pts[i]);
      self.seed_pts[i][0] -= self.x;
      self.seed_pts[i][1] -= self.y;
      self.seed_pts[i][0] /= self.w;
      self.seed_pts[i][1] /= self.h;
    }
  }
  self.scale_seeds();

  self.dirty = true;
  self.updated = false;
  self.dragging = -1;

  self.draw = function(canv)
  {
    if(!self.hovering) return;
    var on  = "#00FF00";
    var tan = "#FF0000";
    var black = "#000000";
    var tpt = [];
    for(var i = 0; i < self.scaled_seed_pts.length; i+=2)
    {
      canv.context.strokeStyle = on;
      drawPt(canv,self.scaled_seed_pts[i],2);
      canv.context.strokeStyle = tan;
      drawPt(canv,self.scaled_seed_pts[i+1],2);
      self.spline.interpAPt(self.scaled_seed_pts[i+1],self.scaled_seed_pts[i],2,tpt);
      //drawPt(canv,tpt,2);

      canv.context.lineWidth = 1;
      canv.context.strokeStyle = black;
      canv.context.beginPath();
      canv.context.moveTo(self.scaled_seed_pts[i+1][0],self.scaled_seed_pts[i+1][1]);
      canv.context.lineTo(tpt[0],tpt[1]);
      canv.context.stroke();
    }
  }

  self.tick = function()
  {
    if(self.dirty)
    {
      self.dirty = false;

      var pts_cpy = [];
      for(var i = 0; i < self.seed_pts.length; i++)
      {
        pts_cpy.push(copy(self.seed_pts[i],[0,0]));
        pts_cpy[i][0] *= self.w;
        pts_cpy[i][1] *= self.h;
      }

      var derivedPts = derivePtsFromPtsMode(pts_cpy, PTS_MODE_CUBIC_BEZIER, true);
      self.spline = new Spline(derivedPts, 4,1);

      self.updated = true;
    }
  }

  self.dragStart = function(evt)
  {
    for(var i = 0; i < self.scaled_seed_pts.length; i++)
    {
      if(ptNear(evt.doX,evt.doY,self.scaled_seed_pts[i][0],self.scaled_seed_pts[i][1],10))
        self.dragging = i;
    }
  }
  self.drag = function(evt)
  {
    if(self.dragging != -1)
    {
      if(self.dragging%2 == 0) //origin pt, apply delta to handle
      {
        self.scaled_seed_pts[self.dragging+1][0] += evt.doX-self.scaled_seed_pts[self.dragging][0];
        self.scaled_seed_pts[self.dragging+1][1] += evt.doY-self.scaled_seed_pts[self.dragging][1];
      }
      self.scaled_seed_pts[self.dragging][0] = evt.doX;
      self.scaled_seed_pts[self.dragging][1] = evt.doY;
    }
      self.seed_scales();
      self.dirty = true;
  }
  self.dragFinish = function()
  {
    if(self.dragging != -1)
    {
      self.seed_scales();
      self.dirty = true;
    }
    self.dragging = -1;
  }

  self.hovering = false;
  self.hover = function()
  {
    self.hovering = true;
  }
  self.unhover = function()
  {
    self.hovering = false;
  }
}

