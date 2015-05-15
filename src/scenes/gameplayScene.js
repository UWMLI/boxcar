var GamePlayScene = function(game, stage)
{
  var self = this;

  var presser;
  var dragger;
  var hoverer;
  var drawer;

  var track;
  var c;
  var s;
  var f;
  var g;
  var timer;
  var showgraph = false;

  var Timer = function()
  {
    var self = this;

    self.x = stage.drawCanv.canvas.width-100;
    self.y = 120;
    self.w = 100;
    self.h = 500;

    self.times = [];
    self.t = 0;
    self.best = 9999999;

    self.tick = function()
    {
      self.t++;
    }
    self.lap = function()
    {
      if(self.t < 20) { self.reset(); return; } //bad lap reading
      if(self.t < self.best)
      self.best = self.t;

      self.times.push(self.t);
      self.t = 0;
    }
    self.reset = function()
    {
      self.t = 0;
    }
    self.draw = function(canv)
    {
      if(c.on) canv.context.fillStyle = "#000000";
      else     canv.context.fillStyle = "#FF0000";
      canv.context.fillText("Time: "+self.t,self.x,self.y);
      canv.context.fillText("Best: "+self.best,self.x,self.y+20);
      var y = self.y+40;
      canv.context.fillStyle = "#000000";
      for(var i = 0; i < self.times.length; i++)
      {
        canv.context.fillText((self.times.length-i)+": "+self.times[self.times.length-i-1],self.x,y);
        y+=20;
      }
    }
  }

  var ForceBtn = function()
  {
    var self = this;

    self.x = stage.drawCanv.canvas.width-100;
    self.y = 0;
    self.w = 100;
    self.h = 100;

    self.pressing = false;
    self.press = function(evt)
    {
      if(!self.pressing && !c.on)
      {
        c.resetOnSpline();
        timer.reset();
      }
      self.pressing = true;
    }
    self.unpress = function(evt){ self.pressing = false; }
    self.tick = function(evt) { if(self.pressing) c.applyForce(2); }
    self.draw = function(canv) { canv.context.strokeRect(self.x,self.y,self.w,self.h); }
  }
  var GraphBtn = function()
  {
    var self = this;

    self.x = stage.drawCanv.canvas.width-10;
    self.y = stage.drawCanv.canvas.height-10;
    self.w = 10;
    self.h = 10;

    self.pressing = false;
    self.press = function(evt)
    {
      if(!self.pressing) showgraph = !showgraph;
      self.pressing = true;
    }
    self.unpress = function(evt){ self.pressing = false; }
    self.draw = function(canv) { canv.context.strokeRect(self.x,self.y,self.w,self.h); }
  }

  var SimpGraph = function(x,y,w,h,min,max,color)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.min = min;
    self.max = max;
    self.color = color;

    self.canv = [];
    self.canv[0] = new Canv({width:self.w,height:self.h});
    self.canv[1] = new Canv({width:self.w,height:self.h});
    self.canv[0].clear();
    self.canv[1].clear();
    self.canv[0].context.fillStyle   = self.color;
    self.canv[0].context.strokeStyle = self.color;
    self.canv[1].context.fillStyle   = self.color;
    self.canv[1].context.strokeStyle = self.color;
    self.curcanv = 0

    self.plot = function(n)
    {
      self.canv[(self.curcanv+1)%2].clear();
      self.canv[(self.curcanv+1)%2].context.drawImage(self.canv[self.curcanv].canvas, 0, 0, self.w, self.h, 2, 0, self.w-2, self.h);
      self.curcanv = (self.curcanv+1)%2;

      self.canv[self.curcanv].context.strokeStyle = self.color;
      self.canv[self.curcanv].context.beginPath();
      var y = ((n-self.min)/(self.max-self.min))*self.h
      self.canv[self.curcanv].context.moveTo(0,self.h-y);
      self.canv[self.curcanv].context.lineTo(2,self.h-y);
      self.canv[self.curcanv].context.stroke();
    }
    self.draw = function(canv)
    {
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
      canv.context.drawImage(self.canv[self.curcanv].canvas, 0, 0, self.w, self.h, self.x, self.y, self.w, self.h);
    }
  }

  var Track = function(s)
  {
    var self = this;

    self.s = s;

    self.canv = new Canv({width:stage.drawCanv.canvas.width,height:stage.drawCanv.canvas.height});
    var stampSpline = function(c,s,r,w)
    {
      var pt = [0,0];
      c.context.lineWidth = w;
      c.context.beginPath();

      pt = s.ptForT(0);
      c.context.moveTo(pt[0],pt[1]);
      for(var i = 1; i < r; i++)
      {
        pt = s.ptForT(i/r);
        c.context.lineTo(pt[0],pt[1]);
      }
      pt = s.ptForT(1);
      c.context.lineTo(pt[0],pt[1]);

      c.context.stroke();
    }
    self.refreshCanv = function()
    {
      self.canv.clear();
      self.canv.context.strokeStyle = "#999999";
      stampSpline(self.canv,self.s,1000,20);
      self.canv.context.strokeStyle = "#000000";
      stampSpline(self.canv,self.s,1000,1);
    }
    self.refreshCanv();

    self.draw = function(canv)
    {
      self.canv.blitTo(canv);
    }
  }

  var Car = function(s)
  {
    var self = this;

    var pt = [];
    self.t = 0; //t on spline
    self.gt = false; //"greater than" 0.5 (half way around the track) used to measure laps
    self.s = s; //spline
    self.on = true;

    self.posg = new SimpGraph(0,  0,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.pos = [0,0]; self.posd = [0,0]; //last position delta
    self.ppog = new SimpGraph(0, 40,stage.drawCanv.canvas.width/2,40,0,2*stage.drawCanv.canvas.width,"#000000"); self.ppo = [0,0]; //projected position
    self.mapg = new SimpGraph(0, 80,stage.drawCanv.canvas.width/2,40,0,2*stage.drawCanv.canvas.width,"#000000"); self.map = [0,0]; //map of projection back to spline
    self.dirg = new SimpGraph(0,120,stage.drawCanv.canvas.width/2,40,0,2,"#000000"); self.dir = [0,0]; self.spd = 0;
    self.velg = new SimpGraph(0,160,stage.drawCanv.canvas.width/2,40,0,20,"#FF0000"); self.vel = [0,0]; //derivable from dir+spd
    self.pveg = new SimpGraph(0,200,stage.drawCanv.canvas.width/2,40,0,20,"#000000"); self.pve = [0,0]; //projected vel
    self.accg = new SimpGraph(0,240,stage.drawCanv.canvas.width/2,40,0,0.5,"#000000"); self.acc = [0,0]; self.cacc = [0,0]; //cached accel for logging
    self.frcg = new SimpGraph(0,280,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.frc = [0,0]; self.cfrc = [0,0]; //cached frc for logging
    self.ffrg = new SimpGraph(0,320,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.ffr = [0,0]; self.cffr = [0,0]; //cached ffr for logging //force of friction

    self.x = self.pos[0];
    self.y = self.pos[1];
    self.r = 10; //radius (const)
    self.m = 10; //mass   (const)
    self.e = 0;  //energy
    self.danger = 0; //about-to-fall-off-ness
    self.maxdanger = 0.9; //when you fall off

    self.applyEnergy = function(e)
    {
      //?
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

    var prinall = function(canv)
    {
      canv.context.fillStyle = "#000000";
      canv.context.strokeStyle = "#000000";
      self.posg.plot(len(self.posd));
      self.posg.draw(canv);
      drawPt(canv,self.pos,2);
      //prin(canv,"pos",self.posd,10);

      canv.context.strokeStyle = "#0000FF";
      self.ppog.plot(len(self.ppo));
      self.ppog.draw(canv);
      drawPt(canv,self.ppo,2);
      //prin(canv,"ppo",self.ppo,30);

      canv.context.strokeStyle = "#00FF00";
      self.mapg.plot(len(self.map));
      self.mapg.draw(canv);
      drawPt(canv,self.map,5);
      //prin(canv,"map",self.map,50);

      canv.context.strokeStyle = "#00FFFF";
      self.dirg.plot(len(self.dir));
      self.dirg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.dir,[0,0]),100)));
      //prin(canv,"dir",self.dir,70);

      canv.context.strokeStyle = "#FF0000";
      self.velg.plot(len(self.vel));
      self.velg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.vel,[0,0]),10)));
      //prin(canv,"vel",self.vel,90);

      canv.context.strokeStyle = "#FF00FF";
      self.pveg.plot(len(self.pve));
      self.pveg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.pve,[0,0]),10)));
      //prin(canv,"pve",self.pve,110);

      canv.context.strokeStyle = "#FFFF00";
      self.accg.plot(len(self.cacc));
      self.accg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.cacc,[0,0]),10)));
      //prin(canv,"acc",self.cacc,130);

      canv.context.strokeStyle = "#000000";
      self.frcg.plot(len(self.frc));
      self.frcg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.frc,[0,0]),10)));
      //prin(canv,"frc",self.frc,150);

      canv.context.strokeStyle = "#000000";
      self.ffrg.plot(len(self.ffr));
      self.ffrg.draw(canv);
      drawVec(canv,self.pos,add(self.pos,scalmul(copy(self.ffr,[0,0]),500)));
      //prin(canv,"ffr",self.ffr,170);
    }
    self.tick = function()
    {
      self.resolveForces();
      self.resolveAccelleration();
      self.resolveVelocity();
      if(self.t > 0.5)
      {
        self.gt = true;
      }
      if(self.gt && self.t < 0.5)
      {
        self.gt = false;
        timer.lap();
      }
    }
    self.resolveForces = function()
    {
      self.frc[0] += self.ffr[0];
      self.frc[1] += self.ffr[1];
      self.acc[0] += self.frc[0]/self.m;
      self.acc[1] += self.frc[1]/self.m;

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

      self.e = self.m*lensqr(self.vel)/2;

      copy(self.acc,self.cacc);
      self.acc[0] = 0;
      self.acc[1] = 0;
    }
    self.resolveVelocity = function()
    {
      copy(self.pos,self.posd);
      if(self.vel[0] == 0 && self.vel[1] == 0) return;
      if(self.on)
      {
        var vlen = len(self.vel);
        copy(add(self.pos,self.vel),self.ppo);                       //pos+vel -> ppo
        var tmp_t = self.s.tForPt(self.ppo,self.t,vlen/100,10);      //find closest t for ppo
        copy(self.s.ptForT(tmp_t),self.map);                         //nearest ppo -> map
        if(iseq(self.map,self.pos)) return;                          //(if map is pos [no movement] return)
        self.danger = len(sub(self.map,self.ppo));
        if(self.danger > self.maxdanger) self.on = false;
        else
        {
          copy(proj(self.vel,sub(self.map,self.pos)),self.pve);      //project velocity onto pos2map -> pve
          copy(sub(self.pve,self.vel),self.ffr);                     //vel2pve -> ffr
          copy(self.pve,self.vel);                                   //pve -> vel
          scalmul(self.vel,0.995);

          copy(add(self.pos,self.vel),self.pos);                     //pos+vel -> pos

          self.t = self.s.tForPt(self.pos,tmp_t,vlen,10);            //find closest t to resulting pos
          copy(self.s.ptForT(self.t),self.pos);                      //nearest pos -> pos
          copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir); //pos2pos(next t) -> dir
          norm(self.dir);                                            //normalize d

          copy(proj(self.vel,self.dir),self.vel);                    //project vel onto dir -> vel
        }
      }
      if(!self.on)
      {
        self.pos[0] += self.vel[0];
        self.pos[1] += self.vel[1];
        scalmul(self.vel,0.8);
      }
      copy(sub(self.pos,self.posd),self.posd);
    }

    self.draw = function(canv)
    {
      if(showgraph) prinall(canv);
      var d = self.danger/self.maxdanger;
      canv.context.strokeStyle = "rgba("+Math.floor(d*255)+",0,0,1)";
      canv.context.lineWidth = 3;
      drawPt(canv,self.pos,self.r);
      canv.context.lineWidth = 1;
    }

    self.resetOnSpline = function()
    {
      self.t = 0;
      self.gt = false;
      copy(self.s.ptForT(self.t),self.pos);
      copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir);
      norm(self.dir);
      self.danger = 0;
      self.on = true;

      self.vel = [0,0];
      self.acc = [0,0];
      self.frc = [0,0];
      self.ffr = [0,0];
      self.applyForce(1);
    }
    self.resetOnSpline();
  };

  self.ready = function()
  {
    presser = new Presser({source:stage.dispCanv.canvas});

    s = new Spline(
     derivePtsFromPtsMode([
      [240,15],
      [305,12],
      [405,25],
      [452,68],
      [514,148],
      [524,200],
      [472,285],
      [423,284],
      [376,235],
      [345,187],
      [261,145],
      [236,175],
      [218,248],
      [176,272],
      [65,260],
      [39,197],
      [30,86],
      [84,96] ], PTS_MODE_CUBIC_BEZIER, true),
    4,1);
    track = new Track(s);
    timer = new Timer();
    c = new Car(s);

    f = new ForceBtn();
    g = new GraphBtn();
    presser.register(f);
    presser.register(g);

    var pt = s.ptForT(0);
    c.x = pt[0];
    c.y = pt[1];
  };

  var ttim = 0;
  self.tick = function()
  {
    presser.flush();

    //ttim++;
    ttim+=10;
    if(ttim%10 == 0)
    {
      timer.tick();
      c.tick();
      f.tick();
    }
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    track.draw(canv);
    c.draw(canv);
    f.draw(canv);
    g.draw(canv);
    timer.draw(canv);
  };

  self.cleanup = function()
  {
  };

};

