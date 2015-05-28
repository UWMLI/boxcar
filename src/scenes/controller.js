var Controller = function(p1, p2)
{
  var self = this;

  self.k = [80,81]; //p,q
  self.p = [p1,p2];
  self.down = [false,false];

  self.key = function(k) { }
  self.key_letter = function(k) { }
  self.key_down = function(e)
  {
    for(var i = 0; i < 2; i++)
    {
      if(e.keyCode == self.k[i])
      {
        if(!self.down[i] && !self.p[i].on_track)
          self.p[i].resetOnSpline();
        self.down[i] = true;
      }
    }
  }
  self.key_up = function(e)
  {
    for(var i = 0; i < 2; i++)
    {
      if(e.keyCode == self.k[i])
        self.down[i] = false;
    }
  }

  self.tick = function()
  {
    for(var i = 0; i < 2; i++)
      if(self.down[i]) self.p[i].applyForce(2);
  }
}

