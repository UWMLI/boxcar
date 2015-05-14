var GamePlayScene = function(game, stage)
{
  var self = this;

  var clicker;
  var dragger;
  var hoverer;
  var drawer;

  var Ob = function()
  {
    var self = this;

    self.x = 100;
    self.y = 100;
    self.vx = 0;
    self.vy = 0;
    self.ax = 0;
    self.ay = 0;
    self.fx = 10;
    self.fy = 0;

    self.r = 10;
    self.m = 100;
    self.e = 0;

    self.collidesOb = function(ob, solve)
    {
      if(Math.abs(self.x-ob.x) < self.r &&
         Math.abs(self.y-ob.y) < self.r)
      {
        if(solve)
        {

        }
        return true;
      }
      return false;
    }
    self.collidesInRect = function(x,y,w,h, solve)
    {
      if(self.x+self.r > x && self.x-self.r < x+w &&
         self.y+self.r > y && self.y-self.r < y+h)
      {
        if(solve)
        {

        }
        return true;
      }
      return false;
    }
    self.collidesOutRect = function(x,y,w,h, solve)
    {
      if(self.x-self.r < x || self.x+self.r > x+w ||
         self.y-self.r < y || self.y+self.r > y+h)
      {
        if(solve)
        {

        }
        return true;
      }
      return false;
    }

    self.tick = function()
    {
      self.resolveCollisions([]);
      self.resolveForces();
      self.resolveAccelleration();
      self.resolveVelocity();
    }
    self.resolveCollisions = function(obs)
    {
      for(var i = 0; i < obs.length; i++)
      {

      }
    }
    self.resolveForces = function()
    {
      self.ax += self.fx/self.m;
      self.ay += self.fy/self.m;

      self.fx = 0;
      self.fy = 0;
    }
    self.resolveAccelleration = function()
    {
      self.vx += self.ax;
      self.vy += self.ay;

      var v_squared = self.vx*self.vx+self.vy*self.vy;
      self.e = self.m*v_squared/2;

      self.ax = 0;
      self.ay = 0;
    }
    self.resolveVelocity = function()
    {
      self.x += self.vx;
      self.y += self.vy;
    }

    self.draw = function(canv)
    {
      canv.context.beginPath();
      canv.context.arc(self.x,self.y,self.r,0,2*Math.PI);
      canv.context.stroke();
    }
  };

  var o;
  var s;
  //var ps;
  var ptr;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    hoverer = new Hoverer({source:stage.dispCanv.canvas});

    o = new Ob();
    s = new Spline(
     derivePtsFromPtsMode([ [240,15], [305,12], [405,25], [452,68], [514,148], [524,200], [472,285], [423,284], [376,235], [345,187], [261,145], [236,175], [218,248], [176,272], [65,260], [39,197], [30,86], [84,96] ], PTS_MODE_CUBIC_BEZIER, true),
    4,1);

    ptr = new Ptr(0,0,stage.dispCanv.canvas.width,stage.dispCanv.canvas.height);
    hoverer.register(ptr);
    clicker.register(ptr);
/*
    ps = [];
    for(var i = 0; i < 20; i++)
    {
      ps.push(new Placer({},i*10,i*10,20,20));
      var p = ps[i];
      p.text = ""+i;
      dragger.register(p);
      clicker.register(p);
    }
*/
  };

  var t = 0;
  var ti = 0;
  self.tick = function()
  {
    o.tick();
    t += 0.001;
    ti++;
    if(t > 1) t = 0;
    dragger.flush();
    hoverer.flush();
    clicker.flush();
    /*
    if(ti%10 == 0)
    {
      var ptz = [];
      for(var i = 0; i < ps.length; i++)
        ptz.push([ps[i].x,ps[i].y]);
      s.pts = derivePtsFromPtsMode(ptz, PTS_MODE_CUBIC_BEZIER);
      s.refreshSettings();
    }
    */
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    o.draw(canv);

    var pt = s.ptForT(t);
    canv.context.beginPath();
    canv.context.arc(pt[0],pt[1],5,0,2*Math.PI);
    canv.context.stroke();
    //Debug Spline
    for(var i = 0; i < s.pts.length; i++)
    {
      if(i%3 == 0) canv.context.strokeStyle = "#FF0000";
      canv.context.beginPath();
      canv.context.arc(s.pts[i][0],s.pts[i][1],2,0,2*Math.PI);
      canv.context.stroke();
      canv.context.strokeStyle = "#000000";
    }
    for(var i = 0; i < s.derivedPts.length; i++)
    {
      for(var j = 0; j < s.derivedPts[i].length; j++)
      {
        for(var k = 0; k < s.derivedPts[i][j].length-1; k++)
        {
          canv.context.beginPath();
          canv.context.moveTo(s.derivedPts[i][j][k][0],s.derivedPts[i][j][k][1]);
          canv.context.lineTo(s.derivedPts[i][j][k+1][0],s.derivedPts[i][j][k+1][1]);
          canv.context.stroke();
        }
      }
    }
    /*
    for(var i = 0; i < ps.length; i++)
      ps[i].draw(canv);
    */
  };

  self.cleanup = function()
  {
  };

};

