export function percentChange(user) {
  let percent = 0;
  if (user.relevanceRecord && user.relevanceRecord[1]) {
    let last = user.relevanceRecord[1];
    let oldRel = last.relevance;
    percent = ((user.relevance - oldRel) * 100) / oldRel;
    let timeInteraval = new Date() - new Date(last.time);
    let scale = ( 1 * 24 * 60 * 60 * 1000) / timeInteraval;
    percent *= scale;
    if (percent < 10) percent = Math.round(percent * 10) / 10;
    else if (percent < 1) percent = Math.round(percent * 100) / 100;
    else percent = Math.round(percent);
  }
  return percent;
}
