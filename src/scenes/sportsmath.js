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

  self.speed = 0;
  self.top_speed = 0;

  self.accel = 0;
  self.top_accel = 0;

  self.fric = 0;
  self.top_fric = 0;

  self.energy = 0;
  self.top_energy = 0;

  self.mass = 0;

  self.tick = function()
  {
    self.time++;

    self.speed = len(car.vel);
    if(self.speed > self.top_speed)
      self.top_speed = self.speed;

    self.accel = len(car.cacc);
    if(self.accel > self.top_accel)
      self.top_accel = self.accel;

    self.fric = len(car.cffr);
    if(self.fric > self.top_fric)
      self.top_fric = self.fric;

    self.energy = self.car.e;
    if(self.energy > self.top_energy)
      self.top_energy = self.energy;

    self.mass   = self.car.m;

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

