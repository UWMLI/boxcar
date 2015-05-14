var GamePlayScene = function(game, stage)
{
  var self = this;

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

  self.ready = function()
  {
    o = new Ob();
    s = new Spline([[100/2,100/2],[200/2,100/2],[200/2,200/2],[300/2,200/2],[300/2,300/2],[400/2,300/2],[400/2,400/2]],4,1);
  };

  var t = 0;
  self.tick = function()
  {
    o.tick();
    t += 0.001;
    if(t > 1) t = 0;
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    o.draw(canv);

    var pt = s.ptForT(t);
    /*
    //Debug Spline
    canv.context.beginPath();
    canv.context.arc(pt[0],pt[1],5,0,2*Math.PI);
    canv.context.stroke();
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
    */
  };

  self.cleanup = function()
  {
  };

};

