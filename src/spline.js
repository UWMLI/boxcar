var Spline = function(pts, chainlen, overlap) //Array of pts. Each nD pt takes the form of an n-length array. ex:[0,0] <- lol causes error in vim modeline
{
  var self = this;

  self.chainlen = (chainlen == 0) ? self.pts.length : chainlen; //num pts taken into account for any given t
  self.overlap = overlap; //num chains each pt can take part in (0 = each chain is disjoint)
  self.pts = pts;

  /*
  Popular combos:

  Continuous single-chain interpolation:
  chainlen - 0
  overlap  - 0

  Cubic Bezier:
  chainlen - 4
  overlap  - 1
  */

  //General interpolation over any n-dimensional points
  //For illustrative purposes- actual calculation switches this out for loop-less interp
  var genInterpAPt = function(pt1, pt2, t, ptr)
  {
    for(var i = 0; i < pt1.length; i++)
      ptr[i] = pt1[i]+((pt2[i]-pt1[i])*t);
    return ptr;
  };
  var interpAPt = genInterpAPt;

  self.t; //last calculated t
  self.derivedPts; //4D array- array of: all chains, all derived pts sets, set of pts, 'pt' AKA n-length array
  self.calculatedPt; //last calculated pt (identical to self.derivedPts[(chain_num_of_last_t)][self.chainlen-1][0]
  self.refreshSettings = function()
  {
    self.numchains = (self.pts.length-self.overlap)/(self.chainlen-self.overlap);

    //populate derivedPts arrays
    self.derivedPts = []; //each index = chain
    for(var i = 0; i < self.numchains; i++)
    {
      self.derivedPts[i] = []; //each index = layer of derivation
      for(var j = 0; j < self.chainlen; j++)
      {
        self.derivedPts[i][j] = []; //each index = pt
        for(var k = 0; k < self.chainlen-j; k++)
        {
          if(j == 0) self.derivedPts[i][j][k] = self.pts[(i*(self.chainlen-self.overlap))+k];
          else       self.derivedPts[i][j][k] = [];
        }
      }
    }

    //set specific interp algo based on dimension for slight performance gain
    if(self.pts.length > 0)
    {
      switch(self.pts[0].length)
      {
        case 1: interpAPt = interpAPt1D; break;
        case 2: interpAPt = interpAPt2D; break;
        case 3: interpAPt = interpAPt3D; break;
        case 4: interpAPt = interpAPt4D; break;
        case 5: interpAPt = interpAPt5D; break;
      }
    }
    else interpAPt = genInterpAPt;

    //set prev calc'd point to prevent false caching
    self.t = 0;
    self.calculatedPt = self.derivedPts[0][0][0];
  }

  self.ptForT = function(t)
  {
    if(t == self.t) return self.calculatedPt; //no need to recalculate
    self.t = t;

    var pass = 1; //'pass 0' is the population of the unchanging base pts
    var chain = Math.floor(self.t/(1/self.numchains));
    t = (self.t - chain*(1/self.numchains))/(1/self.numchains);
    while(pass < self.chainlen)
    {
      for(var i = 0; i < self.derivedPts[chain][pass-1].length-1; i++)
        interpAPt(self.derivedPts[chain][pass-1][i],self.derivedPts[chain][pass-1][i+1],t,self.derivedPts[chain][pass][i]);
      pass++;
    }
    return (self.calculatedPt = self.derivedPts[chain][self.derivedPts[chain].length-1][0]);
  };

  //Loop-less algorithms for ever-so-slight performance gains
  var interpAPt1D = function(pt1, pt2, t, ptr)
  {
    ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
    return ptr;
  }
  var interpAPt2D = function(pt1, pt2, t, ptr)
  {
    /*
    console.log(pt1[0]+",a");
    console.log(pt1[1]+",b");
    console.log(pt2[0]+",c");
    console.log(pt2[1]+",d");
    console.log(ptr[0]+",e");
    console.log(ptr[1]);
    */
    ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
    ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
    return ptr;
  }
  var interpAPt3D = function(pt1, pt2, t, ptr)
  {
    ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
    ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
    ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
    return ptr;
  }
  var interpAPt4D = function(pt1, pt2, t, ptr)
  {
    ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
    ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
    ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
    ptr[3] = pt1[3]+((pt2[3]-pt1[3])*t);
    return ptr;
  }
  var interpAPt5D = function(pt1, pt2, t, ptr)
  {
    ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
    ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
    ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
    ptr[3] = pt1[3]+((pt2[3]-pt1[3])*t);
    ptr[4] = pt1[4]+((pt2[4]-pt1[4])*t);
    return ptr;
  }

  self.refreshSettings();
};

