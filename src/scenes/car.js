var Car = function(track, color)
{
  var self = this;

  var pt = [];
  self.track = track;
  self.spline_t = 0;
  self.spline = track.spline;
  self.on_track = true;
  self.color = color;

  self.pos = [0,0]; self.posd = [0,0]; //last position delta
  self.ppo = [0,0]; //projected position
  self.map = [0,0]; //map of projection back to spline
  self.dir = [0,0];
  self.vel = [0,0];
  self.pve = [0,0]; //projected vel
  self.acc = [0,0]; self.cacc = [0,0]; //cached accel for logging
  self.frc = [0,0]; self.cfrc = [0,0]; //cached frc for logging
  self.ffr = [0,0]; self.cffr = [0,0]; //cached ffr for logging //force of friction
  self.afr = [0,0]; self.cafr = [0,0]; //cached afr for logging //accel of friction

  self.x = self.pos[0];
  self.y = self.pos[1];
  self.r = 10; //radius (const)
  self.mass = 15; //mass   (const)
  self.impulse = 2;
  self.energy = 0;  //energy
  self.danger = 0; //about-to-fall-off-ness
  self.maxdanger = 4;//0.9; //when you fall off

  self.charge = function()
  {
    self.applyForce(self.impulse);
  }
  self.applyForce = function(f)
  {
    self.frc[0] += f*self.dir[0];
    self.frc[1] += f*self.dir[1];
  }

  self.collidesCar = function(ob)
  {
    return (Math.abs(self.pos[0]-ob.x) < self.r &&
        Math.abs(self.pos[1]-ob.y) < self.r);
  }
  self.collidesInRect = function(x,y,w,h)
  {
    return(self.pos[0]+self.r > x && self.pos[0]-self.r < x+w &&
        self.pos[1]+self.r > y && self.pos[1]-self.r < y+h);
  }
  self.collidesOutRect = function(x,y,w,h)
  {
    return(self.pos[0]-self.r < x || self.pos[0]+self.r > x+w ||
        self.pos[1]-self.r < y || self.pos[1]+self.r > y+h);
  }

  self.tick = function()
  {
    self.resolveForces();
    self.resolveAccelleration();
    self.resolveVelocity();
  }
  self.resolveForces = function()
  {
    self.frc[0] += self.ffr[0];
    self.frc[1] += self.ffr[1];
    self.acc[0] += self.frc[0]/self.mass;
    self.acc[1] += self.frc[1]/self.mass;

    copy(self.ffr,self.cffr);
    copy(self.frc,self.cfrc);
    self.ffr[0] = 0;
    self.ffr[1] = 0;
    self.frc[0] = 0;
    self.frc[1] = 0;
  }
  self.resolveAccelleration = function()
  {
    self.vel[0] += self.acc[0];
    self.vel[1] += self.acc[1];

    self.energy = self.mass*lensqr(self.vel)/2;

    copy(self.acc,self.cacc);
    self.acc[0] = 0;
    self.acc[1] = 0;
  }
  self.resolveVelocity = function()
  {
    copy(self.pos,self.posd);
    if(self.vel[0] == 0 && self.vel[1] == 0) return;
    if(self.on_track)
    {
      //Find projected pos and map
      var vlen = len(self.vel);
      copy(add(self.pos,self.vel),self.ppo);                               //pos+vel -> ppo
      var tmp_t = self.spline.tForPt(self.ppo,self.spline_t,vlen/100,100); //find closest t for ppo
      copy(self.spline.ptForT(tmp_t),self.map);                            //nearest ppo -> map
      if(iseq(self.map,self.pos)) return;                                  //(if map is pos [no movement] return)

      copy(sub(self.map,self.ppo),self.afr);
      scalmul(copy(self.afr,self.ffr),self.mass);
      self.danger = len(self.ffr);
      if(self.danger > self.maxdanger) self.on_track = false;
      else
      {
        copy(add(self.vel,self.afr),self.vel);
        scalmul(self.vel,0.995);
        copy(add(self.pos,self.vel),self.pos);                     //pos+vel -> pos

        self.spline_t = self.spline.tForPt(self.pos,tmp_t,vlen/100,100);           //find closest t to resulting pos
        copy(self.spline.ptForT(self.spline_t),self.pos);                      //nearest pos -> pos

        copy(sub(self.spline.ptForT(self.spline_t+0.0001),self.pos),self.dir); //pos2pos(next t) -> dir
        norm(self.dir);                                            //normalize d

        copy(proj(self.vel,self.dir),self.vel);                    //project vel onto dir -> vel
      }
    }
    if(!self.on_track)
    {
      self.pos[0] += self.vel[0];
      self.pos[1] += self.vel[1];
      scalmul(self.vel,0.8);
    }
    copy(sub(self.pos,self.posd),self.posd);
  }

  var track_offset = [0,0];
  var offset_pos = [0,0];
  self.draw = function(canv)
  {
    track_offset[0] = self.track.x;
    track_offset[1] = self.track.y;
    copy(add(self.pos,track_offset),offset_pos);

    var d = self.danger/self.maxdanger;
    //canv.context.strokeStyle = "rgba("+Math.floor(d*255)+",0,0,1)";

    //pos
    canv.context.strokeStyle = self.color;
    canv.context.lineWidth = 2+((self.mass-5)/25)*8;
    drawPt(canv,offset_pos,self.r);

    //vel
    canv.context.lineWidth = 2;
    canv.context.strokeStyle = "#FF00FF";
    drawVec(canv,offset_pos,add(offset_pos,scalmul(copy(self.vel,[0,0]),10)));

    //acc
    canv.context.strokeStyle = "#00FFFF";
    drawVec(canv,offset_pos,add(offset_pos,scalmul(copy(self.cacc,[0,0]),10000)));

    //fric
    canv.context.strokeStyle = "#00FF00";
    drawVec(canv,offset_pos,add(offset_pos,scalmul(copy(self.ffr,[0,0]),300)));

    canv.context.strokeStyle = "#000000";
  }

  self.resetOnSpline = function()
  {
    self.spline_t = 0;
    copy(self.spline.ptForT(self.spline_t),self.pos);
    copy(sub(self.spline.ptForT(self.spline_t+0.0001),self.pos),self.dir);
    norm(self.dir);
    self.danger = 0;
    self.on_track = true;

    self.vel = [0,0];
    self.acc = [0,0];
    self.frc = [0,0];
    self.ffr = [0,0];
    self.applyForce(1);
  }
  self.resetOnSpline();
};

