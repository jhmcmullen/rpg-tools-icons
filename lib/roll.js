/* on my machine, the script folder is /C/Program Files (x86)/Adobe/Acrobat Reader DC/Reader/JavaScripts */
var page=this;
var roll = {
  last: 0,
  d6: function(num,base, sides){
    var sum = 0;
    var b = (base !== undefined)? base : 1;
    var n = num||1;
    var s = sides||6;
    for (n; n; n--) sum += b+Math.floor(Math.random()*s);
    this.last = sum;
    return sum;
  },
  lvl: function(){
    var less = 1;
    var n = this.d6(2);
    if (n > 5) less++;
    if (n > 7) less++;
    if (n > 9) less++;
    return (n - less);
  },
  inAny: function(thresh,dice){
    if (thresh === undefined) return;
    else var arr = thresh;
    var d = dice||1;
    var n = this.d6(d,1);
    var rv = 0;
    for (var x = 0; x < arr.length; x++){
      if (n > arr[x]) rv++;
    }
    return rv;
  },
  threeP: function(){ return this.inAny([3,5],1); },
  fourP: function(){ return this.inAny([2,4,5],1); },
  fiveP: function(){
    var n = this.d6(1,0);
    return (n<1)? n : n-1;
  },
  specTxt: function(){
    var row = this.d6(1,0);
    var arr = tbls.s[row];
    if (row === 0) return arr[this.fiveP()];
    if (row === 3) return arr[this.inAny([3,4,5],1)];
    else return arr[this.fourP()];
  },
  numOf: function(tbls){
    var r = this.inAny([4,7,10],2)+1;
    return (tbls) ? r+1 : r;
  },
  pwrTxt: function(){
    var ix = roll.inAny([3,5,6,7,8,10],2);
    var txt = 'Error';
    switch (ix){
      case 0: txt = make.getMen(); break;
      case 1: txt = make.getCtl(); break;
      case 2: txt = make.getDef(); break;
      case 3: txt = make.getOff(); break;
      case 4: txt = make.getMov(); break;
      case 5: txt = make.getAlt(); break;
      case 6: txt = make.getSen(); break;
    }
    return txt;
  },
  o: function(){
    var tbl=[[4,"Trained"], [5,"Transformed"], [2,"Birthright"], [3,"Gimmick"], [1,"Artificial"],
    [6,"Unearthly"]];
    var roll = this.d6(2);
    var ix = this.inAny([4,6,7,9,10],2);
    page.getField("Origin").currentValueIndices = tbl[ix][0];
    return tbl[ix[1]];
  },
  check: function(num){
    if (editState) return;
    var r = this.d6();
    if (check.a && check.m && check.r){
      var a = (num === undefined) ? check.a.getItemAt(check.a.currentValueIndices) : Number(num);
      var m = check.m.getItemAt(check.m.currentValueIndices);
      var rv = r+Number(a)+Number(m);
      check.r.value = (event.shift) ? dice.lvl() : rv+'\r('+a+'+'+m+'+'+r+')';
    }
  }
};
