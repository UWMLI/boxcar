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
    [0.4772727272727273,0.17142857142857143],
    [0.6,0.09285714285714286],
    [0.8227272727272728,0.14285714285714285],
    [0.8909090909090909,0.2392857142857143],
    [0.9136363636363637,0.5214285714285715],
    [0.9272727272727272,0.7],
    [0.8363636363636363,0.8964285714285715],
    [0.740909090909091,0.9285714285714286],
    [0.6836363636363635,0.734375],
    [0.6636363636363637,0.5964285714285714],
    [0.5113636363636364,0.5142857142857142],
    [0.4022727272727273,0.55],
    [0.33636363636363636,0.825],
    [0.23636363636363636,0.8714285714285714],
    [0.11818181818181818,0.6142857142857143],
    [0.09318181818181819,0.4642857142857143],
    [0.19545454545454546,0.2],
    [0.30227272727272725,0.11071428571428571]
  ];

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
    var on  = "#00FF00";
    var tan = "#FF0000";
    for(var i = 0; i < self.scaled_seed_pts.length; i++)
    {
      if(i%2) canv.context.strokeStyle = on;
      else    canv.context.strokeStyle = tan;
      drawPt(canv,self.scaled_seed_pts[i],2);
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
      self.scaled_seed_pts[self.dragging][0] = evt.doX;
      self.scaled_seed_pts[self.dragging][1] = evt.doY;
    }
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
}

