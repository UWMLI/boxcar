var Controller = function(car, key)
{
  var self = this;

  self.k = key;
  self.car = car;
  self.down = false;

  self.key = function(k) { }
  self.key_letter = function(k) { }
  self.key_down = function(e)
  {
    if(e.keyCode == self.k)
    {
      if(!self.down && !self.car.on_track)
        self.car.resetOnSpline();
      self.down = true;
    }
  }
  self.key_up = function(e)
  {
    if(e.keyCode == self.k)
      self.down = false;
  }

  self.tick = function()
  {
    if(self.down) self.car.applyForce(2);
  }
}

