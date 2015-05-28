var Controller = function(p1, p2)
{
  var self = this;

  var q = 81;
  var p = 80;

  self.p = [p1,p2];
  self.down = [false,false];

  self.key = function(k) { }
  self.key_letter = function(k) { }
  self.key_down = function(e)
  {
    if(e.keyCode == q)
      self.down[1] = true;
    else if(e.keyCode == p)
      self.down[0] = true;
  }
  self.key_up = function(e)
  {
    if(e.keyCode == q)
      self.down[1] = false;
    else if(e.keyCode == p)
      self.down[0] = false;
  }

  self.tick = function()
  {
    for(var i = 0; i < 2; i++)
      if(self.down[i]) self.p[i].applyForce(2);
  }
}

