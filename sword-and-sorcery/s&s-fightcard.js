var debug = true;
var cvt = {
  o: ['', 'Arcane', 'Brute', 'Construct', 'Elder', 'Human', 'Stout'],
  a: ['', 'Swords', 'Sorcery', 'Stealth']
};
var page = this;
var fPtrs = {
  AP: null,
  AC: null,
  AS: null,
  AI: null,
  AA: null,
  AW: null,
  Using: null,
  Mod: null,
  get: function(hat){
    var h = (hat === 'Hero') ? 'Hero' : 'Foe';
    for (var x in this){
      if (typeof this[x] !== 'function') {
        var name = x+h ;
        this[x] = page.getField(name);
        if (this[x]) {
          this[x].commitOnSelChange = true;
        } else {app.alert('Cannot find '+name);}
      }
    }
  }
};
var bu = "\u2022 ";
this.getField('StrikeByHero').fillColor = color.gray;
this.getField('StrikeByFoe').fillColor = color.ltGray;
var io = {
  get: function(fld){
    var f = (typeof fld == 'object') ? fld : page.getField(fld);
    if (!f) app.alert(fld+' not found');
    return f;
  },
  inlist: function(fld,what,ex){
    var f = this.get(fld);
    var rv = -2;
    if (!f || f.type !== 'combobox') { return null;}
    if (f.currentValueIndices < 0){ if (what === f.value) return -1;}
    for (var i=0;i<f.numItems; i++){
      var item = f.getItemAt(i,ex);
      if (item === what) rv = i;
    }
    return rv;
  },
  r: function(fld,ex){
    var f = this.get(fld);
    if (!f) return;
    switch (f.type){
      case 'button': return f.buttonGetCaption(); break;
      case 'combobox':
      case 'listbox':  var ix = f.currentValueIndices;
          if (typeof ix === 'object') return null;
          if (ix < 0) return f.value;
          return f.getItemAt(ix,ex);
          break;
      default: return f.value;
    }
  },
  w: function(fld,what,append){
    var f = this.get(fld);
    if (!f) return;
    switch (f.type){
      case 'button': f.buttonSetCaption(what); break;
      case 'combobox':  
      case 'listbox': var ix = this.inlist(fld,what,append);
           if (ix < 0) {
             if (f.editable) f.value = what;
             else ix = 0;
           }
           f.currentValueIndices = ix; break;
      case 'text': if (append) f.value += '\r'+what; else f.value = what; break;
    }
  },
};
function debugmsg(txt) {
  if (debug) {
    this.getField("Notes").value += txt+"\n";
  }
}
var roll = {
  any: function(sides,num,base){
    var b = (base === undefined) ? 1 : base;
    var s = sides || 6;
    var n = num || 1;
    var sum = 0;
    for (n; n; n--) sum += b + Math.floor(Math.random()*s);
    return sum;
  },
  d6: function(num,base){ return this.any(6,num,base);},
  origin: function(hat){
    var pre = (hat != 'Hero') ? 'Foe' : 'Hero';
    var face = io.r('O', false);
    if (face === ' '){
      return cvt.o[this.d6()];
    } else return face;
  },
  lvl: function(mod){
    var r = this.d6(2,1);
    var m = mod || 0;
    r += Number(m);
    var adj = 1;
    if (r > 5) adj++;
    if (r > 7) adj++;
    if (r > 9) adj++;
    if (r > 11) return 7;
    r -= adj;
    return r;
  },
  inAny: function(thresh,dice){
    if (!thresh || typeof thresh !== 'object') return -1;
    var rv = 0;
    var n = dice || 2;
    var r = this.d6(n,1);
    debugmsg('roll.inAny(): rolled '+r);
    for (var ix = 0; ix < thresh.length; ix++){
      if (r > thresh[ix]) rv++;
    }
    debugmsg('roll.inAny(): result is '+rv);
    return rv;
  },
  numS: function(){
    return 4;
  },
  fourP: function(){
    return this.inAny([1,3,4],1);
  },
  fiveP: function(){
    var n = roll.d6(1,0);
    return (n<1)? n : n-1;
  }
};
var list = {
  specs: [
      ['Athletics','Aerial Combat', 'Art', 'Business', 'Drive'],
      ['Investigation', 'Leadership', 'Law', 'Linguistics'],
      ['Martial Arts', 'Mental Resistance', 'Medicine', 'Military'],
      ['Power', 'Occult', 'Performance', 'Pilot'],
      ['Science', 'Stealth', 'Psychiatry', 'Sleight of Hand'],
      ['Technology', 'Weapons', 'Underwater Combat', 'Wrestling']
  ],
  getSpec: function(){
    var row = roll.d6(1,0);
    var arr = this.specs[row];
    var id = '';
    if (row === 0)  id = arr[roll.fiveP()];
    else if (row === 3) {
      id = arr[roll.inAny([2,3,4],1)];
    } else {
      id = arr[roll.fourP()]
    }
    return id;
  },
  getSpecs: function(hat){
    var h = (hat === 'Hero') ? hat : 'Foe';
    var txt = '';
    for (var n=4; n; n--){
      txt += this.getSpec();
      debugmsg('txt is '+txt);
      if (n !== 1) txt += ', ';
    }
    page.getField('S'+h).value = txt;
    return txt;
  },
  o: ['','Arcane', 'Brute', 'Construct', 'Elder', 'Human', 'Stout'],
  getO: function(hat){
    var h = (hat === 'Hero') ? hat : 'Foe';
    var ofld = page.getField('O'+h);
    if (!ofld) return '';
    if (ofld.currentValueIndices === 0 || !event.shift) {
      ofld.currentValueIndices = roll.d6(1,1);
    } 
    if (ofld.currentValueIndices < 0) return ofld.value;
    return this.o[ofld.currentValueIndices];
  },
  getArch: function(hat){
    var h = (hat === 'Hero') ? hat : 'Foe';
    var ofld = page.getField('A'+h);
    if (!ofld) return '';
    if (ofld.currentValueIndices === 0 || !event.modifier) {
      ofld.currentValueIndices = roll.any(3,1,1);
    } 
    if (ofld.currentValueIndices < 0) return ofld.value;
    return cvt.a[ofld.currentValueIndices];
  },
  knacks: [
    'Always Armed', 'Ambidexterity', 'Animal Empathy', 'Arcane',
    'Attractive', 'Beginner\s Luck', 'Blind Fighting', 'Bullet Time',
    'Calculated Accuracy', 'Calculated Damage', 'Common Sense', 'Contacts',
    'Cosmic Awareness', 'Direction Sense', 'Dreadful Presence', 'Escape Artist',
    'Favored Foe', 'Gadgeteer', 'Great Endurance', 'Immunity', 'Instant Up',
    'Interpose', 'Living Legend', 'Longevity', 'Master Plan', 'Matchless Mind',
    'Master of Disguise', 'Meditation', 'Mind Over Matter', 'Occultist',
    'Pass-by Strike', 'Penetrating Strike', 'Power Defense', 'Precise Strike',
    'Reflexive Block', 'Ricochet', 'Size-up', 'Speed of Thought',
    'Stunning Slam', 'Stunning Strike', 'Super-Breath', 'Swift Defense',
    'Teamwork', 'Total Recall', 'Tracker', 'Trance',
    'Trivia Buff', 'Vanish', 'Wealth', 'Whirlwind Strike'
  ],
  getKnacks: function(hat, origin, archetype){
    var txt = ''; var o = ''; var a = '';
    var h = (hat === 'Hero') ? hat : 'Foe';
    numLeft = 2;
    var ofld = page.getField('O'+h);
    if (ofld){
      o = (ofld.currentValueIndices) ? ofld.getItemAt(ofld.currentValueIndices,false) : origin;
    } 
    debugmsg('o is '+o);
    if (o == 'Arcane') txt = bu+'(Arcane knack)\r';
    if (o == 'Construct') txt = bu+'Supreme (10) Life Support\r';
    if (o == 'Human') numLeft++;
    ofld = page.getField('A'+h);
    if (ofld){
      a = (ofld.currentValueIndices !== 0) ? ofld.getItemAt(ofld.currentValueIndices, false) : archetype;
    }
    debugmsg('a is '+a);
    switch (a){
      case 'Swords': txt += bu+'Always Armed OR Favored Foe'; break;
      case 'Sorcery':  txt += bu+'Spell-Caster'; break;
      case 'Stealth': txt += bu+'Precise Strike OR Vanish'; break;
    }
    txt += '\r';
    for (numLeft;numLeft;numLeft--){
      txt += bu+this.knacks[roll.any(this.knacks.length,1,0)];
      if (numLeft !== 1) txt += '\r';
    }
    page.getField('K'+h).value = txt;
    return txt;
  }
};
var equipList = {
  armor: [
    "",
    "Leather [Weak (1) Dmg Res]",
    "Brigandine [Poor (2) Dmg Res]",
    "Chain [Avg (3) Dmg Res]",
    "Light shield [Avg (3) Dmg Res), Limit: Requires reaction]",
    "Heavy shield [Fair (4) Dmg Res, -Requires reaction]",
    "Plate [Fair (4) Dmg Res]",
    "Enchanted Leather [Weak (2) Dmg Res]",
    "Enchanted Brigandine [Avg (3) Dmg Res]",
    "Enchanted Chain [Fair (4) Dmg Res]",
    "Enchanted Plate (Good (5) Dmg Res]"
  ],
  weapon: [
    "",
    "Wooden club [Fair (4) Strike -If > 4 dmg breaks]",
    "Sling [Fair (4) Blast -Source, -Lower of STR or Blast dmg]",
    "Quarterstaff [Fair (4) Strike -If > 4 dmg breaks]",
    "Knife/dagger [Avg (3) Slash]",
    "Bow [Fair (4) Shoot]",
    "Crossbow [Fair (4) Shoot]",
    "Metal mace [Good (5) Strike -If > 5 dmg break]",
    "Sword [Fair (4) Slash]",
    "Two-handed sword [Good (5) Slash]",
    "Longarm [Good (5) Slash +Reach -Awkward]"
  ],
  get: function(hat,archetype){
    var h = (hat === 'Hero') ? hat : 'Foe';
    var lenA = equipList.armor.length;
    var lenW = equipList.weapon.length;
    var hasW = 1;
    var txt = '';
    switch(archetype){
      case 'Stealth': lenA = 5; lenW = 7;break;
      case 'Sorcery': lenA = 2; lenW = 7; break;
      case 'Swords': hasW = 2; break;
    }
    var txt = this.armor[roll.any(lenA,1,0)];
    if (txt) txt = bu+txt+'\r';
    for (hasW; hasW; hasW--) {
      var plus = equipList.weapon[roll.any(lenW,1,0)];
      if (plus) txt += bu+equipList.weapon[roll.any(lenW,1,0)];
      if (hasW !== 1) txt += '\r';
    }
    var f = page.getField('E'+h);
    if (f) f.value = txt;
    return txt;
  }
};
var mode = {
  editState: true,
  flds: {
    ro: [ 'APHero', 'ACHero', 'ASHero', 'AIHero', 'AAHero', 'AWHero', 'SHero', 'KHero', 'AHero',
          'KFoe', 'AFoe', 'APFoe', 'ACFoe', 'ASFoe', 'AIFoe', 'AAFoe', 'AWFoe', 'SFoe' ],
    play: ['StrikeByHero', 'StrikeByFoe', 'VS', 'UsingHero', 'UsingFoe', 'ModHero', 'ModFoe', 'Result', 'ExplHero', 'ExplFoe'],
    make: ['MkHero','MkFoe']
  },
  set: function(){
    this.editState = !this.editState;
    if (!this.editState) { hero.update(); foe.update();}
    var cap = (this.editState) ? 'Play' : 'Edit';
    page.getField('ModeBtn').buttonSetCaption(cap);
    cap = (this.editState) ? 'Import' : 'Export';
    page.getField('PortHero').buttonSetCaption(cap);
    page.getField('PortFoe').buttonSetCaption(cap);
    for (var x = 0; x < this.flds.play.length; x++){
      page.getField(this.flds.ro[x]).readonly = !this.editState;
    }
    for (x = 0; x < this.flds.play.length; x++){
      var f = page.getField(this.flds.play[x]);
      if (f){
        f.display = (this.editState) ? display.hidden : display.visible;
        if (f.type === 'text' && f.readonly === false) f.value = '';
      }
    }
    for (x = 0; x < this.flds.make.length; x++){
      page.getField(this.flds.make[x]).display = (this.editState) ? display.visible: display.hidden;
    }
  }
};
/* A test */
var check = {
  attack: { ab: 0, mod: 0, r: 0, sum: 0 },
  defense: { ab: 0, mod: 0, r: 0, sum: 0 },
  half: function(hat,isAtk){
    fPtrs.get(hat);
    var result = (isAtk) ? this.attack : this.defense ;
    var f = fPtrs.Using;
    if (f){
      var face = f.getItemAt(f.currentValueIndices,true);
      if (isNaN(face)){
        var y = page.getField(face);
        result.ab = (y) ? y.getItemAt(y.currentValueIndices,true) : 0;
      } else result.ab = face;
      result.ab = Number(result.ab);
    }
    result.r = roll.d6(1,1);
    result.mod = Number(io.r('Mod'+hat));
    result.sum = result.r+result.ab+result.mod;
    page.getField('Expl'+hat).value = util.printf('%d (%d+%d+%d)', result.sum, result.r, result.ab, result.mod);
    return result;
  },
  compare: function(){
    var words = ['','Moderate','Major','Massive','Cosmic'];
    var rv = this.attack.sum - this.defense.sum;
    if (rv === 0) var txt = 'Marginal Success';
    else { txt = (rv < 0) ? ' Failure' : ' Success';
      rv = Math.abs(rv);
      rv = Math.ceil(rv/2);
      if (rv > 4) rv = 4;
      txt = words[rv]+txt;
    }
    page.getField('Result').value = txt;
  },
  full: function(hat){
    var other = (hat === 'Hero') ? 'Foe' : 'Hero';
    this.half(hat,true);
    this.half(other,false);
    this.compare();
  }
};
/* A hero character */
function A(ats){
  if (!ats) ats = [3,3,3,3,3,3];
  this.P = ats[0]||3;
  this.C = ats[1]||3;
  this.S = ats[2]||3;
  this.I = ats[3]||3;
  this.A = ats[4]||3;
  this.W = ats[5]||3;
  this.clear = function(){
      this.P = this.C = this.S = this.I = this.A = this.W = 3;    
  };
  this.allSta = function(){ return parseInt(this.S)+parseInt(this.W); };
  this.sum = function () {
    return this.P+this.C+this.S+this.I+this.A+this.W;
  };
  this.gen = function(origin,archetype){
    var o = (origin === undefined) ? '' : origin;
    var a = (archetype === undefined) ? '' : archetype;
    var addToRoll = 0;
    var addToAtt = { P: 0, C: 0, S: 0, I: 0, A: 0, W: 0};
    do {
      for (var x in this){
        if (typeof this[x] !== 'function'){
          switch (a){
            case 'Swords':  addToRoll = (x === 'P' || x === 'S') ? 2 : 0; break;
            case 'Sorcery': addToRoll = (x === 'I' || x === 'W') ? 2 : 0; break;
            case 'Stealth': addToRoll = (x === 'C' || x === 'A') ? 2 : 0; break;
          }
          this[x] = roll.lvl(addToRoll);
        }
      }
      
    } while (this.sum() < 20);
  };
  this.asTxt = function(){
    var h = hat || 'Foe';
    var str = '';
    for (var i in this){
      str += i+': '+this[i]+' ';
    }
    str += "\rStamina: "+this.allSta();
    return str;
  };
  this.writ = function(hat){
    var h = (hat === 'Hero') ? hat : 'Foe';
    fPtrs.get(h);
    var ats = ['P','C','S','I','A','W']
    for (var x=0;x<ats.length;x++) fPtrs['A'+ats[x]].currentValueIndices = this[ats[x]];
    io.w('STA'+hat,this.allSta());
  };
  this.blank = function(hat){
    var h = hat || 'Foe';
    for (var i in this){
      if (typeof this[i] !== 'function') io.w('A'+i+h,3);
    }
  };
  this.clear = function(){
    for (var i in this){
      if (typeof this[i] !== 'function') this[i] = 3;
    }
  };
  this.update = function(hat){
    var h = hat || 'Foe';
    for (x in this){
      if (typeof this[x] !== 'function') io.r('A'+x+h);
    }
  };
  return this;
};

function Guy(hat, id, at, s, k, q, o, a, e, notes){
  this.ID = id||'';
  this.hat = hat||'Foe';
  this.O = o||'';
  this.arch = a||'';
  this.A = new A(at);
  this.getSTA = function(){return this.A[2]+this.A[5];};
  this.STA = this.getSTA();
  this.S = s||'';
  this.K = k||'';
  this.E = e||'';
  this.Q = q||[];
  this.note = notes||'';
  this.gen = function(){
    this.O = list.getO(this.hat);
    this.arch = list.getArch(this.hat);
    this.A.gen(this.hat, this.O, this.arch);
    this.STA = this.getSTA();
    this.K = list.getKnacks(this.hat, this.O, this.arch);
    this.S = list.getSpecs(this.hat, this.O, this.arch);
    this.E = equipList.get();
    this.Q.length = 0;
    for (x = 0; x < 3; x++){
      this.Q[x] = bu+aspectList[roll.any(aspectList.length,1,0)];      
    }
    if (this.O === 'Stout') this.Q.push(bu+'Small');
    this.DP = (this.O === 'Human') ? 4 :  3;
    this.note = '';
    this.writ();
  };
  this.blank = function(){
    var flds = ['ID', 'STA', 'S', 'K', 'E', 'Q'];
    this.A.blank();
    for (var x = 0; x < flds.length; x++){
      io.w(flds[x]+this.hat,'');
    }
    if (this.hat === 'Hero') io.w('DPHero','');
  };
  this.asTxt = function(){
    var str = '';
    str += this.ID;
    if (this.O || this.arch) str += ' (';
    if (this.O) str += this.O;
    if (this.O && this.arch) str += ', ';
    if (this.arch) str += this.arch;
    if (this.O || this.arch) str += ')';
    str += '\r';
    str += this.A.asTxt()+'\r';
    if (this.hat === 'Hero') str += 'Determination: '+this.DP+'\r';
    str += 'SPECIALTIES:\r'+this.s;
    str += '\rKNACKS:\r'+this.K;
    str += 'QUALITIES:\r';
    for (i = 0; i < this.Q.length; i++){
      str += this.Q[i]+'\r';
    }
    if (this.E) str += 'EQUIPMENT:\r'+this.E;
    if (this.notes) str += this.notes;
    reveal(true,str);
  };
  this.writ = function() {
    var h = this.hat || 'Foe';
    var str = '';
    this.blank(h);
    io.w('ID'+h,this.ID);
    io.w('O'+h,this.O);
    io.w('A'+h, this.arch);
    this.A.writ(h);
    io.w('S'+h,this.S);
    io.w('K'+h,this.K);
    io.w('E'+h,this.E);
    str = '';
    for (var x = 0; x < this.Q.length; x++){
      var line = this.Q[x].replace(/(\u2022\s*)+/,bu);
      str += this.Q[x];
      if (x !== this.Q.length - 1) str += '\r';
    }
    io.w('Q'+h,str);
    if (h === 'Hero'){
      if (this.DP) io.w('DPHero',this.DP);
      else io.w('DPHero',(this.O == 'Human')? 4 : 3);
    }
    if (this.notes) io.w('Notes'+h,this.notes);
  };
  this.update = function() {
    var h = this.hat || 'Foe';
    this.ID = io.r('ID'+h);
    this.A.update(h);
    this.STA = this.A.allSta();
    if (h === 'Hero') this.DP = io.r('DP'+h);
    this.S = io.r('S'+h).replace(/^Specialties:[ \r]*/,'');
    this.K = io.r('K'+h);
    this.E = io.r('E'+h);
    str = io.r('Q'+this.hat).replace(/^Qualities:[\r ]*/,'');
    var quals = str.split(/\r/);
    this.Q.length = 0;
    for (x = 0; x < quals.length; x++){
      str = quals[x].replace(/\r2022 */,'');
      this.Q.push(quals[x].replace(/\u2022 */,''));
    }
    this.notes = io.r('Notes'+h);
  };
  return this;
};

// List of qualities

var aspectList = [
	"Unfit for human society",
	"The last one like me",
	"Responsibility is proportional to poewr",
	"To survive, I need <x>",
	"<x>! My biggest weakness!",
	"New kid on the supers block",
	"I have to repay my mentor's faith",
	"Object of fear & hate",
	"This imperfect form...",
	"I\'m angry all the time",
	"No one must know my name",
	"I\'ll never go back",
	"An arduous quest",
	"My secret domain",
	"I prefer the wilderness",
	"The one thing that enrages me",
	"I\'m from another dimension",
	"I\'m more than just a machine",
	"Split personality",
	"I just want a normal life",
	"My faithful servant",
	"Smash it!",
	"Child of a distant sun",
	"Back from the future",
	"Citizen of past times",
	"Artifact of power and mystery",
	"The laws I must follow",
	"Mantle of leadership",
	"Arch enemy",
	"Unrequited love",
	"I don\'t know who I am",
	"Atonement",
	"My days are numbered",
	"These powers are changing me",
	"I died once already",
	"According to the prophecy",
	"The temptation I cannot resist",
	"I don\'t understand my powers",
	"Mythological figure",
	"This is my city",
	"My empire, my burden",
	"You can\'t trust the establishment",
	"My protege",
	"A friend in authority",
	"Carrying a torch for a supervillain",
	"Dating a nosy reporter",
	"I will have my revenge",
	"The price of fame",
	"Can\'t quit my day job",
	"They want me dead",
	"I swore a sacred oath",
	"Patriot",
	"Secret masters",
	"I\'ll follow my orders",
	"Addicted to applause",
	"Trust no one",
	"Superiority complex",
	"I used to be bad",
	"Accustomed to the finer things",
	"Grew up on the streets",
	"I get no respect",
	"I don\'t like violence",
	"Heart on my sleeve",
	"My ex is a nightmare",
	"Ready to retire",
	"Just leave me alone",
	"You guys take this too seriously",
	"Serious family issues",
	"Work relationships are the hardest",
	"Fierce rivalry",
	"Another day, another lover",
	"I must unlock my full potential",
	"Don\'t believe the lies about me",
	"That voice follows me everywhere",
	"Compelled into service",
	"My friend is headed for a bad end",
	"Can\'t ignore a call for help",
	"Sucker for an attractive face",
	"Everyone knows where to find me"
];

function adjust(hat){
  var g = (hat == 'Hero') ? hero : foe;
  if (mode.editState) return;
  if (isNaN(event.target.value)) return;
  if (event.shift) event.target.value = (/DP/.test(event.target.name))? g.d : g.sta;
  else event.target.value--;
  event.target.value = Math.max(event.target.value,0);
}
var FP = this.getField('FinePrint');
if (!FP) app.alert('Field FinePrint not found');
function reveal(state,txt){
  if (!FP) return;
  var show = [36,324,468,36];
  var hide = [36,50,50,36];
  FP.value = (txt !== undefined) ? txt : ogltxt;
  for (var x = 0; x < 4; x++) FP.rect[x] = (state) ? show[x] : hide[x];
  if (state === undefined) state = (FP.display === display.visible) ? display.hidden : display.visible;
  FP.display = (state) ? display.visible : display.hidden;
}
var hero = new Guy('Hero', 'Melantha sen Michi', [3,5,4,4,5,5],'Athletics, Sleight of Hand, Stealth Expert',
bu+'Vanish\r'+bu+'Shadow-Hop [Reliable Avg\r  Teleport dark-to-dark]\r'+bu+'Shadow-Sight [Avg ESP\r  sight dark-to-dark]',['Demon','',''],
'Arcane', 'Stealth',bu+equipList.armor[1]+'\r'+bu+equipList.weapon[2]+'\r'+bu+equipList.weapon[4], '');
hero.writ();
var foe = new Guy('Foe');
