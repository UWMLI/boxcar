var depthtesta = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var depthtestb = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var GamePlayScene = function(game, stage)
{
  var self = this;

  var presser;
  var dragger;
  var hoverer;
  var drawer;

  var t;
  var c;
  var s;
  var f;

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
      if(!self.pressing && !c.on) c.resetOnSpline();
      self.pressing = true;
    }
    self.unpress = function(evt){ self.pressing = false; }
    self.tick = function(evt) { if(self.pressing) c.applyForce(1); }
    self.draw = function(canv) { canv.context.strokeRect(self.x,self.y,self.w,self.h); }
  }

  var simpGraph = function(x,y,w,h,min,max,color)
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
    self.s = s; //spline
    self.on = true;

    self.posg = new simpGraph(0,  0,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.pos = [0,0]; self.posd = [0,0]; //last position delta
    self.ppog = new simpGraph(0, 40,stage.drawCanv.canvas.width/2,40,0,2*stage.drawCanv.canvas.width,"#000000"); self.ppo = [0,0]; //projected position
    self.mapg = new simpGraph(0, 80,stage.drawCanv.canvas.width/2,40,0,2*stage.drawCanv.canvas.width,"#000000"); self.map = [0,0]; //map of projection back to spline
    self.dirg = new simpGraph(0,120,stage.drawCanv.canvas.width/2,40,0,2,"#000000"); self.dir = [0,0]; self.spd = 0;
    self.velg = new simpGraph(0,160,stage.drawCanv.canvas.width/2,40,0,20,"#FF0000"); self.vel = [0,0]; //derivable from dir+spd
    self.pveg = new simpGraph(0,200,stage.drawCanv.canvas.width/2,40,0,20,"#000000"); self.pve = [0,0]; //projected vel
    self.accg = new simpGraph(0,240,stage.drawCanv.canvas.width/2,40,0,0.5,"#000000"); self.acc = [0,0]; self.cacc = [0,0]; //cached accel for logging
    self.frcg = new simpGraph(0,280,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.frc = [0,0]; self.cfrc = [0,0]; //cached frc for logging
    self.ffrg = new simpGraph(0,320,stage.drawCanv.canvas.width/2,40,0,10,"#000000"); self.ffr = [0,0]; self.cffr = [0,0]; //cached ffr for logging //force of friction

    self.x = self.pos[0];
    self.y = self.pos[1];
    self.r = 10; //radius (const)
    self.m = 10; //mass   (const)
    self.e = 0;  //energy

    self.resetOnSpline = function()
    {
      self.t = 0;
      copy(self.s.ptForT(self.t),self.pos);
      copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir);
      norm(self.dir);
      self.on = true;
    }
    self.resetOnSpline();
    self.applyEnergy = function(e)
    {
      //?
    }
    self.applyForce = function(f)
    {
      self.frc[0] += f*self.dir[0];
      self.frc[1] += f*self.dir[1];
    }
    self.applyForce(1);

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
        if(len(sub(self.map,self.ppo)) > 0.9)
          self.on = false;
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
      prinall(canv);
      drawPt(canv,self.pos,self.r);
    }
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
    t = new Track(s);
    c = new Car(s);

    f = new ForceBtn();
    presser.register(f);

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
      c.tick();
      f.tick();
    }
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    t.draw(canv);
    c.draw(canv);
    f.draw(canv);

/*
      //Debug Spline

      canv.context.strokeStyle = "#FF0000";
      for(var i = 0; i < depthtesta.length; i++)
        drawPt(canv,depthtesta[i],2);
      canv.context.strokeStyle = "#00FF00";
      for(var i = 0; i < depthtestb.length; i++)
        drawPt(canv,depthtestb[i],2);

      for(var i = 0; i < s.pts.length; i++)
      {
        if(i%3 == 0) canv.context.strokeStyle = "#FF0000";
        drawPt(canv,s.pts[i],2);
        canv.context.strokeStyle = "#888888";
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
  */

  };

  self.cleanup = function()
  {
  };

};

