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
           if(i == 0)  canv.context.strokeStyle = on;
      else if(i == 1)  canv.context.strokeStyle = tan;
      else if(i == 2)  canv.context.strokeStyle = tan;
      else if(i == 3)  canv.context.strokeStyle = on;
      else if((i-3)%2) canv.context.strokeStyle = tan;
      else             canv.context.strokeStyle = on;

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

