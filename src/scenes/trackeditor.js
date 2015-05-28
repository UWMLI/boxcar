var TrackEditor = function(w,h)
{
  var self = this;
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

  self.dirty = true;
  self.updated = false;
  self.dragging = -1;

  self.draw = function(canv)
  {
    for(var i = 0; i < self.seed_pts.length; i++)
    {

    }
  }

  self.tick = function()
  {
    if(self.dirty)
    {
      self.dirty = false;

      var derivedPts = derivePtsFromPtsMode(self.seed_pts, PTS_MODE_CUBIC_BEZIER, true);
      for(var i = 0; i < derivedPts.length-1; i++)
      {
        derivedPts[i][0] *= w;
        derivedPts[i][1] *= h;
      }
      self.spline = new Spline(derivedPts, 4,1);

      self.updated = true;
    }
  }
}

