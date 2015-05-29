var SportsMath = function(car,controller,x,y,w,h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.car = car;
  self.controller = controller;
  self.checkpt = false; //greater than half way around the track; used to measure laps

  self.time = 0;
  self.times = [];
  self.best_time = 999999;

  self.nlap = 0;
  self.nlaps = [];
  self.best_nlaps = 0;

  self.avgtime = 0;
  self.score = 0;
  self.scores = [];
  self.best_score = 0;

  self.top_speed = 0;

  self.tick = function()
  {
    self.time++;

    //potential race condition...
    //car gets half way, falls off, resets back on before i see its off
    if(!self.car.on_track)
    {
      self.nlaps.push(self.nlap);
      self.nlap = 0;

      self.scores.push(self.score);
      self.score = 0;

      self.avgtime = 0;

      self.time = 0;

      self.checkpt = false;
    }

    if(self.car.spline_t > 0.5)
      self.checkpt = true;
    if(self.checkpt && self.car.spline_t < 0.5)
    {
      self.checkpt = false;
      self.lap();
    }
  }
  self.lap = function()
  {
    if(self.time < 20) { self.time = 0; return; } //bad lap reading

    if(self.time < self.best_time)
      self.best_time = self.time;
    self.times.push(self.time);
    self.time = 0;

    self.nlap++;
    if(self.nlap > self.best_nlaps)
      self.best_nlaps = self.nlap;

    self.avgtime = 0;
    for(var i = 0; i < self.nlap; i++)
      self.avgtime += self.times[self.times.length-1-i];
    self.avgtime /= self.nlap;

    self.score = Math.floor(Math.pow(self.nlap,1.5)) * ((self.avgtime > 500) ? 1 : 500-self.avgtime);
    if(self.score > self.best_score)
      self.best_score = self.score;
  }
}

