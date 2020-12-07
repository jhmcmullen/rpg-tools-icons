var page = this;
var io = {
  get: function(fld){
    if (typeof fld == 'object') return fld;
    var f = page.getField(fld);
    if (f) return f;
    else app.alert(fld+' not found');
    return null;
  },
  inlist: function(fld,what,ex){
    var f = this.get(fld);
    if (!f) return null;
    if (f.currentValueIndices < 0) {
      if (what === f.value) return -1;
      return -2;
    }
    for (var x = 0; x < f.numItems; x++){
      if (f.getItemAt(x,ex) === what) return x;
    }
    return -2;
  },
  r: function(fld,ex){
    var f = this.get(fld);
    if (!f) return;
    switch (f.type){
      case 'combobox': var i = f.currentValueIndices;
        if (i < 0) return f.value;
        else return f.getItemAt(i,ex);
        break;
      case 'listbox': i = f.currentValueIndices;
        return f.getItemAt(i,ex);
        break;
      default: return f.value;
    }
  },
  w: function(fld,what,opt){
    var f = this.get(fld);
    if (!f) return;
    switch (f.type){
      case 'listbox':
      case 'combobox': var x = this.inlist(fld,what,opt);
        if (x < 0 && f.editable) f.value = what;
        else f.currentValueIndices = x;
        break;
      case 'text': 
        if (opt) f.value += '\r' + what;
        else f.value = what;
        break;
      default: f.value = what;
    }
  }
};
