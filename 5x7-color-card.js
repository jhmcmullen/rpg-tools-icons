/* on my machine, the script folder is /C/Program Files (x86)/Adobe/Acrobat Reader DC/Reader/JavaScripts */
var dbug=true;
function debugmsg(txt){
  if (dbug) app.alert(txt);
}
var page=this;
var cvt={
  lvl: ['','Weak (1)','Poor (2)','Average (3)','Fair (4)','Good (5)','Great (6)',
        'Incredible (7)','Amazing (8)','Fantastic (9)','Supreme (10)','-'],
  exp: ['',' (+1)', 'Expert (+2)', 'Master (+3)'],
  o: ['','Trained','Transformed','Birthright','Gimmick','Artificial','Unearthly'],
  a: { P: 'Prowess:', C: 'Coordination:', S: 'Strength',  I: 'Intellect:', A: 'Awareness',
        W: 'Willpower', STA: 'Stamina:', DP: 'Determination:'},
  pt: [ 'Mental', 'Control', 'Defense', 'Offense', 'Movement', 'Alteration', 'Sensory']
};
var attrib = {
  P: 3, C: 3, S: 3, I: 3, A: 3, W: 3,
  sum: function(){ return (this.P+this.C+this.S+this.I+this.A+this.W); },
  getSTA: function(){
    var w = this.W||0;
    var s = this.S||0;
    return s+w;
  },
  writeAtt: function(att,val){
    var f = page.getField(att);
    if (f) {f.value = val; }
  },
  write: function(){
    for (var x in this){
      if (typeof this[x] !== 'function') this.writeAtt(x,this[x]);
    }
    this.writeAtt('STA',this.getSTA());
  },
  getPwrs: function(){
    var n=0;
    for (var x in this){
      if (typeof this[x] !== 'function' && this[x]>6) n++;
    }
    return n;
  },
  make: function(){
   do {
      for (var x in this) if (typeof this[x] !== 'function') {this[x] = roll.lvl();}
     } while (this.sum() < 20);

  },
  importing: function(txt){
    var tmp = txt.trim();
    var lines = tmp.split(/[[:space:]]/);
    var amIn='P';
    for (var i=0;i<lines.length;i++){
      switch (lines[i]){
          case 'PRW:': amIn='P'; break;
          case 'CRD:': amIn='C'; break;
          case 'STR:': amIn='S'; break;
          case 'INT:': amIn='I'; break;
          case 'AWR:': amIn='A'; break;
          case 'WIL:': amIn='W'; break;
          case 'STA:': amIn='STA'; break;
          case 'DET:': amIn='DP'; break;
          default: if (amIn !== 'skip') page.getField(amIn).value = lines[i];
       }
    }
  }
};
var editState = true;
function alter(inc){
  var i = (inc === 'undefined') ? -1 : inc;
  var fname = event.target.name.replace(/Up|Dn/,'');
  var f = this.getField(fname);
  if (f) {
    var val = f.value;
    if (isNaN(val)) return;
    val = Number(val)+i;
    if (val < 0) val = 0;
    if (val > 20) val = 20;
    f.value = val;
  }
}
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
/* Play */
var check = {};
check.a = this.getField('At');
if (check.a) check.a.commitOnSelChange = true;
else app.alert('Combobox At missing');
check.m = this.getField('Mod');
if (check.m) check.m.commitOnSelChange = true;
else app.alert('Combobox Mod missing');
check.r = this.getField('Roll');
if (!check.r) app.alert('Roll field missing');
function play(){
  editState = event.target.isBoxChecked(0);
  var flds = {
    ro: [ 'ID', 'P', 'C', 'S', 'I', 'A', 'W', 'Specialties', 'Qualities', 'Powers', 'STA', 'DP', 'Img', 'OGLBtn' ],
    antiro: [ 'PRWBtn', 'CRDBtn', 'STRBtn', 'INTBtn', 'AWRBtn', 'WILBtn'],
    edit: ['Origin'],
    play: ['At', 'AtLabel', 'Mod', 'ModLabel', 'D6', 'Roll']
  };
  for (var x = 0; x < flds.ro.length; x++){
    var f = this.getField(flds.ro[x]);
    if (!f) app.alert(flds.ro[x]+' not found');
    else f.readonly = !editState;
  }
  for (x=0; x < flds.antiro.length; x++){
    var f = this.getField(flds.antiro[x]);
    if (!f) app.alert(flds.ro[x]+' not found');
    else f.readonly = editState;
  }
  for (x = 0; x < flds.edit.length; x++){
    f = this.getField(flds.edit[x]);
    if (!f) app.alert(x+' not found');
    else f.display = (editState) ? display.visible : display.hidden;
  }
  for (x = 0; x < flds.play.length; x++) {
    f = this.getField(flds.play[x]);
    if (f) f.display = (editState) ? display.hidden : display.visible;
    else app.alert(x+' not found');
  }
}
function btnroll(){
  var v = this.getField(event.target.name.charAt(0)).value;
  if (isNaN(v) || !v) v=0;
  roll.check(v);
}
function bulletize(){
  if (event.willCommit && event.target.value) {
    event.value = '\u2022 '+event.value.replace(/(\r\s*)/g,'$1\u2022 ');
    event.value = event.value.replace(/(\u2022 )+/g,'$1');
  }
}
/* Making heroes */
var tbls = {
  s: [
      ['Athletics','Aerial Combat', 'Art', 'Business', 'Drive'],
      ['Investigation', 'Leadership', 'Law', 'Linguistics'],
      ['Martial Arts', 'Mental Resistance', 'Medicine', 'Military'],
      ['Power', 'Occult', 'Performance', 'Pilot'],
      ['Science', 'Stealth', 'Psychiatry', 'Sleight of Hand'],
      ['Technology', 'Weapons', 'Underwater Combat', 'Wrestling']
  ],
  ia: {
    a: [ ['Ability Boost', 'Ability Increase', 'Alter Ego', 'Alternate Form', 'Aquatic', 'Density'],
      ['Duplication', 'Extra Body Parts', 'Growth', 'Invisibility', 'Phasing', 'Shrinking'],
      ['Animal Mimicry', 'Material Mimicry', 'Plant Mimicry', 'Power Mimicry', 'Stretching', 'Transformation'] ],
    c: [ ['Alteration Ray', 'Element Control', 'Probability Control', 'Time Control'],
    ['Energy Control', 'Telekinesis', 'Healing', 'Transmutation'],
    ['Gadgets', 'Cosmic Power', 'Magic', 'Nullification', 'Servant'] ],
    d: [ ['Absorption', 'Force Field', 'Adaptation'], ['Life Support', 'Reflection', 'Immortality'],
         ['Regeneration','Resistance'] ],
    men: [ ['Emotion Control', 'Astral Projection', 'Dream Control', 'Illusion', 'Images'],
    ['Mental Blast', 'Telepathy', 'Mind Control', 'Mind Shield']  ],
    mov: [ ['Flight', 'Leaping', 'Burrowing', 'Dimensional Travel'],
      ['Super-Speed', 'Spinning', 'Swinging', 'Teleportation', 'Wall-Crawling'] ],
    o: [ ['Blast', 'Strike', 'Affliction', 'Binding'],
         ['Dazzle', 'Aura', 'Energy Drain', 'Fast Attack', 'Stunning'] ],
    s:  [ ['Super-Senses', 'Detection', 'ESP'], ['Danger Sense', 'Precognition', 'Interface', 'Postcognition'] ]
  },
  q: [
    'Archenemy of [x]',
    '<Epithet>',
    'Single parent',
    'Eye for detail',
    'World\'s greatest <x>',
    'Secret ID (?)',
    '<profession>',
    '<x>! My weakness!',
    'I need <x> to survive!',
    'In love with someone \'satiably curious',
    'A new day, a new love',
    'Helping the helpless',
    'With great power...',
    'Living a lie',
    'Secret: <x>',
    'Vulnerable to <x> (Extra degree damage)',
    'Not from around here',
    'Unstuck in time',
    'Brightest person in the room',
    'Made by the best men',
    'This man, this monster!',
    'Heart on sleeve, brain in pants',
    'Mistaken identity',
    '"Awww! Who\'s a cute widdle baby!"'
  ]
};
var charflds = {
  ID: null,
  Specialties: null,
  Powers: null,
  Qualities: null,
  P: null,
  C: null,
  S: null,
  I: null,
  A: null,
  W: null,
  STA: null,
  DP: null
};
for (var x in charflds){
  charflds[x] = this.getField(x);
  if (!charflds[x])  if (typeof charflds[x] === 'combobox') charflds[x].commitOnSelChange = true;
  else app.alert('Field '+x+' not found');
}
/*
function importing(){
    var rawText = this.getField('Notes').value.trim();
    var lines = rawText.split(/[\r\n]/);
    var amIn='ID';
    charflds.ID.value = lines[0].replace(/^Name:\s* /i,'');
    for (var i = 1; i< lines.length;i++){
      if (/PRW|CRD|STR|INT|AWR|WIL|DET|STA/.test(lines[i])){
        attrib.importing(lines[i]);
      } else if (/Specialties:/.test(lines[i])){
        amIn='Specialties';
      } else if (/Powers:/.test(lines[i])){
        amIn='Powers';
      } else if (/Qualities:/.test(lines[i])){
        amIn='Qualities';
      } else {
         var tmp = lines[i].replace('\u2022 ','');
         this.getField(amin).value = tmp;
      }
    }
    attrib.write();
}
fuction asTxt(){
    var str = 'Name: '+page.getField('ID').value;
    var x = page.getField('Origin').currentValueIndices;
    str += ' ('+cvt.o[x]+')\r';
    for (var x in cvt.a){
      var f = page.getField(x);
      if (f){
        str += cvt.a[x]+' '+f.value+'\r';
      }
    }
    str +='Specialties:\r';
    f = page.getField('Specialties');
    str += (f) ? f.value + '\r' : '\r';
    str += 'Powers\r';
    f = page.getField('Powers')
    str += (f) ? f.value + '\r' : '\r';
    f = page.getField('Qualities');
    str += (f) f.value + '\r' : '\r';
    f = page.getField('Notes');
    if (f) f.value = str;
    return;
}
*/
var lookup = {
  /* Note that the powers are not in the same order they are in the book.
     Defensive, alteration, and sensory powers get special treatment; the rest
     can be divided into oneCommon (one power is twice as likely as others)
     and twoCommon (two powers are likely) */
};
var make = {
  specs: function(){
    var n = roll.numOf();
    var str = '';
    for (var x = n; x; x--){
      str += roll.specTxt();
      if (x > 1) str += ', ';
    }
    charflds.Specialties.value = str;
  },
  getAlt: function(){
    var arr = tbls.ia.a;
    return arr[roll.d6(1,0,3)][roll.d6(1,0)];
  },
  getCtl: function(){
    var arr = tbls.ia.c;
    var n = roll.d6(1,0,3);
    return (n == 2) ? arr[n][roll.fiveP()] : arr[n][roll.fourP()];
  },
  getDef: function(){
    var arr = tbls.ia.d;
    var n = roll.d6(1,0,3);
    return (n == 2) ? arr[n][roll.inAny([4],1)] : arr[n][roll.inAny([3,5],1)];
  },
  getMov: function(){
    var arr = tbls.ia.mov;
    return (roll.d6(1,0,2)) ? arr[0][roll.fourP()]: arr[1][roll.fiveP()];
  },
  getMen: function(){
    var arr = tbls.ia.men;
    return (roll.d6(1,0,2))? arr[0][roll.fiveP()] : arr[1][roll.fourP()];
  },
  getOff: function(){
    var arr =  tbls.ia.o;
    return (roll.d6(1,0,2)) ? arr[0][roll.fourP()] : arr[1][roll.fiveP()]; 
  },
  getSen: function(){
    var arr = tbls.ia.s;
    return (roll.d6(1,0,2))? arr[0][roll.threeP()] : arr[1][roll.fourP()];
  },
  pwrs: function(){
    var n = roll.numOf(true);
    charflds.DP.value = 6 - Math.min(5,(n+attrib.getPwrs()));
    var str = '';
    for (var x = n; x; x--){
    str += cvt.lvl[roll.lvl()]+' '+roll.pwrTxt();
    if (x > 1) str += '\r';
    }
    charflds.Powers.value = str;
    return n;
  },
  quals: function(){
    var str = '';
    for (var x = 3; x; x--){
      str += tbls.q[roll.d6(1,0,tbls.q.length)];
      if (x > 1) str += '\r';
    }
    charflds.Qualities.value = str;
  },
  char: function(){
    page.getField('ID').value = '';
    roll.o();
    attrib.make();
    attrib.write();
    this.specs();
    this.pwrs();
    this.quals();
  }
};
var ogltext = 'OPEN GAME LICENSE Version 1.0\r'+
'The following text is the property of Wizards of the Coast, Inc. and is Copyright 2000 Wizards of the Coast, Inc (“Wizards”). All Rights Reserved.\r'+
'1. Definitions: (a)”Contributors” means the copyright and/or trademark owners who have contributed Open Game Content; (b)”Derivative Material” means copyrighted material including derivative works and translations (including into other computer languages), potation, modification, correction, addition, extension, upgrade, improvement, compilation, abridgment or other form in which an existing work may be recast, transformed or adapted; (c) “Distribute” means to reproduce, license, rent, lease, sell, broadcast, publicly display, transmit or otherwise distribute; (d)”Open Game Content” means the game mechanic and includes the methods, procedures, processes and routines to the extent such content does not embody the Product Identity and is an enhancement over the prior art and any additional content clearly identified as Open Game Content by the Contributor, and means any work covered by this License, including translations and derivative works under copyright law, but specifically excludes Product Identity. (e) “Product Identity” means product and product line names, logos and identifying marks including trade dress; artifacts; creatures characters; stories, storylines, plots, thematic elements, dialogue, incidents, language, artwork, symbols, designs, depictions, likenesses, formats, poses, concepts, themes and graphic, photographic and other visual or audio representations; names and descriptions of characters, spells, enchantments, personalities, teams, personas, likenesses and special abilities; places, locations, environments, creatures, equipment, magical or supernatural abilities or effects, logos, symbols, or graphic designs; and any other trademark or registered trademark clearly identified as Product identity by the owner of the Product Identity, and which specifically excludes the Open Game Content; (f) “Trademark” means the logos, names, mark, sign, motto, designs that are used by a Contributor to identify itself or its products or the associated products contributed to the Open Game License by the Contributor (g) “Use”, “Used” or “Using” means to use, Distribute, copy, edit, format, modify, translate and otherwise create Derivative Material of Open Game Content. (h) “You” or “Your” means the licensee in terms of this agreement.\r'+
'2. The License: This License applies to any Open Game Content that contains a notice indicating that the Open Game Content may only be Used under and in terms of this License. You must affix such a notice to any Open Game Content that you Use. No terms may be added to or subtracted from this License except as described by the License itself. No other terms or conditions may be applied to any Open Game Content distributed using this License.\r'+
'3.Offer and Acceptance: By Using the Open Game Content You indicate Your acceptance of the terms of this License.\r'+
'4. Grant and Consideration: In consideration for agreeing to use this License, the Contributors grant You a perpetual, worldwide, royalty-free, non-exclusive license with the exact terms of this License to Use, the Open Game Content.\r'+
'5.Representation of Authority to Contribute: If You are contributing original material as Open Game Content, You represent that Your Contributions are Your original creation and/or You have sufficient rights to grant the rights conveyed by this License.\r'+
'6.Notice of License Copyright: You must update the COPYRIGHT NOTICE portion of this License to include the exact text of the COPYRIGHT NOTICE of any Open Game Content You are copying, modifying or distributing, and You must add the title, the copyright date, and the copyright holder’s name to the COPYRIGHT NOTICE of any original Open Game Content you Distribute.\r'+
'7. Use of Product Identity: You agree not to Use any Product Identity, including as an indication as to compatibility, except as expressly licensed in another, independent Agreement with the owner of each element of that Product Identity. You agree not to indicate compatibility or co-adaptability with any Trademark or Registered Trademark in conjunction with a work containing Open Game Content except as expressly licensed in another, independent Agreement with the owner of such Trademark or Registered Trademark. The use of any Product Identity in Open Game Content does not constitute a challenge to the ownership of that Product Identity. The owner of any Product Identity used in Open Game Content shall retain all rights, title and interest in and to that Product Identity.\r'+
'8. Identification: If you distribute Open Game Content You must clearly indicate which portions of the work that you are distributing are Open Game Content.\r'+
'9. Updating the License: Wizards or its designated Agents may publish updated versions of this License. You may use any authorized version of this License to copy, modify and distribute any Open Game Content originally distributed under any version of this License.\r'+
'10 Copy of this License: You MUST include a copy of this License with every copy of the Open Game Content You Distribute.\r'+
'11. Use of Contributor Credits: You may not market or advertise the Open Game Content using the name of any Contributor unless You have written permission from the Contributor to do so.\r'+
'12 Inability to Comply: If it is impossible for You to comply with any of the terms of this License with respect to some or all of the Open Game Content due to statute, judicial order, or governmental regulation then You may not Use any Open Game Material so affected.\r'+
'13 Termination: This License will terminate automatically if You fail to comply with all terms herein and fail to cure such breach within 30 days of becoming aware of the breach. All sublicenses shall survive the termination of this License.\r'+
'14 Reformation: If any provision of this License is held to be unenforceable, such provision shall be reformed only to the extent necessary to make it enforceable.\r'+
'15. COPYRIGHT NOTICE\r'+
'Open Game License v 1.0 Copyright 2000, Wizards of the Coast, Inc.\r'+
'Fudge System Reference Document Copyright 2005, Grey Ghost Press, Inc.; Authors Steffan O’Sullivan and Ann Dupuis, with additional material by Peter Bonney, Deird’Re Brooks, Reimer Behrends, Shawn Garbett, Steven Hammond, Ed Heil, Barnard Hsiung, Sedge Lewis, Gordon McCormick, Kent Matthewson, Peter Mikelsons, Anthony Roberson, Andy Skinner, Stephan Szabo, John Ughrin, Dmitri Zagiduin.\r'+
'FATE (Fantastic Adventures in Tabletop Entertainment), Copyright 2003 by Evil Hat Productions, LCC; Authors Robert Donoghue and Fred Hicks.\r'+
'Spirit of the Century, Copyright 2006, Evil Hat Productions, LLC. Authors Robert Donoghue, Fred Hicks, and Leonard Balsera.\r'+
'Icons, Copyright 2010, Steve Kenson, published by Adamant Entertainment in partnership with Cubicle Seven Entertainment, Ltd.\r'+
'Icons Team-Up, Copyright 2013, Adamant Entertainment, Authors Steve Kenson, G.M. Skarka, and Morgan Davie.\r'+
'Icons: The Assembled Edition, Copyright 2014, Ad Infinitum Adventures; Author: Steve Kenson.\r';

function showOGL(state){ /* state is true or false: display or hide */
    var f = this.getField('OGL');
    if (f) {
      if (state === undefined) state = (f.display === display.visible || f.display === display.noPrint) ? false:true;
      oglState = state;
      f.value = ogltext;
      f.rect = (oglState) ? [18,330,480,30] : [18, 18, 20, 20 ];
      f.display = (state)?display.visible:display.hidden;
    }
}
