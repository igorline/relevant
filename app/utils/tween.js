/*
  tween.add({
    obj: el.style,
    units: "px",
    from: { left: 0 },
    to: { left: 100 },
    duration: 1000,
    easing: easing.circ_out,
    update: function(obj){
      console.log(obj.left)
    }
    finished: function(){
      console.log("done")
    }
  })
*/

const lerp = (n, a, b) => (b - a) * n + a;

let tweens = [];

let lastT = 0;
let id = 0;
let animationFrame = 0;

const speed = 1;

export const add = tween => {
  tween.id = id++;
  tween.obj = tween.obj || {};
  if (tween.easing) {
    if (typeof tween.easing === 'string') {
      tween.easing = easing[tween.easing];
    }
  } else {
    tween.easing = easing.linear;
  }
  if (!('from' in tween) && !('to' in tween)) {
    tween.keys = [];
  } else if (!('from' in tween)) {
    tween.from = {};
    tween.keys = Object.keys(tween.to);
    tween.keys.forEach(prop => {
      tween.from[prop] = parseFloat(tween.obj[prop]);
    });
  } else {
    tween.keys = Object.keys(tween.from);
  }
  tween.delay = tween.delay || 0;
  tween.start = lastT + tween.delay;
  tween.done = false;
  tween.after = tween.after || [];
  tween.then = fn => {
    tween.after.push(fn);
    return tween;
  };
  tween.tick = 0;
  tween.skip = tween.skip || 1;
  tween.dt = 0;
  tweens.push(tween);
  return tween;
};

export const update = t => {
  let done = false;
  animationFrame = requestAnimationFrame(update);
  lastT = t * speed;
  if (tweens.length === 0) return;
  tweens.forEach(tween => {
    const dt = Math.min(1.0, (t - tween.start) / tween.duration);
    tween.tick++;
    if (dt < 0 || (dt < 1 && tween.tick % tween.skip !== 0)) return;
    const ddt = tween.easing(dt);
    tween.dt = ddt;
    tween.keys.forEach(prop => {
      let val = lerp(ddt, tween.from[prop], tween.to[prop]);
      if (tween.round) val = Math.round(val);
      if (tween.units) val = Math.round(val) + tween.units;
      tween.obj[prop] = val;
    });
    if (tween.update) {
      tween.update(tween.obj, dt);
    }
    if (dt === 1) {
      if (tween.finished) {
        tween.finished(tween);
      }
      if (tween.after.length) {
        const twn = tween.after.shift();
        twn.obj = twn.obj || tween.obj;
        twn.after = tween.after;
        add(twn);
      }
      if (tween.loop) {
        tween.start = t + tween.delay;
      } else {
        done = true;
        tween.done = true;
      }
    }
  });
  if (done) {
    tweens = tweens.filter(tween => !tween.done);
  }
};

export const remove = tween => {
  if (tween) tweens = tweens.filter(t => t.id !== tween.id);
};

export const start = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(update);
};

export const stop = () => {
  cancelAnimationFrame(animationFrame);
};

export const reset = () => {
  stop();
  tweens = [];
};

export const easing = {
  linear: t => t,
  circ_out: t => Math.sqrt(1 - (t -= 1) * t),
  circ_in: t => -(Math.sqrt(1 - t * t) - 1),
  circ_in_out: t => {
    t *= 2;
    return t < 1
      ? -0.5 * (Math.sqrt(1 - t * t) - 1)
      : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
  },
  quad_in: n => n ** 2,
  quad_out: n => n * (n - 2) * -1,
  quad_in_out: n => {
    n *= 2;
    if (n < 1) {
      return n ** 2 / 2;
    }
    return (-1 * (--n * (n - 2) - 1)) / 2;
  },
  cubic_bezier: (mX1, mY1, mX2, mY2) => {
    function A(aA1, aA2) {
      return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    function B(aA1, aA2) {
      return 3.0 * aA2 - 6.0 * aA1;
    }
    function C(aA1) {
      return 3.0 * aA1;
    }

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function CalcBezier(aT, aA1, aA2) {
      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    // function GetSlope(aT, aA1, aA2) {
    //   return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    // }

    // function GetTForX(aX) {
    //   // Newton raphson iteration
    //   let aGuessT = aX
    //   for (let i = 0; i < 10; ++i) {
    //     const currentSlope = GetSlope(aGuessT, mX1, mX2)
    //     if (currentSlope == 0.0) return aGuessT
    //     const currentX = CalcBezier(aGuessT, mX1, mX2) - aX
    //     aGuessT -= currentX / currentSlope
    //   }
    //   return aGuessT
    // }

    return aX => {
      if (mX1 === mY1 && mX2 === mY2) return aX; // linear
      return CalcBezier(aX, mY1, mY2);
    };
  }
};
