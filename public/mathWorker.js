/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 628:
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * @license Fraction.js v4.2.0 05/03/2022
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/


/**
 *
 * This class offers the possibility to calculate fractions.
 * You can pass a fraction in different formats. Either as array, as double, as string or as an integer.
 *
 * Array/Object form
 * [ 0 => <nominator>, 1 => <denominator> ]
 * [ n => <nominator>, d => <denominator> ]
 *
 * Integer form
 * - Single integer value
 *
 * Double form
 * - Single double value
 *
 * String form
 * 123.456 - a simple double
 * 123/456 - a string fraction
 * 123.'456' - a double with repeating decimal places
 * 123.(456) - synonym
 * 123.45'6' - a double with repeating last place
 * 123.45(6) - synonym
 *
 * Example:
 *
 * var f = new Fraction("9.4'31'");
 * f.mul([-4, 3]).div(4.9);
 *
 */

(function(root) {

  "use strict";

  // Maximum search depth for cyclic rational numbers. 2000 should be more than enough.
  // Example: 1/7 = 0.(142857) has 6 repeating decimal places.
  // If MAX_CYCLE_LEN gets reduced, long cycles will not be detected and toString() only gets the first 10 digits
  var MAX_CYCLE_LEN = 2000;

  // Parsed data to avoid calling "new" all the time
  var P = {
    "s": 1,
    "n": 0,
    "d": 1
  };

  function assign(n, s) {

    if (isNaN(n = parseInt(n, 10))) {
      throw Fraction['InvalidParameter'];
    }
    return n * s;
  }

  // Creates a new Fraction internally without the need of the bulky constructor
  function newFraction(n, d) {

    if (d === 0) {
      throw Fraction['DivisionByZero'];
    }

    var f = Object.create(Fraction.prototype);
    f["s"] = n < 0 ? -1 : 1;

    n = n < 0 ? -n : n;

    var a = gcd(n, d);

    f["n"] = n / a;
    f["d"] = d / a;
    return f;
  }

  function factorize(num) {

    var factors = {};

    var n = num;
    var i = 2;
    var s = 4;

    while (s <= n) {

      while (n % i === 0) {
        n/= i;
        factors[i] = (factors[i] || 0) + 1;
      }
      s+= 1 + 2 * i++;
    }

    if (n !== num) {
      if (n > 1)
        factors[n] = (factors[n] || 0) + 1;
    } else {
      factors[num] = (factors[num] || 0) + 1;
    }
    return factors;
  }

  var parse = function(p1, p2) {

    var n = 0, d = 1, s = 1;
    var v = 0, w = 0, x = 0, y = 1, z = 1;

    var A = 0, B = 1;
    var C = 1, D = 1;

    var N = 10000000;
    var M;

    if (p1 === undefined || p1 === null) {
      /* void */
    } else if (p2 !== undefined) {
      n = p1;
      d = p2;
      s = n * d;

      if (n % 1 !== 0 || d % 1 !== 0) {
        throw Fraction['NonIntegerParameter'];
      }

    } else
      switch (typeof p1) {

        case "object":
          {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n*= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throw Fraction['InvalidParameter'];
            }
            s = n * d;
            break;
          }
        case "number":
          {
            if (p1 < 0) {
              s = p1;
              p1 = -p1;
            }

            if (p1 % 1 === 0) {
              n = p1;
            } else if (p1 > 0) { // check for != 0, scale would become NaN (log(0)), which converges really slow

              if (p1 >= 1) {
                z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                p1/= z;
              }

              // Using Farey Sequences
              // http://www.johndcook.com/blog/2010/10/20/best-rational-approximation/

              while (B <= N && D <= N) {
                M = (A + C) / (B + D);

                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;

                } else {

                  if (p1 > M) {
                    A+= C;
                    B+= D;
                  } else {
                    C+= A;
                    D+= B;
                  }

                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n*= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
        case "string":
          {
            B = p1.match(/\d+|./g);

            if (B === null)
              throw Fraction['InvalidParameter'];

            if (B[A] === '-') {// Check for minus sign at the beginning
              s = -1;
              A++;
            } else if (B[A] === '+') {// Check for plus sign at the beginning
              A++;
            }

            if (B.length === A + 1) { // Check if it's just a simple number "1234"
              w = assign(B[A++], s);
            } else if (B[A + 1] === '.' || B[A] === '.') { // Check if it's a decimal number

              if (B[A] !== '.') { // Handle 0.5 and .5
                v = assign(B[A++], s);
              }
              A++;

              // Check for decimal places
              if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
                w = assign(B[A], s);
                y = Math.pow(10, B[A].length);
                A++;
              }

              // Check for repeating places
              if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
                x = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A+= 3;
              }

            } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A+= 3;
            } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A+= 5;
            }

            if (B.length <= A) { // Check for more tokens on the stack
              d = y * z;
              s = /* void */
              n = x + d * v + z * w;
              break;
            }

            /* Fall through on error */
          }
        default:
          throw Fraction['InvalidParameter'];
      }

    if (d === 0) {
      throw Fraction['DivisionByZero'];
    }

    P["s"] = s < 0 ? -1 : 1;
    P["n"] = Math.abs(n);
    P["d"] = Math.abs(d);
  };

  function modpow(b, e, m) {

    var r = 1;
    for (; e > 0; b = (b * b) % m, e >>= 1) {

      if (e & 1) {
        r = (r * b) % m;
      }
    }
    return r;
  }


  function cycleLen(n, d) {

    for (; d % 2 === 0;
      d/= 2) {
    }

    for (; d % 5 === 0;
      d/= 5) {
    }

    if (d === 1) // Catch non-cyclic numbers
      return 0;

    // If we would like to compute really large numbers quicker, we could make use of Fermat's little theorem:
    // 10^(d-1) % d == 1
    // However, we don't need such large numbers and MAX_CYCLE_LEN should be the capstone,
    // as we want to translate the numbers to strings.

    var rem = 10 % d;
    var t = 1;

    for (; rem !== 1; t++) {
      rem = rem * 10 % d;

      if (t > MAX_CYCLE_LEN)
        return 0; // Returning 0 here means that we don't print it as a cyclic number. It's likely that the answer is `d-1`
    }
    return t;
  }


  function cycleStart(n, d, len) {

    var rem1 = 1;
    var rem2 = modpow(10, len, d);

    for (var t = 0; t < 300; t++) { // s < ~log10(Number.MAX_VALUE)
      // Solve 10^s == 10^(s+t) (mod d)

      if (rem1 === rem2)
        return t;

      rem1 = rem1 * 10 % d;
      rem2 = rem2 * 10 % d;
    }
    return 0;
  }

  function gcd(a, b) {

    if (!a)
      return b;
    if (!b)
      return a;

    while (1) {
      a%= b;
      if (!a)
        return b;
      b%= a;
      if (!b)
        return a;
    }
  };

  /**
   * Module constructor
   *
   * @constructor
   * @param {number|Fraction=} a
   * @param {number=} b
   */
  function Fraction(a, b) {

    parse(a, b);

    if (this instanceof Fraction) {
      a = gcd(P["d"], P["n"]); // Abuse variable a
      this["s"] = P["s"];
      this["n"] = P["n"] / a;
      this["d"] = P["d"] / a;
    } else {
      return newFraction(P['s'] * P['n'], P['d']);
    }
  }

  Fraction['DivisionByZero'] = new Error("Division by Zero");
  Fraction['InvalidParameter'] = new Error("Invalid argument");
  Fraction['NonIntegerParameter'] = new Error("Parameters must be integer");

  Fraction.prototype = {

    "s": 1,
    "n": 0,
    "d": 1,

    /**
     * Calculates the absolute value
     *
     * Ex: new Fraction(-4).abs() => 4
     **/
    "abs": function() {

      return newFraction(this["n"], this["d"]);
    },

    /**
     * Inverts the sign of the current fraction
     *
     * Ex: new Fraction(-4).neg() => 4
     **/
    "neg": function() {

      return newFraction(-this["s"] * this["n"], this["d"]);
    },

    /**
     * Adds two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
     **/
    "add": function(a, b) {

      parse(a, b);
      return newFraction(
        this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Subtracts two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
     **/
    "sub": function(a, b) {

      parse(a, b);
      return newFraction(
        this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Multiplies two rational numbers
     *
     * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
     **/
    "mul": function(a, b) {

      parse(a, b);
      return newFraction(
        this["s"] * P["s"] * this["n"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Divides two rational numbers
     *
     * Ex: new Fraction("-17.(345)").inverse().div(3)
     **/
    "div": function(a, b) {

      parse(a, b);
      return newFraction(
        this["s"] * P["s"] * this["n"] * P["d"],
        this["d"] * P["n"]
      );
    },

    /**
     * Clones the actual object
     *
     * Ex: new Fraction("-17.(345)").clone()
     **/
    "clone": function() {
      return newFraction(this['s'] * this['n'], this['d']);
    },

    /**
     * Calculates the modulo of two rational numbers - a more precise fmod
     *
     * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
     **/
    "mod": function(a, b) {

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return new Fraction(NaN);
      }

      if (a === undefined) {
        return newFraction(this["s"] * this["n"] % this["d"], 1);
      }

      parse(a, b);
      if (0 === P["n"] && 0 === this["d"]) {
        throw Fraction['DivisionByZero'];
      }

      /*
       * First silly attempt, kinda slow
       *
       return that["sub"]({
       "n": num["n"] * Math.floor((this.n / this.d) / (num.n / num.d)),
       "d": num["d"],
       "s": this["s"]
       });*/

      /*
       * New attempt: a1 / b1 = a2 / b2 * q + r
       * => b2 * a1 = a2 * b1 * q + b1 * b2 * r
       * => (b2 * a1 % a2 * b1) / (b1 * b2)
       */
      return newFraction(
        this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
        P["d"] * this["d"]
      );
    },

    /**
     * Calculates the fractional gcd of two rational numbers
     *
     * Ex: new Fraction(5,8).gcd(3,7) => 1/56
     */
    "gcd": function(a, b) {

      parse(a, b);

      // gcd(a / b, c / d) = gcd(a, c) / lcm(b, d)

      return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
    },

    /**
     * Calculates the fractional lcm of two rational numbers
     *
     * Ex: new Fraction(5,8).lcm(3,7) => 15
     */
    "lcm": function(a, b) {

      parse(a, b);

      // lcm(a / b, c / d) = lcm(a, c) / gcd(b, d)

      if (P["n"] === 0 && this["n"] === 0) {
        return newFraction(0, 1);
      }
      return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
    },

    /**
     * Calculates the ceil of a rational number
     *
     * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
     **/
    "ceil": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return newFraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Calculates the floor of a rational number
     *
     * Ex: new Fraction('4.(3)').floor() => (4 / 1)
     **/
    "floor": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return newFraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Rounds a rational numbers
     *
     * Ex: new Fraction('4.(3)').round() => (4 / 1)
     **/
    "round": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return newFraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Gets the inverse of the fraction, means numerator and denominator are exchanged
     *
     * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
     **/
    "inverse": function() {

      return newFraction(this["s"] * this["d"], this["n"]);
    },

    /**
     * Calculates the fraction to some rational exponent, if possible
     *
     * Ex: new Fraction(-1,2).pow(-3) => -8
     */
    "pow": function(a, b) {

      parse(a, b);

      // Trivial case when exp is an integer

      if (P['d'] === 1) {

        if (P['s'] < 0) {
          return newFraction(Math.pow(this['s'] * this["d"], P['n']), Math.pow(this["n"], P['n']));
        } else {
          return newFraction(Math.pow(this['s'] * this["n"], P['n']), Math.pow(this["d"], P['n']));
        }
      }

      // Negative roots become complex
      //     (-a/b)^(c/d) = x
      // <=> (-1)^(c/d) * (a/b)^(c/d) = x
      // <=> (cos(pi) + i*sin(pi))^(c/d) * (a/b)^(c/d) = x         # rotate 1 by 180°
      // <=> (cos(c*pi/d) + i*sin(c*pi/d)) * (a/b)^(c/d) = x       # DeMoivre's formula in Q ( https://proofwiki.org/wiki/De_Moivre%27s_Formula/Rational_Index )
      // From which follows that only for c=0 the root is non-complex. c/d is a reduced fraction, so that sin(c/dpi)=0 occurs for d=1, which is handled by our trivial case.
      if (this['s'] < 0) return null;

      // Now prime factor n and d
      var N = factorize(this['n']);
      var D = factorize(this['d']);

      // Exponentiate and take root for n and d individually
      var n = 1;
      var d = 1;
      for (var k in N) {
        if (k === '1') continue;
        if (k === '0') {
          n = 0;
          break;
        }
        N[k]*= P['n'];

        if (N[k] % P['d'] === 0) {
          N[k]/= P['d'];
        } else return null;
        n*= Math.pow(k, N[k]);
      }

      for (var k in D) {
        if (k === '1') continue;
        D[k]*= P['n'];

        if (D[k] % P['d'] === 0) {
          D[k]/= P['d'];
        } else return null;
        d*= Math.pow(k, D[k]);
      }

      if (P['s'] < 0) {
        return newFraction(d, n);
      }
      return newFraction(n, d);
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "equals": function(a, b) {

      parse(a, b);
      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"]; // Same as compare() === 0
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "compare": function(a, b) {

      parse(a, b);
      var t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
      return (0 < t) - (t < 0);
    },

    "simplify": function(eps) {

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return this;
      }

      eps = eps || 0.001;

      var thisABS = this['abs']();
      var cont = thisABS['toContinued']();

      for (var i = 1; i < cont.length; i++) {

        var s = newFraction(cont[i - 1], 1);
        for (var k = i - 2; k >= 0; k--) {
          s = s['inverse']()['add'](cont[k]);
        }

        if (s['sub'](thisABS)['abs']().valueOf() < eps) {
          return s['mul'](this['s']);
        }
      }
      return this;
    },

    /**
     * Check if two rational numbers are divisible
     *
     * Ex: new Fraction(19.6).divisible(1.5);
     */
    "divisible": function(a, b) {

      parse(a, b);
      return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
    },

    /**
     * Returns a decimal representation of the fraction
     *
     * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
     **/
    'valueOf': function() {

      return this["s"] * this["n"] / this["d"];
    },

    /**
     * Returns a string-fraction representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toFraction(true) => "4 1/3"
     **/
    'toFraction': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str+= '-';
      }

      if (d === 1) {
        str+= n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str+= whole;
          str+= " ";
          n%= d;
        }

        str+= n;
        str+= '/';
        str+= d;
      }
      return str;
    },

    /**
     * Returns a latex representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
     **/
    'toLatex': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str+= '-';
      }

      if (d === 1) {
        str+= n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str+= whole;
          n%= d;
        }

        str+= "\\frac{";
        str+= n;
        str+= '}{';
        str+= d;
        str+= '}';
      }
      return str;
    },

    /**
     * Returns an array of continued fraction elements
     *
     * Ex: new Fraction("7/8").toContinued() => [0,1,7]
     */
    'toContinued': function() {

      var t;
      var a = this['n'];
      var b = this['d'];
      var res = [];

      if (isNaN(a) || isNaN(b)) {
        return res;
      }

      do {
        res.push(Math.floor(a / b));
        t = a % b;
        a = b;
        b = t;
      } while (a !== 1);

      return res;
    },

    /**
     * Creates a string representation of a fraction with all digits
     *
     * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
     **/
    'toString': function(dec) {

      var N = this["n"];
      var D = this["d"];

      if (isNaN(N) || isNaN(D)) {
        return "NaN";
      }

      dec = dec || 15; // 15 = decimal places when no repetation

      var cycLen = cycleLen(N, D); // Cycle length
      var cycOff = cycleStart(N, D, cycLen); // Cycle start

      var str = this['s'] < 0 ? "-" : "";

      str+= N / D | 0;

      N%= D;
      N*= 10;

      if (N)
        str+= ".";

      if (cycLen) {

        for (var i = cycOff; i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
        }
        str+= "(";
        for (var i = cycLen; i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
        }
        str+= ")";
      } else {
        for (var i = dec; N && i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
        }
      }
      return str;
    }
  };

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return Fraction;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}

})(this);


/***/ }),

/***/ 773:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = memoize;


/***/ }),

/***/ 185:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeDamageInfo = void 0;
const fraction_js_1 = __importDefault(__webpack_require__(628));
const constants_1 = __webpack_require__(334);
const math_1 = __webpack_require__(884);
const workerpool_1 = __importDefault(__webpack_require__(340));
const cumSumHits = (pmf) => {
    let acc = new fraction_js_1.default(0);
    return new Map(
    // eslint-disable-next-line no-return-assign
    [...pmf.entries()]
        .sort(([lk, lv], [rk, rv]) => lk - rk)
        .map(([val, p]) => [val + 1, (acc = acc.add(p))]));
};
function computeMissChance(toHitCumulative, advType, ac, critRate, failRate) {
    return (0, math_1.boundProb)(toHitCumulative.get(ac) || new fraction_js_1.default(1), critRate, failRate);
}
function computeFinalPMF2(advType, ac, missChance, critRate, failRate, damageString) {
    const simpleDamagePMF = (0, math_1.simpleProcess)(damageString);
    const simpleCritBonusPMF = (0, math_1.simpleProcess)(damageString, "raw");
    // printPMF(simpleCritBonusPMF);
    const regularHitChance = new fraction_js_1.default(1).sub(missChance).sub(critRate);
    const finalPMF = (0, math_1.one_or_three_pmfs)(simpleDamagePMF, simpleCritBonusPMF, new Map([[0, new fraction_js_1.default(1)]]), regularHitChance, critRate, missChance);
    // printPMF(finalPMF);
    // console.log(weighted_mean_pmf(finalPMF).toString(6));
    return finalPMF;
}
function computeToHitCumulative(damager, advType, player) {
    let playerAttackBonus;
    if (player) {
        playerAttackBonus =
            player?.attackBonus >= 0
                ? `+${player.attackBonus}`
                : `${player.attackBonus}`;
    }
    else {
        playerAttackBonus = 0;
    }
    // const damagerDamage = damager.damage.replace('mod', player.modifier?.toString() || '0');
    const simpleAttackPMFs = (0, math_1.simpleProcess)(`${constants_1.ADVANTAGE_TO_DICE[advType]} ${playerAttackBonus} ${damager.modifiers
        .map((m) => (["+", "-"].includes(m[0]) ? m : `+${m}`))
        .join(" ")}`);
    return cumSumHits(simpleAttackPMFs);
}
const computeDamageInfo = (damager, advType, player, toHitCumulativesOverride) => {
    console.log("COMPUTING!!");
    const toHitCumulatives = toHitCumulativesOverride && toHitCumulativesOverride?.length
        ? toHitCumulativesOverride
        : [computeToHitCumulative(damager, advType, player)];
    console.log("WW");
    console.log(toHitCumulatives);
    const critRate = (0, math_1.d20ToCritrate)(constants_1.ADVANTAGE_TO_DICE[advType], player?.critThreshold || 20);
    const failRate = (0, math_1.d20ToFailRate)(constants_1.ADVANTAGE_TO_DICE[advType]);
    const damagePMFByAC = constants_1.ACs.reduce((damageMap, ac) => {
        // if (damager.damagerType === 'onHit') {
        //   const onHitTriggeringAllMiss = Object.values(player.damagers).filter((d) => d.flags.triggersOnHit).map((thisDamager) => {
        //     const damagerAttackCumSum = computeToHitCumulative(player, thisDamager, advType).toHitCumulative;
        //     const damagerAdvType = [...thisDamager.advantageShow.entries()].filter(([_, show]) => show)[0][0];
        //     return computeMissChance(damagerAttackCumSum, damagerAdvType, ac, critRate, failRate).pow(thisDamager.count);
        //   }).reduce((acc, n) => acc.mul(n), new Fraction(1));
        //
        //   const firstHitPMF = computeFinalPMF(advType, ac, onHitTriggeringAllMiss, critRate, failRate, damagerDamage, 1);
        //   damageMap.set(ac, firstHitPMF);
        // } else {
        const missChance = toHitCumulatives.reduce((acc, n) => acc.mul(computeMissChance(n, advType, ac, critRate, failRate)), new fraction_js_1.default(1));
        const singleHitFinalDamagePMF = computeFinalPMF2(advType, ac, missChance, critRate, failRate, damager.damage);
        const finalDamagePMF = [...new Array(damager.count).keys()].reduce((acc, n) => (0, math_1.convolve_pmfs_sum_2)(singleHitFinalDamagePMF, acc, true), new Map([[0, new fraction_js_1.default(1)]]));
        damageMap.set(ac, finalDamagePMF);
        return damageMap;
    }, new Map());
    console.log("Returning damagePMFByAC");
    console.log({ damagePMFByAC });
    return {
        toHitCumulatives,
        damagePMFByAC,
    };
};
exports.computeDamageInfo = computeDamageInfo;
// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
workerpool_1.default.worker({
    computeDamageInfo: exports.computeDamageInfo,
    computeToHitCumulative,
});


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ACs = exports.NARROW_WIDTH = exports.PRESET_DAMAGERS = exports.defaultModifierOptions = exports.ADVANTAGE_TO_DICE = void 0;
exports.ADVANTAGE_TO_DICE = {
    superadvantage: '3d20kh',
    advantage: '2d20kh',
    normal: '1d20',
    disadvantage: '2d20kl',
    superdisadvantage: '3d20kl',
};
let modifierIndex = 0;
exports.defaultModifierOptions = [
    { label: 'Bless [+1d4]', value: (modifierIndex++).toString() },
    { label: 'Bane [-1d4]', value: (modifierIndex++).toString() },
    {
        label: 'S:DS Favored by the Gods [+2d4]',
        value: (modifierIndex++).toString(),
    },
    {
        label: 'C:PC Emboldening Bond [+1d4]',
        value: (modifierIndex++).toString(),
    },
    {
        label: 'D:S Cosmic Omen (Weal) [+1d4]',
        value: (modifierIndex++).toString(),
    },
];
const MODS_2_DATA = (rawModifiers) => {
    const modifierOptions = [];
    const modifiers = [];
    let index = modifierIndex;
    rawModifiers.forEach((modifier) => {
        modifierOptions.push({
            label: modifier,
            value: (++index).toString(),
        });
        modifiers.push(index.toString());
    });
    return { modifierOptions, modifiers };
};
// const make_preset = (name: string, damagerType: Damager['damagerType'], rawModifiers: string[], damage: string, count: number) => (
//   (key: number) => {
//     const { modifierOptions, modifiers } = MODS_2_DATA(rawModifiers);
//     return new Damager(key, damagerType, damage, count, name, modifierOptions, modifiers);
//   });
exports.PRESET_DAMAGERS = {
// 'Crossbow Expert+Sharpshooter Hand Crossbow': make_preset(
//   'CBE/SS + Hand Crossbow',
//   'regular',
//   ['Sharpshooter [-5]'],
//   '1d6+5+10',
//   1,
// ),
// 'Eldritch Blast + Agonizing Blast': make_preset(
//   'EB + Agonizing Blast',
//   'regular',
//   [],
//   '1d10+5',
//   1,
// ),
};
exports.NARROW_WIDTH = 850;
exports.ACs = [...Array(30).keys()].map((x) => x + 1);


/***/ }),

/***/ 884:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.weighted_mean_pmf = exports.simpleProcess = exports.isSimpleProcessable = exports.d20ToFailRate = exports.d20ToCritrate = exports.diceToPMFs = exports.one_or_three_pmfs = exports.one_or_other_pmfs = exports.convolve_pmfs_prod = exports.convolve_pmfs_sum_2 = exports.make_pmf = exports.cumSumHits = exports.printPMF = exports.boundProb = exports.zero_pmf = void 0;
// import type { critType } from '@/damage/DamagerCard/DamagerCard';
const fraction_js_1 = __importDefault(__webpack_require__(628));
const lodash_memoize_1 = __importDefault(__webpack_require__(773));
const zero_pmf = () => new Map([[0, ONE]]);
exports.zero_pmf = zero_pmf;
const ZERO = new fraction_js_1.default(0);
const ONE = new fraction_js_1.default(1);
const boundProb = (missChance, critRate, failRate) => {
    // console.log(`Bounding ${missChance.toString(3)} to ${critRate.toString(3)}-${failRate.toString(3)}`);
    if (missChance.valueOf() < failRate.valueOf()) {
        return failRate;
    }
    if (missChance.valueOf() > ONE.sub(critRate).valueOf()) {
        return ONE.sub(critRate);
    }
    return missChance;
    // const NotFailRate = ONE.sub(failRate);
    // const lowerBounded = missChance.valueOf() < critRate.valueOf() ? critRate : missChance;
    // console.log(`Lower bound: ${lowerBounded.toString(3)}`);
    // return lowerBounded.valueOf() > NotFailRate.valueOf() ? NotFailRate : lowerBounded;
};
exports.boundProb = boundProb;
const printPMF = (pmf) => {
    // eslint-disable-next-line no-console
    console.log(new Map([...pmf.entries()]
        .sort(([kl, _vl], [kr, _vr]) => kl - kr)
        .map(([k, v]) => [k, v.valueOf().toFixed(6)])));
};
exports.printPMF = printPMF;
const cumSumHits = (pmf) => {
    let acc = ZERO;
    return new Map([...pmf.entries()]
        .sort(([lk, lv], [rk, rv]) => lk - rk)
        .map(([val, p]) => [val + 1, (acc = acc.add(p))]));
};
exports.cumSumHits = cumSumHits;
const make_pmf = (diceFace, advantage = 0) => {
    if (advantage === 0) {
        return new Map([...Array(diceFace).keys()].map((i) => [i + 1, new fraction_js_1.default(1, diceFace)]));
    }
    const A = Math.abs(advantage) + 1;
    const x = [...Array(diceFace).keys()]
        .map((v) => v + 1)
        .map((v) => [v, new fraction_js_1.default(v ** A - (v - 1) ** A, diceFace ** A)]);
    return new Map([...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(([kl, _], [kr, __]) => (kl < kr ? -1 : 1)));
};
exports.make_pmf = make_pmf;
const convolve_pmfs_sum_2 = (pmfX_, pmfY_, add) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const pmfXMax = Math.max(...pmfX.keys());
    const pmfYMax = Math.max(...pmfY.keys());
    const jointProb = [...Array(pmfXMax + 1).keys()].map((xDex) => [...Array(pmfYMax + 1).keys()].map((yDex) => (pmfX.get(xDex) || ZERO).mul(pmfY.get(yDex) || ZERO)));
    const diagSign = add ? 1 : -1;
    const diagExtra = add ? 0 : pmfYMax - 1;
    const bound = (x) => x;
    return [...Array(pmfXMax + pmfYMax + 2 - 1).keys()].reduce((acc, diagDex) => acc.set(bound(diagDex), [...Array(pmfXMax + pmfYMax + 2).keys()]
        .map((i) => (jointProb[diagDex - diagExtra - diagSign * i] ?? [])[i] ?? ZERO)
        .reduce((l, r) => l.add(r))), new Map());
};
exports.convolve_pmfs_sum_2 = convolve_pmfs_sum_2;
const convolve_pmfs_prod = (pmfX_, pmfY_) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const pmf = new Map();
    [...pmfX.entries()].forEach(([xKey, xVal]) => [...pmfY.entries()].forEach(([yKey, yVal]) => {
        pmf.set(xKey * yKey, (pmf.get(xKey * yKey) || ZERO).add(xVal.mul(yVal)));
    }));
    return pmf;
};
exports.convolve_pmfs_prod = convolve_pmfs_prod;
const one_or_other_pmfs = (pmfX, pmfY, pX, pY) => {
    const pmf = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys()]);
    [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || ZERO).mul(pX).add((pmfY.get(k) || ZERO).mul(pY))));
    return pmf;
};
exports.one_or_other_pmfs = one_or_other_pmfs;
const one_or_three_pmfs = (pmfX, pmfY, pmfZ, pX, pY, pZ) => {
    const pmf = new Map();
    const keySet = new Set([
        ...pmfX.keys(),
        ...pmfY.keys(),
        ...pmfZ.keys(),
    ]);
    [...keySet].forEach((k) => pmf.set(k, (pmfX.get(k) || ZERO)
        .mul(pX)
        .add((pmfY.get(k) || ZERO).mul(pY))
        .add((pmfZ.get(k) || ZERO).mul(pZ))));
    return pmf;
};
exports.one_or_three_pmfs = one_or_three_pmfs;
const pmfMax = (pmfX_, pmfY_) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const getGT = (pmf, than) => [...pmf.values()]
        .slice(0, [...pmf.keys()].indexOf(than))
        .reduce((acc, n) => acc.add(n), ZERO);
    const pmfResult = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys()]);
    keySet.forEach((key) => {
        // console.log({ key });
        // console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
        // console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
        const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
        pmfResult.set(key, getGT(pmfX, key)
            .mul(pmfX.get(key) || ONE)
            .add(getGT(pmfY, key).mul(pmfY.get(key) || ONE))
            .add(xkey_ykey));
    });
    return pmfResult;
};
const pmfMin = (pmfX_, pmfY_) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const getGT = (pmf, than) => [...pmf.values()]
        .slice([...pmf.keys()].indexOf(than) + 1)
        .reduce((acc, n) => acc.add(n), ZERO);
    // console.log(getGT(pmfX, 2).toString(3));
    const pmfResult = new Map();
    const keySet = new Set([...pmfX.keys(), ...pmfY.keys()]);
    keySet.forEach((key) => {
        // console.log({ key });
        // console.log(getGT(pmfX, key).mul(pmfX.get(key) || ONE).toString(3));
        // console.log(getGT(pmfY, key).mul(pmfY.get(key) || ONE).toString(3));
        const xkey_ykey = (pmfX.get(key) || ZERO).mul(pmfY.get(key) || ZERO);
        pmfResult.set(key, getGT(pmfX, key)
            .mul(pmfX.get(key) || ONE)
            .add(getGT(pmfY, key).mul(pmfY.get(key) || ONE))
            .add(xkey_ykey));
    });
    return pmfResult;
};
// export const pmf_max = (pmfX: PMF, pmfY: PMF) => {
//   const keySet = [...new Set<number>([...pmfX.keys(), ...pmfY.keys()])].sort();
//
//   const width = keySet[keySet.length - 1] + 2;
//   console.log({ keySet });
//   console.log(keySet.slice(0, keySet.indexOf(2)));
//   return keySet
//     .map((n) => {
//       const l = keySet.slice(keySet.indexOf(n))
//         .map((x) => (pmfX.get(x) || ZERO)).reduce((acc, c) => acc.add(c), ZERO);
//       const r = keySet.slice(keySet.indexOf(n))
//         .map((y) => (pmfY.get(y) || ZERO));
//       return [n, [...l, ...r].reduce((acc, c) => acc.add(c), ZERO).toString(4)];
//     });
// };
const diceToPMFs = (dice) => {
    const [count, face] = dice.split("d");
    if (face) {
        if (face.endsWith("kh") || face.endsWith("kl")) {
            const c = Number(count) - 1;
            return [
                (0, exports.make_pmf)(Number(face.slice(0, -2)), face.endsWith("kh") ? c : -c),
            ];
        }
        return [...Array(Number(count) || 1).keys()].map((_) => (0, exports.make_pmf)(Number(face)));
    }
    return [new Map([[Number(count), ONE]])];
};
exports.diceToPMFs = diceToPMFs;
// console.log(diceToPMFs('2'));
const d20ToCritrate = (dice, critThreshold) => {
    // console.log({ dice });
    const [countS, fullFace] = dice.split("d");
    const count = Number(countS);
    if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
        switch (fullFace.slice(-2)) {
            case "kh":
                return ONE.sub(new fraction_js_1.default(critThreshold - 1, 20).pow(count));
            case "kl":
                return new fraction_js_1.default(new fraction_js_1.default(21).sub(new fraction_js_1.default(critThreshold)), 20).pow(count);
            default:
                break;
        }
    }
    return new fraction_js_1.default(1, 20);
};
exports.d20ToCritrate = d20ToCritrate;
const d20ToFailRate = (dice) => {
    // console.log({ dice });
    const [countS, fullFace] = dice.split("d");
    const count = Number(countS);
    if (fullFace.endsWith("kh") || fullFace.endsWith("kl")) {
        switch (fullFace.slice(-2)) {
            case "kl":
                return (0, exports.d20ToCritrate)(`${dice.slice(0, -2)}kh`, 20);
            case "kh":
                return (0, exports.d20ToCritrate)(`${dice.slice(0, -2)}kl`, 20);
            default:
                break;
        }
    }
    return new fraction_js_1.default(1 / 20);
};
exports.d20ToFailRate = d20ToFailRate;
//
// console.log('fail');
// console.log(d20ToCritrate('2d20kh', 20));
const isSimpleProcessable = (damage) => Boolean(/^([\dd+\-khl]|(mod))+$/.test(damage.replaceAll(/\s/g, "")));
exports.isSimpleProcessable = isSimpleProcessable;
exports.simpleProcess = (0, lodash_memoize_1.default)((damage, crit = "none") => {
    let state = "pos";
    const clean = damage.replaceAll(/\s/g, "");
    let dice = {
        pos: [],
        neg: [],
    };
    let dice_acc = "";
    [...clean].forEach((c) => {
        if (c === "-" || c === "+") {
            // if (dice_acc) {
            dice[state].push(dice_acc);
            dice_acc = "";
            // }
            state = c === "-" ? "neg" : "pos";
        }
        else {
            dice_acc += c;
        }
    });
    dice[state].push(dice_acc);
    if (crit === "normal") {
        dice = Object.fromEntries([Object.entries(dice)].map(([[posneg, d]]) => [
            posneg,
            d
                .map((x) => {
                if (x.includes("d")) {
                    const [count, face] = x.split("d");
                    return `${Number(count)}d${face}`;
                }
                return undefined;
                // return x;
            })
                .filter((v) => v),
        ]) || []);
    }
    if (crit === "raw") {
        dice = Object.fromEntries([Object.entries(dice)].map(([[posneg, d]]) => [
            posneg,
            d
                .map((x) => {
                if (x.includes("d")) {
                    const [count, face] = x.split("d");
                    return `${Number(count) * 2}d${face}`;
                }
                return x;
            })
                .filter((v) => v),
        ]) || []);
    }
    // console.log(dice);
    let pmf = (dice.pos || [])
        .filter((x) => x)
        .map(exports.diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => (0, exports.convolve_pmfs_sum_2)(acc, c, true), new Map([[0, ONE]]));
    pmf = (dice.neg || [])
        .filter((x) => x)
        .map(exports.diceToPMFs)
        .flat()
        .map((x) => x)
        .reduce((acc, c) => (0, exports.convolve_pmfs_sum_2)(acc, c, false), pmf);
    // printPMF(pmf);
    return pmf;
}, (damage, crit) => `${damage}|${crit || ""}`);
const weighted_mean_pmf = (pmf) => [...pmf.entries()].reduce((acc, [d, p]) => acc.add(new fraction_js_1.default(d).mul(p)), ZERO);
exports.weighted_mean_pmf = weighted_mean_pmf;


/***/ }),

/***/ 340:
/***/ (function(module) {

var __dirname = "/";
/**
 * workerpool.js
 * https://github.com/josdejong/workerpool
 *
 * Offload tasks to a pool of workers on node.js and in the browser.
 *
 * @version 6.2.1
 * @date    2022-04-11
 *
 * @license
 * Copyright (C) 2014-2022 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})((typeof self !== 'undefined' ? self : this), function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 345:
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_1386__) {

var Promise = __nested_webpack_require_1386__(219);

var WorkerHandler = __nested_webpack_require_1386__(751);

var environment = __nested_webpack_require_1386__(828);

var DebugPortAllocator = __nested_webpack_require_1386__(833);

var DEBUG_PORT_ALLOCATOR = new DebugPortAllocator();
/**
 * A pool to manage workers
 * @param {String} [script]   Optional worker script
 * @param {WorkerPoolOptions} [options]  See docs
 * @constructor
 */

function Pool(script, options) {
  if (typeof script === 'string') {
    this.script = script || null;
  } else {
    this.script = null;
    options = script;
  }

  this.workers = []; // queue with all workers

  this.tasks = []; // queue with tasks awaiting execution

  options = options || {};
  this.forkArgs = Object.freeze(options.forkArgs || []);
  this.forkOpts = Object.freeze(options.forkOpts || {});
  this.debugPortStart = options.debugPortStart || 43210;
  this.nodeWorker = options.nodeWorker;
  this.workerType = options.workerType || options.nodeWorker || 'auto';
  this.maxQueueSize = options.maxQueueSize || Infinity;

  this.onCreateWorker = options.onCreateWorker || function () {
    return null;
  };

  this.onTerminateWorker = options.onTerminateWorker || function () {
    return null;
  }; // configuration


  if (options && 'maxWorkers' in options) {
    validateMaxWorkers(options.maxWorkers);
    this.maxWorkers = options.maxWorkers;
  } else {
    this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
  }

  if (options && 'minWorkers' in options) {
    if (options.minWorkers === 'max') {
      this.minWorkers = this.maxWorkers;
    } else {
      validateMinWorkers(options.minWorkers);
      this.minWorkers = options.minWorkers;
      this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers); // in case minWorkers is higher than maxWorkers
    }

    this._ensureMinWorkers();
  }

  this._boundNext = this._next.bind(this);

  if (this.workerType === 'thread') {
    WorkerHandler.ensureWorkerThreads();
  }
}
/**
 * Execute a function on a worker.
 *
 * Example usage:
 *
 *   var pool = new Pool()
 *
 *   // call a function available on the worker
 *   pool.exec('fibonacci', [6])
 *
 *   // offload a function
 *   function add(a, b) {
 *     return a + b
 *   };
 *   pool.exec(add, [2, 4])
 *       .then(function (result) {
 *         console.log(result); // outputs 6
 *       })
 *       .catch(function(error) {
 *         console.log(error);
 *       });
 *
 * @param {String | Function} method  Function name or function.
 *                                    If `method` is a string, the corresponding
 *                                    method on the worker will be executed
 *                                    If `method` is a Function, the function
 *                                    will be stringified and executed via the
 *                                    workers built-in function `run(fn, args)`.
 * @param {Array} [params]  Function arguments applied when calling the function
 * @param {ExecOptions} [options]  Options object
 * @return {Promise.<*, Error>} result
 */


Pool.prototype.exec = function (method, params, options) {
  // validate type of arguments
  if (params && !Array.isArray(params)) {
    throw new TypeError('Array expected as argument "params"');
  }

  if (typeof method === 'string') {
    var resolver = Promise.defer();

    if (this.tasks.length >= this.maxQueueSize) {
      throw new Error('Max queue size of ' + this.maxQueueSize + ' reached');
    } // add a new task to the queue


    var tasks = this.tasks;
    var task = {
      method: method,
      params: params,
      resolver: resolver,
      timeout: null,
      options: options
    };
    tasks.push(task); // replace the timeout method of the Promise with our own,
    // which starts the timer as soon as the task is actually started

    var originalTimeout = resolver.promise.timeout;

    resolver.promise.timeout = function timeout(delay) {
      if (tasks.indexOf(task) !== -1) {
        // task is still queued -> start the timer later on
        task.timeout = delay;
        return resolver.promise;
      } else {
        // task is already being executed -> start timer immediately
        return originalTimeout.call(resolver.promise, delay);
      }
    }; // trigger task execution


    this._next();

    return resolver.promise;
  } else if (typeof method === 'function') {
    // send stringified function and function arguments to worker
    return this.exec('run', [String(method), params]);
  } else {
    throw new TypeError('Function or string expected as argument "method"');
  }
};
/**
 * Create a proxy for current worker. Returns an object containing all
 * methods available on the worker. The methods always return a promise.
 *
 * @return {Promise.<Object, Error>} proxy
 */


Pool.prototype.proxy = function () {
  if (arguments.length > 0) {
    throw new Error('No arguments expected');
  }

  var pool = this;
  return this.exec('methods').then(function (methods) {
    var proxy = {};
    methods.forEach(function (method) {
      proxy[method] = function () {
        return pool.exec(method, Array.prototype.slice.call(arguments));
      };
    });
    return proxy;
  });
};
/**
 * Creates new array with the results of calling a provided callback function
 * on every element in this array.
 * @param {Array} array
 * @param {function} callback  Function taking two arguments:
 *                             `callback(currentValue, index)`
 * @return {Promise.<Array>} Returns a promise which resolves  with an Array
 *                           containing the results of the callback function
 *                           executed for each of the array elements.
 */

/* TODO: implement map
Pool.prototype.map = function (array, callback) {
};
*/

/**
 * Grab the first task from the queue, find a free worker, and assign the
 * worker to the task.
 * @protected
 */


Pool.prototype._next = function () {
  if (this.tasks.length > 0) {
    // there are tasks in the queue
    // find an available worker
    var worker = this._getWorker();

    if (worker) {
      // get the first task from the queue
      var me = this;
      var task = this.tasks.shift(); // check if the task is still pending (and not cancelled -> promise rejected)

      if (task.resolver.promise.pending) {
        // send the request to the worker
        var promise = worker.exec(task.method, task.params, task.resolver, task.options).then(me._boundNext)["catch"](function () {
          // if the worker crashed and terminated, remove it from the pool
          if (worker.terminated) {
            return me._removeWorker(worker);
          }
        }).then(function () {
          me._next(); // trigger next task in the queue

        }); // start queued timer now

        if (typeof task.timeout === 'number') {
          promise.timeout(task.timeout);
        }
      } else {
        // The task taken was already complete (either rejected or resolved), so just trigger next task in the queue
        me._next();
      }
    }
  }
};
/**
 * Get an available worker. If no worker is available and the maximum number
 * of workers isn't yet reached, a new worker will be created and returned.
 * If no worker is available and the maximum number of workers is reached,
 * null will be returned.
 *
 * @return {WorkerHandler | null} worker
 * @private
 */


Pool.prototype._getWorker = function () {
  // find a non-busy worker
  var workers = this.workers;

  for (var i = 0; i < workers.length; i++) {
    var worker = workers[i];

    if (worker.busy() === false) {
      return worker;
    }
  }

  if (workers.length < this.maxWorkers) {
    // create a new worker
    worker = this._createWorkerHandler();
    workers.push(worker);
    return worker;
  }

  return null;
};
/**
 * Remove a worker from the pool.
 * Attempts to terminate worker if not already terminated, and ensures the minimum
 * pool size is met.
 * @param {WorkerHandler} worker
 * @return {Promise<WorkerHandler>}
 * @protected
 */


Pool.prototype._removeWorker = function (worker) {
  var me = this;
  DEBUG_PORT_ALLOCATOR.releasePort(worker.debugPort); // _removeWorker will call this, but we need it to be removed synchronously

  this._removeWorkerFromList(worker); // If minWorkers set, spin up new workers to replace the crashed ones


  this._ensureMinWorkers(); // terminate the worker (if not already terminated)


  return new Promise(function (resolve, reject) {
    worker.terminate(false, function (err) {
      me.onTerminateWorker({
        forkArgs: worker.forkArgs,
        forkOpts: worker.forkOpts,
        script: worker.script
      });

      if (err) {
        reject(err);
      } else {
        resolve(worker);
      }
    });
  });
};
/**
 * Remove a worker from the pool list.
 * @param {WorkerHandler} worker
 * @protected
 */


Pool.prototype._removeWorkerFromList = function (worker) {
  // remove from the list with workers
  var index = this.workers.indexOf(worker);

  if (index !== -1) {
    this.workers.splice(index, 1);
  }
};
/**
 * Close all active workers. Tasks currently being executed will be finished first.
 * @param {boolean} [force=false]   If false (default), the workers are terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the workers will be
 *                                  terminated immediately.
 * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
 *                                  after timeout if worker process has not been terminated.
 * @return {Promise.<void, Error>}
 */


Pool.prototype.terminate = function (force, timeout) {
  var me = this; // cancel any pending tasks

  this.tasks.forEach(function (task) {
    task.resolver.reject(new Error('Pool terminated'));
  });
  this.tasks.length = 0;

  var f = function f(worker) {
    this._removeWorkerFromList(worker);
  };

  var removeWorker = f.bind(this);
  var promises = [];
  var workers = this.workers.slice();
  workers.forEach(function (worker) {
    var termPromise = worker.terminateAndNotify(force, timeout).then(removeWorker).always(function () {
      me.onTerminateWorker({
        forkArgs: worker.forkArgs,
        forkOpts: worker.forkOpts,
        script: worker.script
      });
    });
    promises.push(termPromise);
  });
  return Promise.all(promises);
};
/**
 * Retrieve statistics on tasks and workers.
 * @return {{totalWorkers: number, busyWorkers: number, idleWorkers: number, pendingTasks: number, activeTasks: number}} Returns an object with statistics
 */


Pool.prototype.stats = function () {
  var totalWorkers = this.workers.length;
  var busyWorkers = this.workers.filter(function (worker) {
    return worker.busy();
  }).length;
  return {
    totalWorkers: totalWorkers,
    busyWorkers: busyWorkers,
    idleWorkers: totalWorkers - busyWorkers,
    pendingTasks: this.tasks.length,
    activeTasks: busyWorkers
  };
};
/**
 * Ensures that a minimum of minWorkers is up and running
 * @protected
 */


Pool.prototype._ensureMinWorkers = function () {
  if (this.minWorkers) {
    for (var i = this.workers.length; i < this.minWorkers; i++) {
      this.workers.push(this._createWorkerHandler());
    }
  }
};
/**
 * Helper function to create a new WorkerHandler and pass all options.
 * @return {WorkerHandler}
 * @private
 */


Pool.prototype._createWorkerHandler = function () {
  var overridenParams = this.onCreateWorker({
    forkArgs: this.forkArgs,
    forkOpts: this.forkOpts,
    script: this.script
  }) || {};
  return new WorkerHandler(overridenParams.script || this.script, {
    forkArgs: overridenParams.forkArgs || this.forkArgs,
    forkOpts: overridenParams.forkOpts || this.forkOpts,
    debugPort: DEBUG_PORT_ALLOCATOR.nextAvailableStartingAt(this.debugPortStart),
    workerType: this.workerType
  });
};
/**
 * Ensure that the maxWorkers option is an integer >= 1
 * @param {*} maxWorkers
 * @returns {boolean} returns true maxWorkers has a valid value
 */


function validateMaxWorkers(maxWorkers) {
  if (!isNumber(maxWorkers) || !isInteger(maxWorkers) || maxWorkers < 1) {
    throw new TypeError('Option maxWorkers must be an integer number >= 1');
  }
}
/**
 * Ensure that the minWorkers option is an integer >= 0
 * @param {*} minWorkers
 * @returns {boolean} returns true when minWorkers has a valid value
 */


function validateMinWorkers(minWorkers) {
  if (!isNumber(minWorkers) || !isInteger(minWorkers) || minWorkers < 0) {
    throw new TypeError('Option minWorkers must be an integer number >= 0');
  }
}
/**
 * Test whether a variable is a number
 * @param {*} value
 * @returns {boolean} returns true when value is a number
 */


function isNumber(value) {
  return typeof value === 'number';
}
/**
 * Test whether a number is an integer
 * @param {number} value
 * @returns {boolean} Returns true if value is an integer
 */


function isInteger(value) {
  return Math.round(value) == value;
}

module.exports = Pool;

/***/ }),

/***/ 219:
/***/ (function(module) {

"use strict";

/**
 * Promise
 *
 * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
 *
 * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
 * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
 */

function Promise(handler, parent) {
  var me = this;

  if (!(this instanceof Promise)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (typeof handler !== 'function') {
    throw new SyntaxError('Function parameter handler(resolve, reject) missing');
  }

  var _onSuccess = [];
  var _onFail = []; // status

  this.resolved = false;
  this.rejected = false;
  this.pending = true;
  /**
   * Process onSuccess and onFail callbacks: add them to the queue.
   * Once the promise is resolve, the function _promise is replace.
   * @param {Function} onSuccess
   * @param {Function} onFail
   * @private
   */

  var _process = function _process(onSuccess, onFail) {
    _onSuccess.push(onSuccess);

    _onFail.push(onFail);
  };
  /**
   * Add an onSuccess callback and optionally an onFail callback to the Promise
   * @param {Function} onSuccess
   * @param {Function} [onFail]
   * @returns {Promise} promise
   */


  this.then = function (onSuccess, onFail) {
    return new Promise(function (resolve, reject) {
      var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
      var f = onFail ? _then(onFail, resolve, reject) : reject;

      _process(s, f);
    }, me);
  };
  /**
   * Resolve the promise
   * @param {*} result
   * @type {Function}
   */


  var _resolve2 = function _resolve(result) {
    // update status
    me.resolved = true;
    me.rejected = false;
    me.pending = false;

    _onSuccess.forEach(function (fn) {
      fn(result);
    });

    _process = function _process(onSuccess, onFail) {
      onSuccess(result);
    };

    _resolve2 = _reject2 = function _reject() {};

    return me;
  };
  /**
   * Reject the promise
   * @param {Error} error
   * @type {Function}
   */


  var _reject2 = function _reject(error) {
    // update status
    me.resolved = false;
    me.rejected = true;
    me.pending = false;

    _onFail.forEach(function (fn) {
      fn(error);
    });

    _process = function _process(onSuccess, onFail) {
      onFail(error);
    };

    _resolve2 = _reject2 = function _reject() {};

    return me;
  };
  /**
   * Cancel te promise. This will reject the promise with a CancellationError
   * @returns {Promise} self
   */


  this.cancel = function () {
    if (parent) {
      parent.cancel();
    } else {
      _reject2(new CancellationError());
    }

    return me;
  };
  /**
   * Set a timeout for the promise. If the promise is not resolved within
   * the time, the promise will be cancelled and a TimeoutError is thrown.
   * If the promise is resolved in time, the timeout is removed.
   * @param {number} delay     Delay in milliseconds
   * @returns {Promise} self
   */


  this.timeout = function (delay) {
    if (parent) {
      parent.timeout(delay);
    } else {
      var timer = setTimeout(function () {
        _reject2(new TimeoutError('Promise timed out after ' + delay + ' ms'));
      }, delay);
      me.always(function () {
        clearTimeout(timer);
      });
    }

    return me;
  }; // attach handler passing the resolve and reject functions


  handler(function (result) {
    _resolve2(result);
  }, function (error) {
    _reject2(error);
  });
}
/**
 * Execute given callback, then call resolve/reject based on the returned result
 * @param {Function} callback
 * @param {Function} resolve
 * @param {Function} reject
 * @returns {Function}
 * @private
 */


function _then(callback, resolve, reject) {
  return function (result) {
    try {
      var res = callback(result);

      if (res && typeof res.then === 'function' && typeof res['catch'] === 'function') {
        // method returned a promise
        res.then(resolve, reject);
      } else {
        resolve(res);
      }
    } catch (error) {
      reject(error);
    }
  };
}
/**
 * Add an onFail callback to the Promise
 * @param {Function} onFail
 * @returns {Promise} promise
 */


Promise.prototype['catch'] = function (onFail) {
  return this.then(null, onFail);
}; // TODO: add support for Promise.catch(Error, callback)
// TODO: add support for Promise.catch(Error, Error, callback)

/**
 * Execute given callback when the promise either resolves or rejects.
 * @param {Function} fn
 * @returns {Promise} promise
 */


Promise.prototype.always = function (fn) {
  return this.then(fn, fn);
};
/**
 * Create a promise which resolves when all provided promises are resolved,
 * and fails when any of the promises resolves.
 * @param {Promise[]} promises
 * @returns {Promise} promise
 */


Promise.all = function (promises) {
  return new Promise(function (resolve, reject) {
    var remaining = promises.length,
        results = [];

    if (remaining) {
      promises.forEach(function (p, i) {
        p.then(function (result) {
          results[i] = result;
          remaining--;

          if (remaining == 0) {
            resolve(results);
          }
        }, function (error) {
          remaining = 0;
          reject(error);
        });
      });
    } else {
      resolve(results);
    }
  });
};
/**
 * Create a promise resolver
 * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
 */


Promise.defer = function () {
  var resolver = {};
  resolver.promise = new Promise(function (resolve, reject) {
    resolver.resolve = resolve;
    resolver.reject = reject;
  });
  return resolver;
};
/**
 * Create a cancellation error
 * @param {String} [message]
 * @extends Error
 */


function CancellationError(message) {
  this.message = message || 'promise cancelled';
  this.stack = new Error().stack;
}

CancellationError.prototype = new Error();
CancellationError.prototype.constructor = Error;
CancellationError.prototype.name = 'CancellationError';
Promise.CancellationError = CancellationError;
/**
 * Create a timeout error
 * @param {String} [message]
 * @extends Error
 */

function TimeoutError(message) {
  this.message = message || 'timeout exceeded';
  this.stack = new Error().stack;
}

TimeoutError.prototype = new Error();
TimeoutError.prototype.constructor = Error;
TimeoutError.prototype.name = 'TimeoutError';
Promise.TimeoutError = TimeoutError;
module.exports = Promise;

/***/ }),

/***/ 751:
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_21033__) {

"use strict";


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var Promise = __nested_webpack_require_21033__(219);

var environment = __nested_webpack_require_21033__(828);

var requireFoolWebpack = __nested_webpack_require_21033__(397);
/**
 * Special message sent by parent which causes a child process worker to terminate itself.
 * Not a "message object"; this string is the entire message.
 */


var TERMINATE_METHOD_ID = '__workerpool-terminate__';
/**
 * If sending `TERMINATE_METHOD_ID` does not cause the child process to exit in this many milliseconds,
 * force-kill the child process.
 */

var CHILD_PROCESS_EXIT_TIMEOUT = 1000;

function ensureWorkerThreads() {
  var WorkerThreads = tryRequireWorkerThreads();

  if (!WorkerThreads) {
    throw new Error('WorkerPool: workerType = \'thread\' is not supported, Node >= 11.7.0 required');
  }

  return WorkerThreads;
} // check whether Worker is supported by the browser


function ensureWebWorker() {
  // Workaround for a bug in PhantomJS (Or QtWebkit): https://github.com/ariya/phantomjs/issues/14534
  if (typeof Worker !== 'function' && ((typeof Worker === "undefined" ? "undefined" : _typeof(Worker)) !== 'object' || typeof Worker.prototype.constructor !== 'function')) {
    throw new Error('WorkerPool: Web Workers not supported');
  }
}

function tryRequireWorkerThreads() {
  try {
    return requireFoolWebpack('worker_threads');
  } catch (error) {
    if (_typeof(error) === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND') {
      // no worker_threads available (old version of node.js)
      return null;
    } else {
      throw error;
    }
  }
} // get the default worker script


function getDefaultWorker() {
  if (environment.platform === 'browser') {
    // test whether the browser supports all features that we need
    if (typeof Blob === 'undefined') {
      throw new Error('Blob not supported by the browser');
    }

    if (!window.URL || typeof window.URL.createObjectURL !== 'function') {
      throw new Error('URL.createObjectURL not supported by the browser');
    } // use embedded worker.js


    var blob = new Blob([__nested_webpack_require_21033__(670)], {
      type: 'text/javascript'
    });
    return window.URL.createObjectURL(blob);
  } else {
    // use external worker.js in current directory
    return __dirname + '/worker.js';
  }
}

function setupWorker(script, options) {
  if (options.workerType === 'web') {
    // browser only
    ensureWebWorker();
    return setupBrowserWorker(script, Worker);
  } else if (options.workerType === 'thread') {
    // node.js only
    WorkerThreads = ensureWorkerThreads();
    return setupWorkerThreadWorker(script, WorkerThreads);
  } else if (options.workerType === 'process' || !options.workerType) {
    // node.js only
    return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack('child_process'));
  } else {
    // options.workerType === 'auto' or undefined
    if (environment.platform === 'browser') {
      ensureWebWorker();
      return setupBrowserWorker(script, Worker);
    } else {
      // environment.platform === 'node'
      var WorkerThreads = tryRequireWorkerThreads();

      if (WorkerThreads) {
        return setupWorkerThreadWorker(script, WorkerThreads);
      } else {
        return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack('child_process'));
      }
    }
  }
}

function setupBrowserWorker(script, Worker) {
  // create the web worker
  var worker = new Worker(script);
  worker.isBrowserWorker = true; // add node.js API to the web worker

  worker.on = function (event, callback) {
    this.addEventListener(event, function (message) {
      callback(message.data);
    });
  };

  worker.send = function (message) {
    this.postMessage(message);
  };

  return worker;
}

function setupWorkerThreadWorker(script, WorkerThreads) {
  var worker = new WorkerThreads.Worker(script, {
    stdout: false,
    // automatically pipe worker.STDOUT to process.STDOUT
    stderr: false // automatically pipe worker.STDERR to process.STDERR

  });
  worker.isWorkerThread = true; // make the worker mimic a child_process

  worker.send = function (message) {
    this.postMessage(message);
  };

  worker.kill = function () {
    this.terminate();
    return true;
  };

  worker.disconnect = function () {
    this.terminate();
  };

  return worker;
}

function setupProcessWorker(script, options, child_process) {
  // no WorkerThreads, fallback to sub-process based workers
  var worker = child_process.fork(script, options.forkArgs, options.forkOpts);
  worker.isChildProcess = true;
  return worker;
} // add debug flags to child processes if the node inspector is active


function resolveForkOptions(opts) {
  opts = opts || {};
  var processExecArgv = process.execArgv.join(' ');
  var inspectorActive = processExecArgv.indexOf('--inspect') !== -1;
  var debugBrk = processExecArgv.indexOf('--debug-brk') !== -1;
  var execArgv = [];

  if (inspectorActive) {
    execArgv.push('--inspect=' + opts.debugPort);

    if (debugBrk) {
      execArgv.push('--debug-brk');
    }
  }

  process.execArgv.forEach(function (arg) {
    if (arg.indexOf('--max-old-space-size') > -1) {
      execArgv.push(arg);
    }
  });
  return Object.assign({}, opts, {
    forkArgs: opts.forkArgs,
    forkOpts: Object.assign({}, opts.forkOpts, {
      execArgv: (opts.forkOpts && opts.forkOpts.execArgv || []).concat(execArgv)
    })
  });
}
/**
 * Converts a serialized error to Error
 * @param {Object} obj Error that has been serialized and parsed to object
 * @return {Error} The equivalent Error.
 */


function objectToError(obj) {
  var temp = new Error('');
  var props = Object.keys(obj);

  for (var i = 0; i < props.length; i++) {
    temp[props[i]] = obj[props[i]];
  }

  return temp;
}
/**
 * A WorkerHandler controls a single worker. This worker can be a child process
 * on node.js or a WebWorker in a browser environment.
 * @param {String} [script] If no script is provided, a default worker with a
 *                          function run will be created.
 * @param {WorkerPoolOptions} _options See docs
 * @constructor
 */


function WorkerHandler(script, _options) {
  var me = this;
  var options = _options || {};
  this.script = script || getDefaultWorker();
  this.worker = setupWorker(this.script, options);
  this.debugPort = options.debugPort;
  this.forkOpts = options.forkOpts;
  this.forkArgs = options.forkArgs; // The ready message is only sent if the worker.add method is called (And the default script is not used)

  if (!script) {
    this.worker.ready = true;
  } // queue for requests that are received before the worker is ready


  this.requestQueue = [];
  this.worker.on('message', function (response) {
    if (me.terminated) {
      return;
    }

    if (typeof response === 'string' && response === 'ready') {
      me.worker.ready = true;
      dispatchQueuedRequests();
    } else {
      // find the task from the processing queue, and run the tasks callback
      var id = response.id;
      var task = me.processing[id];

      if (task !== undefined) {
        if (response.isEvent) {
          if (task.options && typeof task.options.on === 'function') {
            task.options.on(response.payload);
          }
        } else {
          // remove the task from the queue
          delete me.processing[id]; // test if we need to terminate

          if (me.terminating === true) {
            // complete worker termination if all tasks are finished
            me.terminate();
          } // resolve the task's promise


          if (response.error) {
            task.resolver.reject(objectToError(response.error));
          } else {
            task.resolver.resolve(response.result);
          }
        }
      }
    }
  }); // reject all running tasks on worker error

  function onError(error) {
    me.terminated = true;

    for (var id in me.processing) {
      if (me.processing[id] !== undefined) {
        me.processing[id].resolver.reject(error);
      }
    }

    me.processing = Object.create(null);
  } // send all queued requests to worker


  function dispatchQueuedRequests() {
    var _iterator = _createForOfIteratorHelper(me.requestQueue.splice(0)),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var request = _step.value;
        me.worker.send(request);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  var worker = this.worker; // listen for worker messages error and exit

  this.worker.on('error', onError);
  this.worker.on('exit', function (exitCode, signalCode) {
    var message = 'Workerpool Worker terminated Unexpectedly\n';
    message += '    exitCode: `' + exitCode + '`\n';
    message += '    signalCode: `' + signalCode + '`\n';
    message += '    workerpool.script: `' + me.script + '`\n';
    message += '    spawnArgs: `' + worker.spawnargs + '`\n';
    message += '    spawnfile: `' + worker.spawnfile + '`\n';
    message += '    stdout: `' + worker.stdout + '`\n';
    message += '    stderr: `' + worker.stderr + '`\n';
    onError(new Error(message));
  });
  this.processing = Object.create(null); // queue with tasks currently in progress

  this.terminating = false;
  this.terminated = false;
  this.terminationHandler = null;
  this.lastId = 0;
}
/**
 * Get a list with methods available on the worker.
 * @return {Promise.<String[], Error>} methods
 */


WorkerHandler.prototype.methods = function () {
  return this.exec('methods');
};
/**
 * Execute a method with given parameters on the worker
 * @param {String} method
 * @param {Array} [params]
 * @param {{resolve: Function, reject: Function}} [resolver]
 * @param {ExecOptions}  [options]
 * @return {Promise.<*, Error>} result
 */


WorkerHandler.prototype.exec = function (method, params, resolver, options) {
  if (!resolver) {
    resolver = Promise.defer();
  } // generate a unique id for the task


  var id = ++this.lastId; // register a new task as being in progress

  this.processing[id] = {
    id: id,
    resolver: resolver,
    options: options
  }; // build a JSON-RPC request

  var request = {
    id: id,
    method: method,
    params: params
  };

  if (this.terminated) {
    resolver.reject(new Error('Worker is terminated'));
  } else if (this.worker.ready) {
    // send the request to the worker
    this.worker.send(request);
  } else {
    this.requestQueue.push(request);
  } // on cancellation, force the worker to terminate


  var me = this;
  return resolver.promise["catch"](function (error) {
    if (error instanceof Promise.CancellationError || error instanceof Promise.TimeoutError) {
      // remove this task from the queue. It is already rejected (hence this
      // catch event), and else it will be rejected again when terminating
      delete me.processing[id]; // terminate worker

      return me.terminateAndNotify(true).then(function () {
        throw error;
      }, function (err) {
        throw err;
      });
    } else {
      throw error;
    }
  });
};
/**
 * Test whether the worker is working or not
 * @return {boolean} Returns true if the worker is busy
 */


WorkerHandler.prototype.busy = function () {
  return Object.keys(this.processing).length > 0;
};
/**
 * Terminate the worker.
 * @param {boolean} [force=false]   If false (default), the worker is terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the worker will be
 *                                  terminated immediately.
 * @param {function} [callback=null] If provided, will be called when process terminates.
 */


WorkerHandler.prototype.terminate = function (force, callback) {
  var me = this;

  if (force) {
    // cancel all tasks in progress
    for (var id in this.processing) {
      if (this.processing[id] !== undefined) {
        this.processing[id].resolver.reject(new Error('Worker terminated'));
      }
    }

    this.processing = Object.create(null);
  }

  if (typeof callback === 'function') {
    this.terminationHandler = callback;
  }

  if (!this.busy()) {
    // all tasks are finished. kill the worker
    var cleanup = function cleanup(err) {
      me.terminated = true;

      if (me.worker != null && me.worker.removeAllListeners) {
        // removeAllListeners is only available for child_process
        me.worker.removeAllListeners('message');
      }

      me.worker = null;
      me.terminating = false;

      if (me.terminationHandler) {
        me.terminationHandler(err, me);
      } else if (err) {
        throw err;
      }
    };

    if (this.worker) {
      if (typeof this.worker.kill === 'function') {
        if (this.worker.killed) {
          cleanup(new Error('worker already killed!'));
          return;
        }

        if (this.worker.isChildProcess) {
          var cleanExitTimeout = setTimeout(function () {
            if (me.worker) {
              me.worker.kill();
            }
          }, CHILD_PROCESS_EXIT_TIMEOUT);
          this.worker.once('exit', function () {
            clearTimeout(cleanExitTimeout);

            if (me.worker) {
              me.worker.killed = true;
            }

            cleanup();
          });

          if (this.worker.ready) {
            this.worker.send(TERMINATE_METHOD_ID);
          } else {
            this.requestQueue.push(TERMINATE_METHOD_ID);
          }
        } else {
          // worker_thread
          this.worker.kill();
          this.worker.killed = true;
          cleanup();
        }

        return;
      } else if (typeof this.worker.terminate === 'function') {
        this.worker.terminate(); // web worker

        this.worker.killed = true;
      } else {
        throw new Error('Failed to terminate worker');
      }
    }

    cleanup();
  } else {
    // we can't terminate immediately, there are still tasks being executed
    this.terminating = true;
  }
};
/**
 * Terminate the worker, returning a Promise that resolves when the termination has been done.
 * @param {boolean} [force=false]   If false (default), the worker is terminated
 *                                  after finishing all tasks currently in
 *                                  progress. If true, the worker will be
 *                                  terminated immediately.
 * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
 *                                  after timeout if worker process has not been terminated.
 * @return {Promise.<WorkerHandler, Error>}
 */


WorkerHandler.prototype.terminateAndNotify = function (force, timeout) {
  var resolver = Promise.defer();

  if (timeout) {
    resolver.promise.timeout = timeout;
  }

  this.terminate(force, function (err, worker) {
    if (err) {
      resolver.reject(err);
    } else {
      resolver.resolve(worker);
    }
  });
  return resolver.promise;
};

module.exports = WorkerHandler;
module.exports._tryRequireWorkerThreads = tryRequireWorkerThreads;
module.exports._setupProcessWorker = setupProcessWorker;
module.exports._setupBrowserWorker = setupBrowserWorker;
module.exports._setupWorkerThreadWorker = setupWorkerThreadWorker;
module.exports.ensureWorkerThreads = ensureWorkerThreads;

/***/ }),

/***/ 833:
/***/ (function(module) {

"use strict";


var MAX_PORTS = 65535;
module.exports = DebugPortAllocator;

function DebugPortAllocator() {
  this.ports = Object.create(null);
  this.length = 0;
}

DebugPortAllocator.prototype.nextAvailableStartingAt = function (starting) {
  while (this.ports[starting] === true) {
    starting++;
  }

  if (starting >= MAX_PORTS) {
    throw new Error('WorkerPool debug port limit reached: ' + starting + '>= ' + MAX_PORTS);
  }

  this.ports[starting] = true;
  this.length++;
  return starting;
};

DebugPortAllocator.prototype.releasePort = function (port) {
  delete this.ports[port];
  this.length--;
};

/***/ }),

/***/ 828:
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_39010__) {

var requireFoolWebpack = __nested_webpack_require_39010__(397); // source: https://github.com/flexdinesh/browser-or-node


var isNode = function isNode(nodeProcess) {
  return typeof nodeProcess !== 'undefined' && nodeProcess.versions != null && nodeProcess.versions.node != null;
};

module.exports.isNode = isNode; // determines the JavaScript platform: browser or node

module.exports.platform = typeof process !== 'undefined' && isNode(process) ? 'node' : 'browser'; // determines whether the code is running in main thread or not
// note that in node.js we have to check both worker_thread and child_process

var worker_threads = tryRequireFoolWebpack('worker_threads');
module.exports.isMainThread = module.exports.platform === 'node' ? (!worker_threads || worker_threads.isMainThread) && !process.connected : typeof Window !== 'undefined'; // determines the number of cpus available

module.exports.cpus = module.exports.platform === 'browser' ? self.navigator.hardwareConcurrency : requireFoolWebpack('os').cpus().length;

function tryRequireFoolWebpack(module) {
  try {
    return requireFoolWebpack(module);
  } catch (err) {
    return null;
  }
}

/***/ }),

/***/ 670:
/***/ (function(module) {

/**
 * embeddedWorker.js contains an embedded version of worker.js.
 * This file is automatically generated,
 * changes made in this file will be overwritten.
 */
module.exports = "!function(){var __webpack_exports__={};!function(){var exports=__webpack_exports__,__webpack_unused_export__;function _typeof(r){return(_typeof=\"function\"==typeof Symbol&&\"symbol\"==typeof Symbol.iterator?function(r){return typeof r}:function(r){return r&&\"function\"==typeof Symbol&&r.constructor===Symbol&&r!==Symbol.prototype?\"symbol\":typeof r})(r)}var requireFoolWebpack=eval(\"typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \\\" + module + \\\" not found.') }\"),TERMINATE_METHOD_ID=\"__workerpool-terminate__\",worker={exit:function(){}},WorkerThreads,parentPort;if(\"undefined\"!=typeof self&&\"function\"==typeof postMessage&&\"function\"==typeof addEventListener)worker.on=function(r,e){addEventListener(r,function(r){e(r.data)})},worker.send=function(r){postMessage(r)};else{if(\"undefined\"==typeof process)throw new Error(\"Script must be executed as a worker\");try{WorkerThreads=requireFoolWebpack(\"worker_threads\")}catch(error){if(\"object\"!==_typeof(error)||null===error||\"MODULE_NOT_FOUND\"!==error.code)throw error}WorkerThreads&&null!==WorkerThreads.parentPort?(parentPort=WorkerThreads.parentPort,worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)):(worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on(\"disconnect\",function(){process.exit(1)}),worker.exit=process.exit.bind(process))}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(r,e){return Object.defineProperty(r,e,{value:o[e],enumerable:!0})},{})}function isPromise(r){return r&&\"function\"==typeof r.then&&\"function\"==typeof r.catch}worker.methods={},worker.methods.run=function(r,e){r=new Function(\"return (\"+r+\").apply(null, arguments);\");return r.apply(r,e)},worker.methods.methods=function(){return Object.keys(worker.methods)};var currentRequestId=null;worker.on(\"message\",function(e){if(e===TERMINATE_METHOD_ID)return worker.exit(0);try{var r=worker.methods[e.method];if(!r)throw new Error('Unknown method \"'+e.method+'\"');currentRequestId=e.id;var o=r.apply(r,e.params);isPromise(o)?o.then(function(r){worker.send({id:e.id,result:r,error:null}),currentRequestId=null}).catch(function(r){worker.send({id:e.id,result:null,error:convertError(r)}),currentRequestId=null}):(worker.send({id:e.id,result:o,error:null}),currentRequestId=null)}catch(r){worker.send({id:e.id,result:null,error:convertError(r)})}}),worker.register=function(r){if(r)for(var e in r)r.hasOwnProperty(e)&&(worker.methods[e]=r[e]);worker.send(\"ready\")},worker.emit=function(r){currentRequestId&&worker.send({id:currentRequestId,isEvent:!0,payload:r})},__webpack_unused_export__=worker.register,worker.emit}()}();";

/***/ }),

/***/ 397:
/***/ (function(module) {

// source of inspiration: https://github.com/sindresorhus/require-fool-webpack
var requireFoolWebpack = eval('typeof require !== \'undefined\' ' + '? require ' + ': function (module) { throw new Error(\'Module " + module + " not found.\') }');
module.exports = requireFoolWebpack;

/***/ }),

/***/ 744:
/***/ (function(__unused_webpack_module, exports) {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/**
 * worker must be started as a child process or a web worker.
 * It listens for RPC messages from the parent process.
 */
// source of inspiration: https://github.com/sindresorhus/require-fool-webpack
var requireFoolWebpack = eval('typeof require !== \'undefined\'' + ' ? require' + ' : function (module) { throw new Error(\'Module " + module + " not found.\') }');
/**
 * Special message sent by parent which causes the worker to terminate itself.
 * Not a "message object"; this string is the entire message.
 */

var TERMINATE_METHOD_ID = '__workerpool-terminate__'; // var nodeOSPlatform = require('./environment').nodeOSPlatform;
// create a worker API for sending and receiving messages which works both on
// node.js and in the browser

var worker = {
  exit: function exit() {}
};

if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof addEventListener === 'function') {
  // worker in the browser
  worker.on = function (event, callback) {
    addEventListener(event, function (message) {
      callback(message.data);
    });
  };

  worker.send = function (message) {
    postMessage(message);
  };
} else if (typeof process !== 'undefined') {
  // node.js
  var WorkerThreads;

  try {
    WorkerThreads = requireFoolWebpack('worker_threads');
  } catch (error) {
    if (_typeof(error) === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND') {// no worker_threads, fallback to sub-process based workers
    } else {
      throw error;
    }
  }

  if (WorkerThreads &&
  /* if there is a parentPort, we are in a WorkerThread */
  WorkerThreads.parentPort !== null) {
    var parentPort = WorkerThreads.parentPort;
    worker.send = parentPort.postMessage.bind(parentPort);
    worker.on = parentPort.on.bind(parentPort);
  } else {
    worker.on = process.on.bind(process);
    worker.send = process.send.bind(process); // register disconnect handler only for subprocess worker to exit when parent is killed unexpectedly

    worker.on('disconnect', function () {
      process.exit(1);
    });
    worker.exit = process.exit.bind(process);
  }
} else {
  throw new Error('Script must be executed as a worker');
}

function convertError(error) {
  return Object.getOwnPropertyNames(error).reduce(function (product, name) {
    return Object.defineProperty(product, name, {
      value: error[name],
      enumerable: true
    });
  }, {});
}
/**
 * Test whether a value is a Promise via duck typing.
 * @param {*} value
 * @returns {boolean} Returns true when given value is an object
 *                    having functions `then` and `catch`.
 */


function isPromise(value) {
  return value && typeof value.then === 'function' && typeof value["catch"] === 'function';
} // functions available externally


worker.methods = {};
/**
 * Execute a function with provided arguments
 * @param {String} fn     Stringified function
 * @param {Array} [args]  Function arguments
 * @returns {*}
 */

worker.methods.run = function run(fn, args) {
  var f = new Function('return (' + fn + ').apply(null, arguments);');
  return f.apply(f, args);
};
/**
 * Get a list with methods available on this worker
 * @return {String[]} methods
 */


worker.methods.methods = function methods() {
  return Object.keys(worker.methods);
};

var currentRequestId = null;
worker.on('message', function (request) {
  if (request === TERMINATE_METHOD_ID) {
    return worker.exit(0);
  }

  try {
    var method = worker.methods[request.method];

    if (method) {
      currentRequestId = request.id; // execute the function

      var result = method.apply(method, request.params);

      if (isPromise(result)) {
        // promise returned, resolve this and then return
        result.then(function (result) {
          worker.send({
            id: request.id,
            result: result,
            error: null
          });
          currentRequestId = null;
        })["catch"](function (err) {
          worker.send({
            id: request.id,
            result: null,
            error: convertError(err)
          });
          currentRequestId = null;
        });
      } else {
        // immediate result
        worker.send({
          id: request.id,
          result: result,
          error: null
        });
        currentRequestId = null;
      }
    } else {
      throw new Error('Unknown method "' + request.method + '"');
    }
  } catch (err) {
    worker.send({
      id: request.id,
      result: null,
      error: convertError(err)
    });
  }
});
/**
 * Register methods to the worker
 * @param {Object} methods
 */

worker.register = function (methods) {
  if (methods) {
    for (var name in methods) {
      if (methods.hasOwnProperty(name)) {
        worker.methods[name] = methods[name];
      }
    }
  }

  worker.send('ready');
};

worker.emit = function (payload) {
  if (currentRequestId) {
    worker.send({
      id: currentRequestId,
      isEvent: true,
      payload: payload
    });
  }
};

if (true) {
  exports.add = worker.register;
  exports.emit = worker.emit;
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_49170__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_49170__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;
var environment = __nested_webpack_require_49170__(828);
/**
 * Create a new worker pool
 * @param {string} [script]
 * @param {WorkerPoolOptions} [options]
 * @returns {Pool} pool
 */


exports.pool = function pool(script, options) {
  var Pool = __nested_webpack_require_49170__(345);

  return new Pool(script, options);
};
/**
 * Create a worker and optionally register a set of methods to the worker.
 * @param {Object} [methods]
 */


exports.worker = function worker(methods) {
  var worker = __nested_webpack_require_49170__(744);

  worker.add(methods);
};
/**
 * Sends an event to the parent worker pool.
 * @param {any} payload 
 */


exports.workerEmit = function workerEmit(payload) {
  var worker = __nested_webpack_require_49170__(744);

  worker.emit(payload);
};
/**
 * Create a promise.
 * @type {Promise} promise
 */


exports.Promise = __nested_webpack_require_49170__(219);
exports.platform = environment.platform;
exports.isMainThread = environment.isMainThread;
exports.cpus = environment.cpus;
}();
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=workerpool.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(185);
/******/ 	
/******/ })()
;