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

  self.ready = function()
  {
    o = new Ob();
  };

  self.tick = function()
  {
    o.tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    o.draw(canv);
  };

  self.cleanup = function()
  {
  };

};

