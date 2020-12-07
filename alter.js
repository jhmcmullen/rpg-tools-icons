var page=this;
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
