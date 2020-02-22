export const makeInterval = (
  ms: number | null,
  long: boolean = true
): string => {
  let result;
  let d;
  let h;
  let m;
  let s;
  let t;
  if (typeof ms === "number") {
    let ago = ms < 0;
    ms = Math.abs(ms);
    t = Math.floor(ms / 1000);
    s = t % 60;
    t = Math.floor(t / 60);
    m = t % 60;
    t = Math.floor(t / 60);
    h = t % 24;
    d = Math.floor(t / 24);
    if (long) {
      return `${ago ? "- " : ""}${d}☼ ${h}:${("" + m).padStart(2, "0")}:${(
        "" + s
      ).padStart(2, "0")}`;
    } else {
      d += +((d || (h === 23 && m >= 30)) && h >= 12);
      if (d) {
        result = `${d} day${d === 1 ? "" : "s"}`;
      } else {
        h += +((h || (m === 59 && s >= 30)) && m >= 30);
        if (h) {
          result = `${h} hour${h === 1 ? "" : "s"}`;
        } else {
          m += m && +(s >= 30);
          if (m) {
            result = `${m} minute${m === 1 ? "" : "s"}`;
          } else {
            result = `${s} second${s === 1 ? "" : "s"}`;
          }
        }
      }
      return `${result}${ago ? " ago" : ""}`;
    }
  } else {
    return "-";
  }
};
