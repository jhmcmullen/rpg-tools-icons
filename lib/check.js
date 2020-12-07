var page=this;
/* Play */
var check = {a: 0, m: 0, r: 0};
check.a = this.getField('At');
if (check.a) check.a.commitOnSelChange = true;
else app.alert('Combobox At missing');
check.m = this.getField('Mod');
if (check.m) check.m.commitOnSelChange = true;
else app.alert('Combobox Mod missing');
check.r = this.getField('Roll');
if (!check.r) app.alert('Roll field missing');
