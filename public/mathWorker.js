"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/fraction.js/fraction.js
  var require_fraction = __commonJS({
    "node_modules/fraction.js/fraction.js"(exports2, module2) {
      (function(root) {
        "use strict";
        var MAX_CYCLE_LEN = 2e3;
        var P = {
          "s": 1,
          "n": 0,
          "d": 1
        };
        function assign(n, s) {
          if (isNaN(n = parseInt(n, 10))) {
            throw Fraction3["InvalidParameter"];
          }
          return n * s;
        }
        function newFraction(n, d) {
          if (d === 0) {
            throw Fraction3["DivisionByZero"];
          }
          var f = Object.create(Fraction3.prototype);
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
              n /= i;
              factors[i] = (factors[i] || 0) + 1;
            }
            s += 1 + 2 * i++;
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
          var N = 1e7;
          var M;
          if (p1 === void 0 || p1 === null) {
          } else if (p2 !== void 0) {
            n = p1;
            d = p2;
            s = n * d;
            if (n % 1 !== 0 || d % 1 !== 0) {
              throw Fraction3["NonIntegerParameter"];
            }
          } else
            switch (typeof p1) {
              case "object": {
                if ("d" in p1 && "n" in p1) {
                  n = p1["n"];
                  d = p1["d"];
                  if ("s" in p1)
                    n *= p1["s"];
                } else if (0 in p1) {
                  n = p1[0];
                  if (1 in p1)
                    d = p1[1];
                } else {
                  throw Fraction3["InvalidParameter"];
                }
                s = n * d;
                break;
              }
              case "number": {
                if (p1 < 0) {
                  s = p1;
                  p1 = -p1;
                }
                if (p1 % 1 === 0) {
                  n = p1;
                } else if (p1 > 0) {
                  if (p1 >= 1) {
                    z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                    p1 /= z;
                  }
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
                        A += C;
                        B += D;
                      } else {
                        C += A;
                        D += B;
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
                  n *= z;
                } else if (isNaN(p1) || isNaN(p2)) {
                  d = n = NaN;
                }
                break;
              }
              case "string": {
                B = p1.match(/\d+|./g);
                if (B === null)
                  throw Fraction3["InvalidParameter"];
                if (B[A] === "-") {
                  s = -1;
                  A++;
                } else if (B[A] === "+") {
                  A++;
                }
                if (B.length === A + 1) {
                  w = assign(B[A++], s);
                } else if (B[A + 1] === "." || B[A] === ".") {
                  if (B[A] !== ".") {
                    v = assign(B[A++], s);
                  }
                  A++;
                  if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                    w = assign(B[A], s);
                    y = Math.pow(10, B[A].length);
                    A++;
                  }
                  if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                    x = assign(B[A + 1], s);
                    z = Math.pow(10, B[A + 1].length) - 1;
                    A += 3;
                  }
                } else if (B[A + 1] === "/" || B[A + 1] === ":") {
                  w = assign(B[A], s);
                  y = assign(B[A + 2], 1);
                  A += 3;
                } else if (B[A + 3] === "/" && B[A + 1] === " ") {
                  v = assign(B[A], s);
                  w = assign(B[A + 2], s);
                  y = assign(B[A + 4], 1);
                  A += 5;
                }
                if (B.length <= A) {
                  d = y * z;
                  s = /* void */
                  n = x + d * v + z * w;
                  break;
                }
              }
              default:
                throw Fraction3["InvalidParameter"];
            }
          if (d === 0) {
            throw Fraction3["DivisionByZero"];
          }
          P["s"] = s < 0 ? -1 : 1;
          P["n"] = Math.abs(n);
          P["d"] = Math.abs(d);
        };
        function modpow(b, e, m) {
          var r = 1;
          for (; e > 0; b = b * b % m, e >>= 1) {
            if (e & 1) {
              r = r * b % m;
            }
          }
          return r;
        }
        function cycleLen(n, d) {
          for (; d % 2 === 0; d /= 2) {
          }
          for (; d % 5 === 0; d /= 5) {
          }
          if (d === 1)
            return 0;
          var rem = 10 % d;
          var t = 1;
          for (; rem !== 1; t++) {
            rem = rem * 10 % d;
            if (t > MAX_CYCLE_LEN)
              return 0;
          }
          return t;
        }
        function cycleStart(n, d, len) {
          var rem1 = 1;
          var rem2 = modpow(10, len, d);
          for (var t = 0; t < 300; t++) {
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
            a %= b;
            if (!a)
              return b;
            b %= a;
            if (!b)
              return a;
          }
        }
        ;
        function Fraction3(a, b) {
          parse(a, b);
          if (this instanceof Fraction3) {
            a = gcd(P["d"], P["n"]);
            this["s"] = P["s"];
            this["n"] = P["n"] / a;
            this["d"] = P["d"] / a;
          } else {
            return newFraction(P["s"] * P["n"], P["d"]);
          }
        }
        Fraction3["DivisionByZero"] = new Error("Division by Zero");
        Fraction3["InvalidParameter"] = new Error("Invalid argument");
        Fraction3["NonIntegerParameter"] = new Error("Parameters must be integer");
        Fraction3.prototype = {
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
            return newFraction(this["s"] * this["n"], this["d"]);
          },
          /**
           * Calculates the modulo of two rational numbers - a more precise fmod
           *
           * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
           **/
          "mod": function(a, b) {
            if (isNaN(this["n"]) || isNaN(this["d"])) {
              return new Fraction3(NaN);
            }
            if (a === void 0) {
              return newFraction(this["s"] * this["n"] % this["d"], 1);
            }
            parse(a, b);
            if (0 === P["n"] && 0 === this["d"]) {
              throw Fraction3["DivisionByZero"];
            }
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
            return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
          },
          /**
           * Calculates the fractional lcm of two rational numbers
           *
           * Ex: new Fraction(5,8).lcm(3,7) => 15
           */
          "lcm": function(a, b) {
            parse(a, b);
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
              return new Fraction3(NaN);
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
              return new Fraction3(NaN);
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
              return new Fraction3(NaN);
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
            if (P["d"] === 1) {
              if (P["s"] < 0) {
                return newFraction(Math.pow(this["s"] * this["d"], P["n"]), Math.pow(this["n"], P["n"]));
              } else {
                return newFraction(Math.pow(this["s"] * this["n"], P["n"]), Math.pow(this["d"], P["n"]));
              }
            }
            if (this["s"] < 0)
              return null;
            var N = factorize(this["n"]);
            var D = factorize(this["d"]);
            var n = 1;
            var d = 1;
            for (var k in N) {
              if (k === "1")
                continue;
              if (k === "0") {
                n = 0;
                break;
              }
              N[k] *= P["n"];
              if (N[k] % P["d"] === 0) {
                N[k] /= P["d"];
              } else
                return null;
              n *= Math.pow(k, N[k]);
            }
            for (var k in D) {
              if (k === "1")
                continue;
              D[k] *= P["n"];
              if (D[k] % P["d"] === 0) {
                D[k] /= P["d"];
              } else
                return null;
              d *= Math.pow(k, D[k]);
            }
            if (P["s"] < 0) {
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
            return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
          },
          /**
           * Check if two rational numbers are the same
           *
           * Ex: new Fraction(19.6).equals([98, 5]);
           **/
          "compare": function(a, b) {
            parse(a, b);
            var t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
            return (0 < t) - (t < 0);
          },
          "simplify": function(eps) {
            if (isNaN(this["n"]) || isNaN(this["d"])) {
              return this;
            }
            eps = eps || 1e-3;
            var thisABS = this["abs"]();
            var cont = thisABS["toContinued"]();
            for (var i = 1; i < cont.length; i++) {
              var s = newFraction(cont[i - 1], 1);
              for (var k = i - 2; k >= 0; k--) {
                s = s["inverse"]()["add"](cont[k]);
              }
              if (s["sub"](thisABS)["abs"]().valueOf() < eps) {
                return s["mul"](this["s"]);
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
            return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
          },
          /**
           * Returns a decimal representation of the fraction
           *
           * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
           **/
          "valueOf": function() {
            return this["s"] * this["n"] / this["d"];
          },
          /**
           * Returns a string-fraction representation of a Fraction object
           *
           * Ex: new Fraction("1.'3'").toFraction(true) => "4 1/3"
           **/
          "toFraction": function(excludeWhole) {
            var whole, str = "";
            var n = this["n"];
            var d = this["d"];
            if (this["s"] < 0) {
              str += "-";
            }
            if (d === 1) {
              str += n;
            } else {
              if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
                str += whole;
                str += " ";
                n %= d;
              }
              str += n;
              str += "/";
              str += d;
            }
            return str;
          },
          /**
           * Returns a latex representation of a Fraction object
           *
           * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
           **/
          "toLatex": function(excludeWhole) {
            var whole, str = "";
            var n = this["n"];
            var d = this["d"];
            if (this["s"] < 0) {
              str += "-";
            }
            if (d === 1) {
              str += n;
            } else {
              if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
                str += whole;
                n %= d;
              }
              str += "\\frac{";
              str += n;
              str += "}{";
              str += d;
              str += "}";
            }
            return str;
          },
          /**
           * Returns an array of continued fraction elements
           *
           * Ex: new Fraction("7/8").toContinued() => [0,1,7]
           */
          "toContinued": function() {
            var t;
            var a = this["n"];
            var b = this["d"];
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
          "toString": function(dec) {
            var N = this["n"];
            var D = this["d"];
            if (isNaN(N) || isNaN(D)) {
              return "NaN";
            }
            dec = dec || 15;
            var cycLen = cycleLen(N, D);
            var cycOff = cycleStart(N, D, cycLen);
            var str = this["s"] < 0 ? "-" : "";
            str += N / D | 0;
            N %= D;
            N *= 10;
            if (N)
              str += ".";
            if (cycLen) {
              for (var i = cycOff; i--; ) {
                str += N / D | 0;
                N %= D;
                N *= 10;
              }
              str += "(";
              for (var i = cycLen; i--; ) {
                str += N / D | 0;
                N %= D;
                N *= 10;
              }
              str += ")";
            } else {
              for (var i = dec; N && i--; ) {
                str += N / D | 0;
                N %= D;
                N *= 10;
              }
            }
            return str;
          }
        };
        if (typeof define === "function" && define["amd"]) {
          define([], function() {
            return Fraction3;
          });
        } else if (typeof exports2 === "object") {
          Object.defineProperty(Fraction3, "__esModule", { "value": true });
          Fraction3["default"] = Fraction3;
          Fraction3["Fraction"] = Fraction3;
          module2["exports"] = Fraction3;
        } else {
          root["Fraction"] = Fraction3;
        }
      })(exports2);
    }
  });

  // node_modules/ansi-regex/index.js
  var require_ansi_regex = __commonJS({
    "node_modules/ansi-regex/index.js"(exports2, module2) {
      "use strict";
      module2.exports = ({ onlyFirst = false } = {}) => {
        const pattern = [
          "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
          "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
        ].join("|");
        return new RegExp(pattern, onlyFirst ? void 0 : "g");
      };
    }
  });

  // node_modules/strip-ansi/index.js
  var require_strip_ansi = __commonJS({
    "node_modules/strip-ansi/index.js"(exports2, module2) {
      "use strict";
      var ansiRegex = require_ansi_regex();
      module2.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
    }
  });

  // node_modules/is-fullwidth-code-point/index.js
  var require_is_fullwidth_code_point = __commonJS({
    "node_modules/is-fullwidth-code-point/index.js"(exports2, module2) {
      "use strict";
      var isFullwidthCodePoint = (codePoint) => {
        if (Number.isNaN(codePoint)) {
          return false;
        }
        if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
        codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
        codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
        // CJK Radicals Supplement .. Enclosed CJK Letters and Months
        11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
        12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
        19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
        43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
        44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
        63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
        65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
        65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
        65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
        110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
        127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
        131072 <= codePoint && codePoint <= 262141)) {
          return true;
        }
        return false;
      };
      module2.exports = isFullwidthCodePoint;
      module2.exports.default = isFullwidthCodePoint;
    }
  });

  // node_modules/string-width/node_modules/emoji-regex/index.js
  var require_emoji_regex = __commonJS({
    "node_modules/string-width/node_modules/emoji-regex/index.js"(exports2, module2) {
      "use strict";
      module2.exports = function() {
        return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
      };
    }
  });

  // node_modules/string-width/index.js
  var require_string_width = __commonJS({
    "node_modules/string-width/index.js"(exports2, module2) {
      "use strict";
      var stripAnsi = require_strip_ansi();
      var isFullwidthCodePoint = require_is_fullwidth_code_point();
      var emojiRegex = require_emoji_regex();
      var stringWidth = (string) => {
        if (typeof string !== "string" || string.length === 0) {
          return 0;
        }
        string = stripAnsi(string);
        if (string.length === 0) {
          return 0;
        }
        string = string.replace(emojiRegex(), "  ");
        let width = 0;
        for (let i = 0; i < string.length; i++) {
          const code = string.codePointAt(i);
          if (code <= 31 || code >= 127 && code <= 159) {
            continue;
          }
          if (code >= 768 && code <= 879) {
            continue;
          }
          if (code > 65535) {
            i++;
          }
          width += isFullwidthCodePoint(code) ? 2 : 1;
        }
        return width;
      };
      module2.exports = stringWidth;
      module2.exports.default = stringWidth;
    }
  });

  // node_modules/astral-regex/index.js
  var require_astral_regex = __commonJS({
    "node_modules/astral-regex/index.js"(exports2, module2) {
      "use strict";
      var regex = "[\uD800-\uDBFF][\uDC00-\uDFFF]";
      var astralRegex = (options) => options && options.exact ? new RegExp(`^${regex}$`) : new RegExp(regex, "g");
      module2.exports = astralRegex;
    }
  });

  // node_modules/color-name/index.js
  var require_color_name = __commonJS({
    "node_modules/color-name/index.js"(exports2, module2) {
      "use strict";
      module2.exports = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
      };
    }
  });

  // node_modules/color-convert/conversions.js
  var require_conversions = __commonJS({
    "node_modules/color-convert/conversions.js"(exports2, module2) {
      var cssKeywords = require_color_name();
      var reverseKeywords = {};
      for (const key of Object.keys(cssKeywords)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
      var convert = {
        rgb: { channels: 3, labels: "rgb" },
        hsl: { channels: 3, labels: "hsl" },
        hsv: { channels: 3, labels: "hsv" },
        hwb: { channels: 3, labels: "hwb" },
        cmyk: { channels: 4, labels: "cmyk" },
        xyz: { channels: 3, labels: "xyz" },
        lab: { channels: 3, labels: "lab" },
        lch: { channels: 3, labels: "lch" },
        hex: { channels: 1, labels: ["hex"] },
        keyword: { channels: 1, labels: ["keyword"] },
        ansi16: { channels: 1, labels: ["ansi16"] },
        ansi256: { channels: 1, labels: ["ansi256"] },
        hcg: { channels: 3, labels: ["h", "c", "g"] },
        apple: { channels: 3, labels: ["r16", "g16", "b16"] },
        gray: { channels: 1, labels: ["gray"] }
      };
      module2.exports = convert;
      for (const model of Object.keys(convert)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        const { channels, labels } = convert[model];
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
      convert.rgb.hsl = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        let h;
        let s;
        if (max === min) {
          h = 0;
        } else if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else if (b === max) {
          h = 4 + (r - g) / delta;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) {
          h += 360;
        }
        const l = (min + max) / 2;
        if (max === min) {
          s = 0;
        } else if (l <= 0.5) {
          s = delta / (max + min);
        } else {
          s = delta / (2 - max - min);
        }
        return [h, s * 100, l * 100];
      };
      convert.rgb.hsv = function(rgb) {
        let rdif;
        let gdif;
        let bdif;
        let h;
        let s;
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);
        const diffc = function(c) {
          return (v - c) / 6 / diff + 1 / 2;
        };
        if (diff === 0) {
          h = 0;
          s = 0;
        } else {
          s = diff / v;
          rdif = diffc(r);
          gdif = diffc(g);
          bdif = diffc(b);
          if (r === v) {
            h = bdif - gdif;
          } else if (g === v) {
            h = 1 / 3 + rdif - bdif;
          } else if (b === v) {
            h = 2 / 3 + gdif - rdif;
          }
          if (h < 0) {
            h += 1;
          } else if (h > 1) {
            h -= 1;
          }
        }
        return [
          h * 360,
          s * 100,
          v * 100
        ];
      };
      convert.rgb.hwb = function(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        let b = rgb[2];
        const h = convert.rgb.hsl(rgb)[0];
        const w = 1 / 255 * Math.min(r, Math.min(g, b));
        b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
        return [h, w * 100, b * 100];
      };
      convert.rgb.cmyk = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const k = Math.min(1 - r, 1 - g, 1 - b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;
        return [c * 100, m * 100, y * 100, k * 100];
      };
      function comparativeDistance(x, y) {
        return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
      }
      convert.rgb.keyword = function(rgb) {
        const reversed = reverseKeywords[rgb];
        if (reversed) {
          return reversed;
        }
        let currentClosestDistance = Infinity;
        let currentClosestKeyword;
        for (const keyword of Object.keys(cssKeywords)) {
          const value = cssKeywords[keyword];
          const distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
        return currentClosestKeyword;
      };
      convert.keyword.rgb = function(keyword) {
        return cssKeywords[keyword];
      };
      convert.rgb.xyz = function(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
        g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
        b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
        const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
        return [x * 100, y * 100, z * 100];
      };
      convert.rgb.lab = function(rgb) {
        const xyz = convert.rgb.xyz(rgb);
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.hsl.rgb = function(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        let t2;
        let t3;
        let val;
        if (s === 0) {
          val = l * 255;
          return [val, val, val];
        }
        if (l < 0.5) {
          t2 = l * (1 + s);
        } else {
          t2 = l + s - l * s;
        }
        const t1 = 2 * l - t2;
        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          t3 = h + 1 / 3 * -(i - 1);
          if (t3 < 0) {
            t3++;
          }
          if (t3 > 1) {
            t3--;
          }
          if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
          } else if (2 * t3 < 1) {
            val = t2;
          } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
          } else {
            val = t1;
          }
          rgb[i] = val * 255;
        }
        return rgb;
      };
      convert.hsl.hsv = function(hsl) {
        const h = hsl[0];
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;
        let smin = s;
        const lmin = Math.max(l, 0.01);
        l *= 2;
        s *= l <= 1 ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        const v = (l + s) / 2;
        const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
        return [h, sv * 100, v * 100];
      };
      convert.hsv.rgb = function(hsv) {
        const h = hsv[0] / 60;
        const s = hsv[1] / 100;
        let v = hsv[2] / 100;
        const hi = Math.floor(h) % 6;
        const f = h - Math.floor(h);
        const p = 255 * v * (1 - s);
        const q = 255 * v * (1 - s * f);
        const t = 255 * v * (1 - s * (1 - f));
        v *= 255;
        switch (hi) {
          case 0:
            return [v, t, p];
          case 1:
            return [q, v, p];
          case 2:
            return [p, v, t];
          case 3:
            return [p, q, v];
          case 4:
            return [t, p, v];
          case 5:
            return [v, p, q];
        }
      };
      convert.hsv.hsl = function(hsv) {
        const h = hsv[0];
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const vmin = Math.max(v, 0.01);
        let sl;
        let l;
        l = (2 - s) * v;
        const lmin = (2 - s) * vmin;
        sl = s * vmin;
        sl /= lmin <= 1 ? lmin : 2 - lmin;
        sl = sl || 0;
        l /= 2;
        return [h, sl * 100, l * 100];
      };
      convert.hwb.rgb = function(hwb) {
        const h = hwb[0] / 360;
        let wh = hwb[1] / 100;
        let bl = hwb[2] / 100;
        const ratio = wh + bl;
        let f;
        if (ratio > 1) {
          wh /= ratio;
          bl /= ratio;
        }
        const i = Math.floor(6 * h);
        const v = 1 - bl;
        f = 6 * h - i;
        if ((i & 1) !== 0) {
          f = 1 - f;
        }
        const n = wh + f * (v - wh);
        let r;
        let g;
        let b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;
          case 1:
            r = n;
            g = v;
            b = wh;
            break;
          case 2:
            r = wh;
            g = v;
            b = n;
            break;
          case 3:
            r = wh;
            g = n;
            b = v;
            break;
          case 4:
            r = n;
            g = wh;
            b = v;
            break;
          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }
        return [r * 255, g * 255, b * 255];
      };
      convert.cmyk.rgb = function(cmyk) {
        const c = cmyk[0] / 100;
        const m = cmyk[1] / 100;
        const y = cmyk[2] / 100;
        const k = cmyk[3] / 100;
        const r = 1 - Math.min(1, c * (1 - k) + k);
        const g = 1 - Math.min(1, m * (1 - k) + k);
        const b = 1 - Math.min(1, y * (1 - k) + k);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.rgb = function(xyz) {
        const x = xyz[0] / 100;
        const y = xyz[1] / 100;
        const z = xyz[2] / 100;
        let r;
        let g;
        let b;
        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.204 + z * 1.057;
        r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
        g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
        b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.lab = function(xyz) {
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.lab.xyz = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let x;
        let y;
        let z;
        y = (l + 16) / 116;
        x = a / 500 + y;
        z = y - b / 200;
        const y2 = y ** 3;
        const x2 = x ** 3;
        const z2 = z ** 3;
        y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
        x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
        z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
        x *= 95.047;
        y *= 100;
        z *= 108.883;
        return [x, y, z];
      };
      convert.lab.lch = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let h;
        const hr = Math.atan2(b, a);
        h = hr * 360 / 2 / Math.PI;
        if (h < 0) {
          h += 360;
        }
        const c = Math.sqrt(a * a + b * b);
        return [l, c, h];
      };
      convert.lch.lab = function(lch) {
        const l = lch[0];
        const c = lch[1];
        const h = lch[2];
        const hr = h / 360 * 2 * Math.PI;
        const a = c * Math.cos(hr);
        const b = c * Math.sin(hr);
        return [l, a, b];
      };
      convert.rgb.ansi16 = function(args, saturation = null) {
        const [r, g, b] = args;
        let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
        value = Math.round(value / 50);
        if (value === 0) {
          return 30;
        }
        let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
        if (value === 2) {
          ansi += 60;
        }
        return ansi;
      };
      convert.hsv.ansi16 = function(args) {
        return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
      };
      convert.rgb.ansi256 = function(args) {
        const r = args[0];
        const g = args[1];
        const b = args[2];
        if (r === g && g === b) {
          if (r < 8) {
            return 16;
          }
          if (r > 248) {
            return 231;
          }
          return Math.round((r - 8) / 247 * 24) + 232;
        }
        const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
        return ansi;
      };
      convert.ansi16.rgb = function(args) {
        let color = args % 10;
        if (color === 0 || color === 7) {
          if (args > 50) {
            color += 3.5;
          }
          color = color / 10.5 * 255;
          return [color, color, color];
        }
        const mult = (~~(args > 50) + 1) * 0.5;
        const r = (color & 1) * mult * 255;
        const g = (color >> 1 & 1) * mult * 255;
        const b = (color >> 2 & 1) * mult * 255;
        return [r, g, b];
      };
      convert.ansi256.rgb = function(args) {
        if (args >= 232) {
          const c = (args - 232) * 10 + 8;
          return [c, c, c];
        }
        args -= 16;
        let rem;
        const r = Math.floor(args / 36) / 5 * 255;
        const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
        const b = rem % 6 / 5 * 255;
        return [r, g, b];
      };
      convert.rgb.hex = function(args) {
        const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.hex.rgb = function(args) {
        const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
        if (!match) {
          return [0, 0, 0];
        }
        let colorString = match[0];
        if (match[0].length === 3) {
          colorString = colorString.split("").map((char) => {
            return char + char;
          }).join("");
        }
        const integer = parseInt(colorString, 16);
        const r = integer >> 16 & 255;
        const g = integer >> 8 & 255;
        const b = integer & 255;
        return [r, g, b];
      };
      convert.rgb.hcg = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const max = Math.max(Math.max(r, g), b);
        const min = Math.min(Math.min(r, g), b);
        const chroma = max - min;
        let grayscale;
        let hue;
        if (chroma < 1) {
          grayscale = min / (1 - chroma);
        } else {
          grayscale = 0;
        }
        if (chroma <= 0) {
          hue = 0;
        } else if (max === r) {
          hue = (g - b) / chroma % 6;
        } else if (max === g) {
          hue = 2 + (b - r) / chroma;
        } else {
          hue = 4 + (r - g) / chroma;
        }
        hue /= 6;
        hue %= 1;
        return [hue * 360, chroma * 100, grayscale * 100];
      };
      convert.hsl.hcg = function(hsl) {
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
        let f = 0;
        if (c < 1) {
          f = (l - 0.5 * c) / (1 - c);
        }
        return [hsl[0], c * 100, f * 100];
      };
      convert.hsv.hcg = function(hsv) {
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const c = s * v;
        let f = 0;
        if (c < 1) {
          f = (v - c) / (1 - c);
        }
        return [hsv[0], c * 100, f * 100];
      };
      convert.hcg.rgb = function(hcg) {
        const h = hcg[0] / 360;
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        if (c === 0) {
          return [g * 255, g * 255, g * 255];
        }
        const pure = [0, 0, 0];
        const hi = h % 1 * 6;
        const v = hi % 1;
        const w = 1 - v;
        let mg = 0;
        switch (Math.floor(hi)) {
          case 0:
            pure[0] = 1;
            pure[1] = v;
            pure[2] = 0;
            break;
          case 1:
            pure[0] = w;
            pure[1] = 1;
            pure[2] = 0;
            break;
          case 2:
            pure[0] = 0;
            pure[1] = 1;
            pure[2] = v;
            break;
          case 3:
            pure[0] = 0;
            pure[1] = w;
            pure[2] = 1;
            break;
          case 4:
            pure[0] = v;
            pure[1] = 0;
            pure[2] = 1;
            break;
          default:
            pure[0] = 1;
            pure[1] = 0;
            pure[2] = w;
        }
        mg = (1 - c) * g;
        return [
          (c * pure[0] + mg) * 255,
          (c * pure[1] + mg) * 255,
          (c * pure[2] + mg) * 255
        ];
      };
      convert.hcg.hsv = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        let f = 0;
        if (v > 0) {
          f = c / v;
        }
        return [hcg[0], f * 100, v * 100];
      };
      convert.hcg.hsl = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const l = g * (1 - c) + 0.5 * c;
        let s = 0;
        if (l > 0 && l < 0.5) {
          s = c / (2 * l);
        } else if (l >= 0.5 && l < 1) {
          s = c / (2 * (1 - l));
        }
        return [hcg[0], s * 100, l * 100];
      };
      convert.hcg.hwb = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        return [hcg[0], (v - c) * 100, (1 - v) * 100];
      };
      convert.hwb.hcg = function(hwb) {
        const w = hwb[1] / 100;
        const b = hwb[2] / 100;
        const v = 1 - b;
        const c = v - w;
        let g = 0;
        if (c < 1) {
          g = (v - c) / (1 - c);
        }
        return [hwb[0], c * 100, g * 100];
      };
      convert.apple.rgb = function(apple) {
        return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
      };
      convert.rgb.apple = function(rgb) {
        return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
      };
      convert.gray.rgb = function(args) {
        return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
      };
      convert.gray.hsl = function(args) {
        return [0, 0, args[0]];
      };
      convert.gray.hsv = convert.gray.hsl;
      convert.gray.hwb = function(gray) {
        return [0, 100, gray[0]];
      };
      convert.gray.cmyk = function(gray) {
        return [0, 0, 0, gray[0]];
      };
      convert.gray.lab = function(gray) {
        return [gray[0], 0, 0];
      };
      convert.gray.hex = function(gray) {
        const val = Math.round(gray[0] / 100 * 255) & 255;
        const integer = (val << 16) + (val << 8) + val;
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.rgb.gray = function(rgb) {
        const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
        return [val / 255 * 100];
      };
    }
  });

  // node_modules/color-convert/route.js
  var require_route = __commonJS({
    "node_modules/color-convert/route.js"(exports2, module2) {
      var conversions = require_conversions();
      function buildGraph() {
        const graph = {};
        const models = Object.keys(conversions);
        for (let len = models.length, i = 0; i < len; i++) {
          graph[models[i]] = {
            // http://jsperf.com/1-vs-infinity
            // micro-opt, but this is simple.
            distance: -1,
            parent: null
          };
        }
        return graph;
      }
      function deriveBFS(fromModel) {
        const graph = buildGraph();
        const queue = [fromModel];
        graph[fromModel].distance = 0;
        while (queue.length) {
          const current = queue.pop();
          const adjacents = Object.keys(conversions[current]);
          for (let len = adjacents.length, i = 0; i < len; i++) {
            const adjacent = adjacents[i];
            const node = graph[adjacent];
            if (node.distance === -1) {
              node.distance = graph[current].distance + 1;
              node.parent = current;
              queue.unshift(adjacent);
            }
          }
        }
        return graph;
      }
      function link(from, to) {
        return function(args) {
          return to(from(args));
        };
      }
      function wrapConversion(toModel, graph) {
        const path = [graph[toModel].parent, toModel];
        let fn = conversions[graph[toModel].parent][toModel];
        let cur = graph[toModel].parent;
        while (graph[cur].parent) {
          path.unshift(graph[cur].parent);
          fn = link(conversions[graph[cur].parent][cur], fn);
          cur = graph[cur].parent;
        }
        fn.conversion = path;
        return fn;
      }
      module2.exports = function(fromModel) {
        const graph = deriveBFS(fromModel);
        const conversion = {};
        const models = Object.keys(graph);
        for (let len = models.length, i = 0; i < len; i++) {
          const toModel = models[i];
          const node = graph[toModel];
          if (node.parent === null) {
            continue;
          }
          conversion[toModel] = wrapConversion(toModel, graph);
        }
        return conversion;
      };
    }
  });

  // node_modules/color-convert/index.js
  var require_color_convert = __commonJS({
    "node_modules/color-convert/index.js"(exports2, module2) {
      var conversions = require_conversions();
      var route = require_route();
      var convert = {};
      var models = Object.keys(conversions);
      function wrapRaw(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          return fn(args);
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      function wrapRounded(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          const result = fn(args);
          if (typeof result === "object") {
            for (let len = result.length, i = 0; i < len; i++) {
              result[i] = Math.round(result[i]);
            }
          }
          return result;
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      models.forEach((fromModel) => {
        convert[fromModel] = {};
        Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
        Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
        const routes = route(fromModel);
        const routeModels = Object.keys(routes);
        routeModels.forEach((toModel) => {
          const fn = routes[toModel];
          convert[fromModel][toModel] = wrapRounded(fn);
          convert[fromModel][toModel].raw = wrapRaw(fn);
        });
      });
      module2.exports = convert;
    }
  });

  // node_modules/ansi-styles/index.js
  var require_ansi_styles = __commonJS({
    "node_modules/ansi-styles/index.js"(exports2, module2) {
      "use strict";
      var wrapAnsi16 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `\x1B[${code + offset}m`;
      };
      var wrapAnsi256 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `\x1B[${38 + offset};5;${code}m`;
      };
      var wrapAnsi16m = (fn, offset) => (...args) => {
        const rgb = fn(...args);
        return `\x1B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
      };
      var ansi2ansi = (n) => n;
      var rgb2rgb = (r, g, b) => [r, g, b];
      var setLazyProperty = (object, property, get) => {
        Object.defineProperty(object, property, {
          get: () => {
            const value = get();
            Object.defineProperty(object, property, {
              value,
              enumerable: true,
              configurable: true
            });
            return value;
          },
          enumerable: true,
          configurable: true
        });
      };
      var colorConvert;
      var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
        if (colorConvert === void 0) {
          colorConvert = require_color_convert();
        }
        const offset = isBackground ? 10 : 0;
        const styles = {};
        for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
          const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
          if (sourceSpace === targetSpace) {
            styles[name] = wrap(identity, offset);
          } else if (typeof suite === "object") {
            styles[name] = wrap(suite[targetSpace], offset);
          }
        }
        return styles;
      };
      function assembleStyles() {
        const codes = /* @__PURE__ */ new Map();
        const styles = {
          modifier: {
            reset: [0, 0],
            // 21 isn't widely supported and 22 does the same thing
            bold: [1, 22],
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29]
          },
          color: {
            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            // Bright color
            blackBright: [90, 39],
            redBright: [91, 39],
            greenBright: [92, 39],
            yellowBright: [93, 39],
            blueBright: [94, 39],
            magentaBright: [95, 39],
            cyanBright: [96, 39],
            whiteBright: [97, 39]
          },
          bgColor: {
            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49],
            // Bright color
            bgBlackBright: [100, 49],
            bgRedBright: [101, 49],
            bgGreenBright: [102, 49],
            bgYellowBright: [103, 49],
            bgBlueBright: [104, 49],
            bgMagentaBright: [105, 49],
            bgCyanBright: [106, 49],
            bgWhiteBright: [107, 49]
          }
        };
        styles.color.gray = styles.color.blackBright;
        styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
        styles.color.grey = styles.color.blackBright;
        styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
        for (const [groupName, group] of Object.entries(styles)) {
          for (const [styleName, style] of Object.entries(group)) {
            styles[styleName] = {
              open: `\x1B[${style[0]}m`,
              close: `\x1B[${style[1]}m`
            };
            group[styleName] = styles[styleName];
            codes.set(style[0], style[1]);
          }
          Object.defineProperty(styles, groupName, {
            value: group,
            enumerable: false
          });
        }
        Object.defineProperty(styles, "codes", {
          value: codes,
          enumerable: false
        });
        styles.color.close = "\x1B[39m";
        styles.bgColor.close = "\x1B[49m";
        setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
        setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
        return styles;
      }
      Object.defineProperty(module2, "exports", {
        enumerable: true,
        get: assembleStyles
      });
    }
  });

  // node_modules/slice-ansi/index.js
  var require_slice_ansi = __commonJS({
    "node_modules/slice-ansi/index.js"(exports2, module2) {
      "use strict";
      var isFullwidthCodePoint = require_is_fullwidth_code_point();
      var astralRegex = require_astral_regex();
      var ansiStyles = require_ansi_styles();
      var ESCAPES = [
        "\x1B",
        "\x9B"
      ];
      var wrapAnsi = (code) => `${ESCAPES[0]}[${code}m`;
      var checkAnsi = (ansiCodes, isEscapes, endAnsiCode) => {
        let output = [];
        ansiCodes = [...ansiCodes];
        for (let ansiCode of ansiCodes) {
          const ansiCodeOrigin = ansiCode;
          if (ansiCode.includes(";")) {
            ansiCode = ansiCode.split(";")[0][0] + "0";
          }
          const item = ansiStyles.codes.get(Number.parseInt(ansiCode, 10));
          if (item) {
            const indexEscape = ansiCodes.indexOf(item.toString());
            if (indexEscape === -1) {
              output.push(wrapAnsi(isEscapes ? item : ansiCodeOrigin));
            } else {
              ansiCodes.splice(indexEscape, 1);
            }
          } else if (isEscapes) {
            output.push(wrapAnsi(0));
            break;
          } else {
            output.push(wrapAnsi(ansiCodeOrigin));
          }
        }
        if (isEscapes) {
          output = output.filter((element, index) => output.indexOf(element) === index);
          if (endAnsiCode !== void 0) {
            const fistEscapeCode = wrapAnsi(ansiStyles.codes.get(Number.parseInt(endAnsiCode, 10)));
            output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
          }
        }
        return output.join("");
      };
      module2.exports = (string, begin, end) => {
        const characters = [...string];
        const ansiCodes = [];
        let stringEnd = typeof end === "number" ? end : characters.length;
        let isInsideEscape = false;
        let ansiCode;
        let visible = 0;
        let output = "";
        for (const [index, character] of characters.entries()) {
          let leftEscape = false;
          if (ESCAPES.includes(character)) {
            const code = /\d[^m]*/.exec(string.slice(index, index + 18));
            ansiCode = code && code.length > 0 ? code[0] : void 0;
            if (visible < stringEnd) {
              isInsideEscape = true;
              if (ansiCode !== void 0) {
                ansiCodes.push(ansiCode);
              }
            }
          } else if (isInsideEscape && character === "m") {
            isInsideEscape = false;
            leftEscape = true;
          }
          if (!isInsideEscape && !leftEscape) {
            visible++;
          }
          if (!astralRegex({ exact: true }).test(character) && isFullwidthCodePoint(character.codePointAt())) {
            visible++;
            if (typeof end !== "number") {
              stringEnd++;
            }
          }
          if (visible > begin && visible <= stringEnd) {
            output += character;
          } else if (visible === begin && !isInsideEscape && ansiCode !== void 0) {
            output = checkAnsi(ansiCodes);
          } else if (visible >= stringEnd) {
            output += checkAnsi(ansiCodes, true, ansiCode);
            break;
          }
        }
        return output;
      };
    }
  });

  // node_modules/table/dist/src/getBorderCharacters.js
  var require_getBorderCharacters = __commonJS({
    "node_modules/table/dist/src/getBorderCharacters.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.getBorderCharacters = void 0;
      var getBorderCharacters = (name) => {
        if (name === "honeywell") {
          return {
            topBody: "\u2550",
            topJoin: "\u2564",
            topLeft: "\u2554",
            topRight: "\u2557",
            bottomBody: "\u2550",
            bottomJoin: "\u2567",
            bottomLeft: "\u255A",
            bottomRight: "\u255D",
            bodyLeft: "\u2551",
            bodyRight: "\u2551",
            bodyJoin: "\u2502",
            headerJoin: "\u252C",
            joinBody: "\u2500",
            joinLeft: "\u255F",
            joinRight: "\u2562",
            joinJoin: "\u253C",
            joinMiddleDown: "\u252C",
            joinMiddleUp: "\u2534",
            joinMiddleLeft: "\u2524",
            joinMiddleRight: "\u251C"
          };
        }
        if (name === "norc") {
          return {
            topBody: "\u2500",
            topJoin: "\u252C",
            topLeft: "\u250C",
            topRight: "\u2510",
            bottomBody: "\u2500",
            bottomJoin: "\u2534",
            bottomLeft: "\u2514",
            bottomRight: "\u2518",
            bodyLeft: "\u2502",
            bodyRight: "\u2502",
            bodyJoin: "\u2502",
            headerJoin: "\u252C",
            joinBody: "\u2500",
            joinLeft: "\u251C",
            joinRight: "\u2524",
            joinJoin: "\u253C",
            joinMiddleDown: "\u252C",
            joinMiddleUp: "\u2534",
            joinMiddleLeft: "\u2524",
            joinMiddleRight: "\u251C"
          };
        }
        if (name === "ramac") {
          return {
            topBody: "-",
            topJoin: "+",
            topLeft: "+",
            topRight: "+",
            bottomBody: "-",
            bottomJoin: "+",
            bottomLeft: "+",
            bottomRight: "+",
            bodyLeft: "|",
            bodyRight: "|",
            bodyJoin: "|",
            headerJoin: "+",
            joinBody: "-",
            joinLeft: "|",
            joinRight: "|",
            joinJoin: "|",
            joinMiddleDown: "+",
            joinMiddleUp: "+",
            joinMiddleLeft: "+",
            joinMiddleRight: "+"
          };
        }
        if (name === "void") {
          return {
            topBody: "",
            topJoin: "",
            topLeft: "",
            topRight: "",
            bottomBody: "",
            bottomJoin: "",
            bottomLeft: "",
            bottomRight: "",
            bodyLeft: "",
            bodyRight: "",
            bodyJoin: "",
            headerJoin: "",
            joinBody: "",
            joinLeft: "",
            joinRight: "",
            joinJoin: "",
            joinMiddleDown: "",
            joinMiddleUp: "",
            joinMiddleLeft: "",
            joinMiddleRight: ""
          };
        }
        throw new Error('Unknown border template "' + name + '".');
      };
      exports2.getBorderCharacters = getBorderCharacters;
    }
  });

  // node_modules/table/dist/src/utils.js
  var require_utils = __commonJS({
    "node_modules/table/dist/src/utils.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.isCellInRange = exports2.areCellEqual = exports2.calculateRangeCoordinate = exports2.findOriginalRowIndex = exports2.flatten = exports2.extractTruncates = exports2.sumArray = exports2.sequence = exports2.distributeUnevenly = exports2.countSpaceSequence = exports2.groupBySizes = exports2.makeBorderConfig = exports2.splitAnsi = exports2.normalizeString = void 0;
      var slice_ansi_1 = __importDefault(require_slice_ansi());
      var string_width_1 = __importDefault(require_string_width());
      var strip_ansi_1 = __importDefault(require_strip_ansi());
      var getBorderCharacters_1 = require_getBorderCharacters();
      var normalizeString = (input) => {
        return input.replace(/\r\n/g, "\n");
      };
      exports2.normalizeString = normalizeString;
      var splitAnsi = (input) => {
        const lengths = (0, strip_ansi_1.default)(input).split("\n").map(string_width_1.default);
        const result = [];
        let startIndex = 0;
        lengths.forEach((length) => {
          result.push(length === 0 ? "" : (0, slice_ansi_1.default)(input, startIndex, startIndex + length));
          startIndex += length + 1;
        });
        return result;
      };
      exports2.splitAnsi = splitAnsi;
      var makeBorderConfig = (border) => {
        return {
          ...(0, getBorderCharacters_1.getBorderCharacters)("honeywell"),
          ...border
        };
      };
      exports2.makeBorderConfig = makeBorderConfig;
      var groupBySizes = (array, sizes) => {
        let startIndex = 0;
        return sizes.map((size) => {
          const group = array.slice(startIndex, startIndex + size);
          startIndex += size;
          return group;
        });
      };
      exports2.groupBySizes = groupBySizes;
      var countSpaceSequence = (input) => {
        var _a, _b;
        return (_b = (_a = input.match(/\s+/g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
      };
      exports2.countSpaceSequence = countSpaceSequence;
      var distributeUnevenly = (sum, length) => {
        const result = Array.from({ length }).fill(Math.floor(sum / length));
        return result.map((element, index) => {
          return element + (index < sum % length ? 1 : 0);
        });
      };
      exports2.distributeUnevenly = distributeUnevenly;
      var sequence = (start, end) => {
        return Array.from({ length: end - start + 1 }, (_, index) => {
          return index + start;
        });
      };
      exports2.sequence = sequence;
      var sumArray = (array) => {
        return array.reduce((accumulator, element) => {
          return accumulator + element;
        }, 0);
      };
      exports2.sumArray = sumArray;
      var extractTruncates = (config) => {
        return config.columns.map(({ truncate }) => {
          return truncate;
        });
      };
      exports2.extractTruncates = extractTruncates;
      var flatten = (array) => {
        return [].concat(...array);
      };
      exports2.flatten = flatten;
      var findOriginalRowIndex = (mappedRowHeights, mappedRowIndex) => {
        const rowIndexMapping = (0, exports2.flatten)(mappedRowHeights.map((height, index) => {
          return Array.from({ length: height }, () => {
            return index;
          });
        }));
        return rowIndexMapping[mappedRowIndex];
      };
      exports2.findOriginalRowIndex = findOriginalRowIndex;
      var calculateRangeCoordinate = (spanningCellConfig) => {
        const { row, col, colSpan = 1, rowSpan = 1 } = spanningCellConfig;
        return {
          bottomRight: {
            col: col + colSpan - 1,
            row: row + rowSpan - 1
          },
          topLeft: {
            col,
            row
          }
        };
      };
      exports2.calculateRangeCoordinate = calculateRangeCoordinate;
      var areCellEqual = (cell1, cell2) => {
        return cell1.row === cell2.row && cell1.col === cell2.col;
      };
      exports2.areCellEqual = areCellEqual;
      var isCellInRange = (cell, { topLeft, bottomRight }) => {
        return topLeft.row <= cell.row && cell.row <= bottomRight.row && topLeft.col <= cell.col && cell.col <= bottomRight.col;
      };
      exports2.isCellInRange = isCellInRange;
    }
  });

  // node_modules/table/dist/src/alignString.js
  var require_alignString = __commonJS({
    "node_modules/table/dist/src/alignString.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.alignString = void 0;
      var string_width_1 = __importDefault(require_string_width());
      var utils_1 = require_utils();
      var alignLeft = (subject, width) => {
        return subject + " ".repeat(width);
      };
      var alignRight = (subject, width) => {
        return " ".repeat(width) + subject;
      };
      var alignCenter = (subject, width) => {
        return " ".repeat(Math.floor(width / 2)) + subject + " ".repeat(Math.ceil(width / 2));
      };
      var alignJustify = (subject, width) => {
        const spaceSequenceCount = (0, utils_1.countSpaceSequence)(subject);
        if (spaceSequenceCount === 0) {
          return alignLeft(subject, width);
        }
        const addingSpaces = (0, utils_1.distributeUnevenly)(width, spaceSequenceCount);
        if (Math.max(...addingSpaces) > 3) {
          return alignLeft(subject, width);
        }
        let spaceSequenceIndex = 0;
        return subject.replace(/\s+/g, (groupSpace) => {
          return groupSpace + " ".repeat(addingSpaces[spaceSequenceIndex++]);
        });
      };
      var alignString = (subject, containerWidth, alignment) => {
        const subjectWidth = (0, string_width_1.default)(subject);
        if (subjectWidth === containerWidth) {
          return subject;
        }
        if (subjectWidth > containerWidth) {
          throw new Error("Subject parameter value width cannot be greater than the container width.");
        }
        if (subjectWidth === 0) {
          return " ".repeat(containerWidth);
        }
        const availableWidth = containerWidth - subjectWidth;
        if (alignment === "left") {
          return alignLeft(subject, availableWidth);
        }
        if (alignment === "right") {
          return alignRight(subject, availableWidth);
        }
        if (alignment === "justify") {
          return alignJustify(subject, availableWidth);
        }
        return alignCenter(subject, availableWidth);
      };
      exports2.alignString = alignString;
    }
  });

  // node_modules/table/dist/src/alignTableData.js
  var require_alignTableData = __commonJS({
    "node_modules/table/dist/src/alignTableData.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.alignTableData = void 0;
      var alignString_1 = require_alignString();
      var alignTableData = (rows, config) => {
        return rows.map((row, rowIndex) => {
          return row.map((cell, cellIndex) => {
            var _a;
            const { width, alignment } = config.columns[cellIndex];
            const containingRange = (_a = config.spanningCellManager) === null || _a === void 0 ? void 0 : _a.getContainingRange({
              col: cellIndex,
              row: rowIndex
            }, { mapped: true });
            if (containingRange) {
              return cell;
            }
            return (0, alignString_1.alignString)(cell, width, alignment);
          });
        });
      };
      exports2.alignTableData = alignTableData;
    }
  });

  // node_modules/table/dist/src/wrapString.js
  var require_wrapString = __commonJS({
    "node_modules/table/dist/src/wrapString.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.wrapString = void 0;
      var slice_ansi_1 = __importDefault(require_slice_ansi());
      var string_width_1 = __importDefault(require_string_width());
      var wrapString = (subject, size) => {
        let subjectSlice = subject;
        const chunks = [];
        do {
          chunks.push((0, slice_ansi_1.default)(subjectSlice, 0, size));
          subjectSlice = (0, slice_ansi_1.default)(subjectSlice, size).trim();
        } while ((0, string_width_1.default)(subjectSlice));
        return chunks;
      };
      exports2.wrapString = wrapString;
    }
  });

  // node_modules/table/dist/src/wrapWord.js
  var require_wrapWord = __commonJS({
    "node_modules/table/dist/src/wrapWord.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.wrapWord = void 0;
      var slice_ansi_1 = __importDefault(require_slice_ansi());
      var strip_ansi_1 = __importDefault(require_strip_ansi());
      var calculateStringLengths = (input, size) => {
        let subject = (0, strip_ansi_1.default)(input);
        const chunks = [];
        const re = new RegExp("(^.{1," + String(Math.max(size, 1)) + "}(\\s+|$))|(^.{1," + String(Math.max(size - 1, 1)) + "}(\\\\|/|_|\\.|,|;|-))");
        do {
          let chunk;
          const match = re.exec(subject);
          if (match) {
            chunk = match[0];
            subject = subject.slice(chunk.length);
            const trimmedLength = chunk.trim().length;
            const offset = chunk.length - trimmedLength;
            chunks.push([trimmedLength, offset]);
          } else {
            chunk = subject.slice(0, size);
            subject = subject.slice(size);
            chunks.push([chunk.length, 0]);
          }
        } while (subject.length);
        return chunks;
      };
      var wrapWord = (input, size) => {
        const result = [];
        let startIndex = 0;
        calculateStringLengths(input, size).forEach(([length, offset]) => {
          result.push((0, slice_ansi_1.default)(input, startIndex, startIndex + length));
          startIndex += length + offset;
        });
        return result;
      };
      exports2.wrapWord = wrapWord;
    }
  });

  // node_modules/table/dist/src/wrapCell.js
  var require_wrapCell = __commonJS({
    "node_modules/table/dist/src/wrapCell.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.wrapCell = void 0;
      var utils_1 = require_utils();
      var wrapString_1 = require_wrapString();
      var wrapWord_1 = require_wrapWord();
      var wrapCell = (cellValue, cellWidth, useWrapWord) => {
        const cellLines = (0, utils_1.splitAnsi)(cellValue);
        for (let lineNr = 0; lineNr < cellLines.length; ) {
          let lineChunks;
          if (useWrapWord) {
            lineChunks = (0, wrapWord_1.wrapWord)(cellLines[lineNr], cellWidth);
          } else {
            lineChunks = (0, wrapString_1.wrapString)(cellLines[lineNr], cellWidth);
          }
          cellLines.splice(lineNr, 1, ...lineChunks);
          lineNr += lineChunks.length;
        }
        return cellLines;
      };
      exports2.wrapCell = wrapCell;
    }
  });

  // node_modules/table/dist/src/calculateCellHeight.js
  var require_calculateCellHeight = __commonJS({
    "node_modules/table/dist/src/calculateCellHeight.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.calculateCellHeight = void 0;
      var wrapCell_1 = require_wrapCell();
      var calculateCellHeight = (value, columnWidth, useWrapWord = false) => {
        return (0, wrapCell_1.wrapCell)(value, columnWidth, useWrapWord).length;
      };
      exports2.calculateCellHeight = calculateCellHeight;
    }
  });

  // node_modules/table/dist/src/calculateRowHeights.js
  var require_calculateRowHeights = __commonJS({
    "node_modules/table/dist/src/calculateRowHeights.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.calculateRowHeights = void 0;
      var calculateCellHeight_1 = require_calculateCellHeight();
      var utils_1 = require_utils();
      var calculateRowHeights = (rows, config) => {
        const rowHeights = [];
        for (const [rowIndex, row] of rows.entries()) {
          let rowHeight = 1;
          row.forEach((cell, cellIndex) => {
            var _a;
            const containingRange = (_a = config.spanningCellManager) === null || _a === void 0 ? void 0 : _a.getContainingRange({
              col: cellIndex,
              row: rowIndex
            });
            if (!containingRange) {
              const cellHeight = (0, calculateCellHeight_1.calculateCellHeight)(cell, config.columns[cellIndex].width, config.columns[cellIndex].wrapWord);
              rowHeight = Math.max(rowHeight, cellHeight);
              return;
            }
            const { topLeft, bottomRight, height } = containingRange;
            if (rowIndex === bottomRight.row) {
              const totalOccupiedSpanningCellHeight = (0, utils_1.sumArray)(rowHeights.slice(topLeft.row));
              const totalHorizontalBorderHeight = bottomRight.row - topLeft.row;
              const totalHiddenHorizontalBorderHeight = (0, utils_1.sequence)(topLeft.row + 1, bottomRight.row).filter((horizontalBorderIndex) => {
                var _a2;
                return !((_a2 = config.drawHorizontalLine) === null || _a2 === void 0 ? void 0 : _a2.call(config, horizontalBorderIndex, rows.length));
              }).length;
              const cellHeight = height - totalOccupiedSpanningCellHeight - totalHorizontalBorderHeight + totalHiddenHorizontalBorderHeight;
              rowHeight = Math.max(rowHeight, cellHeight);
            }
          });
          rowHeights.push(rowHeight);
        }
        return rowHeights;
      };
      exports2.calculateRowHeights = calculateRowHeights;
    }
  });

  // node_modules/table/dist/src/drawContent.js
  var require_drawContent = __commonJS({
    "node_modules/table/dist/src/drawContent.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.drawContent = void 0;
      var drawContent = (parameters) => {
        const { contents, separatorGetter, drawSeparator, spanningCellManager, rowIndex, elementType } = parameters;
        const contentSize = contents.length;
        const result = [];
        if (drawSeparator(0, contentSize)) {
          result.push(separatorGetter(0, contentSize));
        }
        contents.forEach((content, contentIndex) => {
          if (!elementType || elementType === "border" || elementType === "row") {
            result.push(content);
          }
          if (elementType === "cell" && rowIndex === void 0) {
            result.push(content);
          }
          if (elementType === "cell" && rowIndex !== void 0) {
            const containingRange = spanningCellManager === null || spanningCellManager === void 0 ? void 0 : spanningCellManager.getContainingRange({
              col: contentIndex,
              row: rowIndex
            });
            if (!containingRange || contentIndex === containingRange.topLeft.col) {
              result.push(content);
            }
          }
          if (contentIndex + 1 < contentSize && drawSeparator(contentIndex + 1, contentSize)) {
            const separator = separatorGetter(contentIndex + 1, contentSize);
            if (elementType === "cell" && rowIndex !== void 0) {
              const currentCell = {
                col: contentIndex + 1,
                row: rowIndex
              };
              const containingRange = spanningCellManager === null || spanningCellManager === void 0 ? void 0 : spanningCellManager.getContainingRange(currentCell);
              if (!containingRange || containingRange.topLeft.col === currentCell.col) {
                result.push(separator);
              }
            } else {
              result.push(separator);
            }
          }
        });
        if (drawSeparator(contentSize, contentSize)) {
          result.push(separatorGetter(contentSize, contentSize));
        }
        return result.join("");
      };
      exports2.drawContent = drawContent;
    }
  });

  // node_modules/table/dist/src/drawBorder.js
  var require_drawBorder = __commonJS({
    "node_modules/table/dist/src/drawBorder.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.createTableBorderGetter = exports2.drawBorderBottom = exports2.drawBorderJoin = exports2.drawBorderTop = exports2.drawBorder = exports2.createSeparatorGetter = exports2.drawBorderSegments = void 0;
      var drawContent_1 = require_drawContent();
      var drawBorderSegments = (columnWidths, parameters) => {
        const { separator, horizontalBorderIndex, spanningCellManager } = parameters;
        return columnWidths.map((columnWidth, columnIndex) => {
          const normalSegment = separator.body.repeat(columnWidth);
          if (horizontalBorderIndex === void 0) {
            return normalSegment;
          }
          const range = spanningCellManager === null || spanningCellManager === void 0 ? void 0 : spanningCellManager.getContainingRange({
            col: columnIndex,
            row: horizontalBorderIndex
          });
          if (!range) {
            return normalSegment;
          }
          const { topLeft } = range;
          if (horizontalBorderIndex === topLeft.row) {
            return normalSegment;
          }
          if (columnIndex !== topLeft.col) {
            return "";
          }
          return range.extractBorderContent(horizontalBorderIndex);
        });
      };
      exports2.drawBorderSegments = drawBorderSegments;
      var createSeparatorGetter = (dependencies) => {
        const { separator, spanningCellManager, horizontalBorderIndex, rowCount } = dependencies;
        return (verticalBorderIndex, columnCount) => {
          const inSameRange = spanningCellManager === null || spanningCellManager === void 0 ? void 0 : spanningCellManager.inSameRange;
          if (horizontalBorderIndex !== void 0 && inSameRange) {
            const topCell = {
              col: verticalBorderIndex,
              row: horizontalBorderIndex - 1
            };
            const leftCell = {
              col: verticalBorderIndex - 1,
              row: horizontalBorderIndex
            };
            const oppositeCell = {
              col: verticalBorderIndex - 1,
              row: horizontalBorderIndex - 1
            };
            const currentCell = {
              col: verticalBorderIndex,
              row: horizontalBorderIndex
            };
            const pairs = [
              [oppositeCell, topCell],
              [topCell, currentCell],
              [currentCell, leftCell],
              [leftCell, oppositeCell]
            ];
            if (verticalBorderIndex === 0) {
              if (inSameRange(currentCell, topCell) && separator.bodyJoinOuter) {
                return separator.bodyJoinOuter;
              }
              return separator.left;
            }
            if (verticalBorderIndex === columnCount) {
              if (inSameRange(oppositeCell, leftCell) && separator.bodyJoinOuter) {
                return separator.bodyJoinOuter;
              }
              return separator.right;
            }
            if (horizontalBorderIndex === 0) {
              if (inSameRange(currentCell, leftCell)) {
                return separator.body;
              }
              return separator.join;
            }
            if (horizontalBorderIndex === rowCount) {
              if (inSameRange(topCell, oppositeCell)) {
                return separator.body;
              }
              return separator.join;
            }
            const sameRangeCount = pairs.map((pair) => {
              return inSameRange(...pair);
            }).filter(Boolean).length;
            if (sameRangeCount === 0) {
              return separator.join;
            }
            if (sameRangeCount === 4) {
              return "";
            }
            if (sameRangeCount === 2) {
              if (inSameRange(...pairs[1]) && inSameRange(...pairs[3]) && separator.bodyJoinInner) {
                return separator.bodyJoinInner;
              }
              return separator.body;
            }
            if (sameRangeCount === 1) {
              if (!separator.joinRight || !separator.joinLeft || !separator.joinUp || !separator.joinDown) {
                throw new Error(`Can not get border separator for position [${horizontalBorderIndex}, ${verticalBorderIndex}]`);
              }
              if (inSameRange(...pairs[0])) {
                return separator.joinDown;
              }
              if (inSameRange(...pairs[1])) {
                return separator.joinLeft;
              }
              if (inSameRange(...pairs[2])) {
                return separator.joinUp;
              }
              return separator.joinRight;
            }
            throw new Error("Invalid case");
          }
          if (verticalBorderIndex === 0) {
            return separator.left;
          }
          if (verticalBorderIndex === columnCount) {
            return separator.right;
          }
          return separator.join;
        };
      };
      exports2.createSeparatorGetter = createSeparatorGetter;
      var drawBorder = (columnWidths, parameters) => {
        const borderSegments = (0, exports2.drawBorderSegments)(columnWidths, parameters);
        const { drawVerticalLine, horizontalBorderIndex, spanningCellManager } = parameters;
        return (0, drawContent_1.drawContent)({
          contents: borderSegments,
          drawSeparator: drawVerticalLine,
          elementType: "border",
          rowIndex: horizontalBorderIndex,
          separatorGetter: (0, exports2.createSeparatorGetter)(parameters),
          spanningCellManager
        }) + "\n";
      };
      exports2.drawBorder = drawBorder;
      var drawBorderTop = (columnWidths, parameters) => {
        const { border } = parameters;
        const result = (0, exports2.drawBorder)(columnWidths, {
          ...parameters,
          separator: {
            body: border.topBody,
            join: border.topJoin,
            left: border.topLeft,
            right: border.topRight
          }
        });
        if (result === "\n") {
          return "";
        }
        return result;
      };
      exports2.drawBorderTop = drawBorderTop;
      var drawBorderJoin = (columnWidths, parameters) => {
        const { border } = parameters;
        return (0, exports2.drawBorder)(columnWidths, {
          ...parameters,
          separator: {
            body: border.joinBody,
            bodyJoinInner: border.bodyJoin,
            bodyJoinOuter: border.bodyLeft,
            join: border.joinJoin,
            joinDown: border.joinMiddleDown,
            joinLeft: border.joinMiddleLeft,
            joinRight: border.joinMiddleRight,
            joinUp: border.joinMiddleUp,
            left: border.joinLeft,
            right: border.joinRight
          }
        });
      };
      exports2.drawBorderJoin = drawBorderJoin;
      var drawBorderBottom = (columnWidths, parameters) => {
        const { border } = parameters;
        return (0, exports2.drawBorder)(columnWidths, {
          ...parameters,
          separator: {
            body: border.bottomBody,
            join: border.bottomJoin,
            left: border.bottomLeft,
            right: border.bottomRight
          }
        });
      };
      exports2.drawBorderBottom = drawBorderBottom;
      var createTableBorderGetter = (columnWidths, parameters) => {
        return (index, size) => {
          const drawBorderParameters = {
            ...parameters,
            horizontalBorderIndex: index
          };
          if (index === 0) {
            return (0, exports2.drawBorderTop)(columnWidths, drawBorderParameters);
          } else if (index === size) {
            return (0, exports2.drawBorderBottom)(columnWidths, drawBorderParameters);
          }
          return (0, exports2.drawBorderJoin)(columnWidths, drawBorderParameters);
        };
      };
      exports2.createTableBorderGetter = createTableBorderGetter;
    }
  });

  // node_modules/table/dist/src/drawRow.js
  var require_drawRow = __commonJS({
    "node_modules/table/dist/src/drawRow.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.drawRow = void 0;
      var drawContent_1 = require_drawContent();
      var drawRow = (row, config) => {
        const { border, drawVerticalLine, rowIndex, spanningCellManager } = config;
        return (0, drawContent_1.drawContent)({
          contents: row,
          drawSeparator: drawVerticalLine,
          elementType: "cell",
          rowIndex,
          separatorGetter: (index, columnCount) => {
            if (index === 0) {
              return border.bodyLeft;
            }
            if (index === columnCount) {
              return border.bodyRight;
            }
            return border.bodyJoin;
          },
          spanningCellManager
        }) + "\n";
      };
      exports2.drawRow = drawRow;
    }
  });

  // node_modules/fast-deep-equal/index.js
  var require_fast_deep_equal = __commonJS({
    "node_modules/fast-deep-equal/index.js"(exports2, module2) {
      "use strict";
      module2.exports = function equal(a, b) {
        if (a === b)
          return true;
        if (a && b && typeof a == "object" && typeof b == "object") {
          if (a.constructor !== b.constructor)
            return false;
          var length, i, keys;
          if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length)
              return false;
            for (i = length; i-- !== 0; )
              if (!equal(a[i], b[i]))
                return false;
            return true;
          }
          if (a.constructor === RegExp)
            return a.source === b.source && a.flags === b.flags;
          if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
          if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
          keys = Object.keys(a);
          length = keys.length;
          if (length !== Object.keys(b).length)
            return false;
          for (i = length; i-- !== 0; )
            if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
              return false;
          for (i = length; i-- !== 0; ) {
            var key = keys[i];
            if (!equal(a[key], b[key]))
              return false;
          }
          return true;
        }
        return a !== a && b !== b;
      };
    }
  });

  // node_modules/table/node_modules/ajv/dist/runtime/equal.js
  var require_equal = __commonJS({
    "node_modules/table/node_modules/ajv/dist/runtime/equal.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      var equal = require_fast_deep_equal();
      equal.code = 'require("ajv/dist/runtime/equal").default';
      exports2.default = equal;
    }
  });

  // node_modules/table/dist/src/generated/validators.js
  var require_validators = __commonJS({
    "node_modules/table/dist/src/generated/validators.js"(exports2) {
      "use strict";
      exports2["config.json"] = validate43;
      var schema13 = {
        "$id": "config.json",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "border": {
            "$ref": "shared.json#/definitions/borders"
          },
          "header": {
            "type": "object",
            "properties": {
              "content": {
                "type": "string"
              },
              "alignment": {
                "$ref": "shared.json#/definitions/alignment"
              },
              "wrapWord": {
                "type": "boolean"
              },
              "truncate": {
                "type": "integer"
              },
              "paddingLeft": {
                "type": "integer"
              },
              "paddingRight": {
                "type": "integer"
              }
            },
            "required": ["content"],
            "additionalProperties": false
          },
          "columns": {
            "$ref": "shared.json#/definitions/columns"
          },
          "columnDefault": {
            "$ref": "shared.json#/definitions/column"
          },
          "drawVerticalLine": {
            "typeof": "function"
          },
          "drawHorizontalLine": {
            "typeof": "function"
          },
          "singleLine": {
            "typeof": "boolean"
          },
          "spanningCells": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "col": {
                  "type": "integer",
                  "minimum": 0
                },
                "row": {
                  "type": "integer",
                  "minimum": 0
                },
                "colSpan": {
                  "type": "integer",
                  "minimum": 1
                },
                "rowSpan": {
                  "type": "integer",
                  "minimum": 1
                },
                "alignment": {
                  "$ref": "shared.json#/definitions/alignment"
                },
                "verticalAlignment": {
                  "$ref": "shared.json#/definitions/verticalAlignment"
                },
                "wrapWord": {
                  "type": "boolean"
                },
                "truncate": {
                  "type": "integer"
                },
                "paddingLeft": {
                  "type": "integer"
                },
                "paddingRight": {
                  "type": "integer"
                }
              },
              "required": ["row", "col"],
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      };
      var schema15 = {
        "type": "object",
        "properties": {
          "topBody": {
            "$ref": "#/definitions/border"
          },
          "topJoin": {
            "$ref": "#/definitions/border"
          },
          "topLeft": {
            "$ref": "#/definitions/border"
          },
          "topRight": {
            "$ref": "#/definitions/border"
          },
          "bottomBody": {
            "$ref": "#/definitions/border"
          },
          "bottomJoin": {
            "$ref": "#/definitions/border"
          },
          "bottomLeft": {
            "$ref": "#/definitions/border"
          },
          "bottomRight": {
            "$ref": "#/definitions/border"
          },
          "bodyLeft": {
            "$ref": "#/definitions/border"
          },
          "bodyRight": {
            "$ref": "#/definitions/border"
          },
          "bodyJoin": {
            "$ref": "#/definitions/border"
          },
          "headerJoin": {
            "$ref": "#/definitions/border"
          },
          "joinBody": {
            "$ref": "#/definitions/border"
          },
          "joinLeft": {
            "$ref": "#/definitions/border"
          },
          "joinRight": {
            "$ref": "#/definitions/border"
          },
          "joinJoin": {
            "$ref": "#/definitions/border"
          },
          "joinMiddleUp": {
            "$ref": "#/definitions/border"
          },
          "joinMiddleDown": {
            "$ref": "#/definitions/border"
          },
          "joinMiddleLeft": {
            "$ref": "#/definitions/border"
          },
          "joinMiddleRight": {
            "$ref": "#/definitions/border"
          }
        },
        "additionalProperties": false
      };
      var func8 = Object.prototype.hasOwnProperty;
      function validate46(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (typeof data !== "string") {
          const err0 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "string"
            },
            message: "must be string"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        validate46.errors = vErrors;
        return errors === 0;
      }
      function validate45(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!func8.call(schema15.properties, key0)) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.topBody !== void 0) {
            if (!validate46(data.topBody, {
              instancePath: instancePath + "/topBody",
              parentData: data,
              parentDataProperty: "topBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topJoin !== void 0) {
            if (!validate46(data.topJoin, {
              instancePath: instancePath + "/topJoin",
              parentData: data,
              parentDataProperty: "topJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topLeft !== void 0) {
            if (!validate46(data.topLeft, {
              instancePath: instancePath + "/topLeft",
              parentData: data,
              parentDataProperty: "topLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topRight !== void 0) {
            if (!validate46(data.topRight, {
              instancePath: instancePath + "/topRight",
              parentData: data,
              parentDataProperty: "topRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomBody !== void 0) {
            if (!validate46(data.bottomBody, {
              instancePath: instancePath + "/bottomBody",
              parentData: data,
              parentDataProperty: "bottomBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomJoin !== void 0) {
            if (!validate46(data.bottomJoin, {
              instancePath: instancePath + "/bottomJoin",
              parentData: data,
              parentDataProperty: "bottomJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomLeft !== void 0) {
            if (!validate46(data.bottomLeft, {
              instancePath: instancePath + "/bottomLeft",
              parentData: data,
              parentDataProperty: "bottomLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomRight !== void 0) {
            if (!validate46(data.bottomRight, {
              instancePath: instancePath + "/bottomRight",
              parentData: data,
              parentDataProperty: "bottomRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyLeft !== void 0) {
            if (!validate46(data.bodyLeft, {
              instancePath: instancePath + "/bodyLeft",
              parentData: data,
              parentDataProperty: "bodyLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyRight !== void 0) {
            if (!validate46(data.bodyRight, {
              instancePath: instancePath + "/bodyRight",
              parentData: data,
              parentDataProperty: "bodyRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyJoin !== void 0) {
            if (!validate46(data.bodyJoin, {
              instancePath: instancePath + "/bodyJoin",
              parentData: data,
              parentDataProperty: "bodyJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.headerJoin !== void 0) {
            if (!validate46(data.headerJoin, {
              instancePath: instancePath + "/headerJoin",
              parentData: data,
              parentDataProperty: "headerJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinBody !== void 0) {
            if (!validate46(data.joinBody, {
              instancePath: instancePath + "/joinBody",
              parentData: data,
              parentDataProperty: "joinBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinLeft !== void 0) {
            if (!validate46(data.joinLeft, {
              instancePath: instancePath + "/joinLeft",
              parentData: data,
              parentDataProperty: "joinLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinRight !== void 0) {
            if (!validate46(data.joinRight, {
              instancePath: instancePath + "/joinRight",
              parentData: data,
              parentDataProperty: "joinRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinJoin !== void 0) {
            if (!validate46(data.joinJoin, {
              instancePath: instancePath + "/joinJoin",
              parentData: data,
              parentDataProperty: "joinJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleUp !== void 0) {
            if (!validate46(data.joinMiddleUp, {
              instancePath: instancePath + "/joinMiddleUp",
              parentData: data,
              parentDataProperty: "joinMiddleUp",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleDown !== void 0) {
            if (!validate46(data.joinMiddleDown, {
              instancePath: instancePath + "/joinMiddleDown",
              parentData: data,
              parentDataProperty: "joinMiddleDown",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleLeft !== void 0) {
            if (!validate46(data.joinMiddleLeft, {
              instancePath: instancePath + "/joinMiddleLeft",
              parentData: data,
              parentDataProperty: "joinMiddleLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleRight !== void 0) {
            if (!validate46(data.joinMiddleRight, {
              instancePath: instancePath + "/joinMiddleRight",
              parentData: data,
              parentDataProperty: "joinMiddleRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
        } else {
          const err1 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate45.errors = vErrors;
        return errors === 0;
      }
      var schema17 = {
        "type": "string",
        "enum": ["left", "right", "center", "justify"]
      };
      var func0 = require_equal().default;
      function validate68(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (typeof data !== "string") {
          const err0 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "string"
            },
            message: "must be string"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (!(data === "left" || data === "right" || data === "center" || data === "justify")) {
          const err1 = {
            instancePath,
            schemaPath: "#/enum",
            keyword: "enum",
            params: {
              allowedValues: schema17.enum
            },
            message: "must be equal to one of the allowed values"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate68.errors = vErrors;
        return errors === 0;
      }
      var pattern0 = new RegExp("^[0-9]+$", "u");
      function validate72(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (typeof data !== "string") {
          const err0 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "string"
            },
            message: "must be string"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (!(data === "left" || data === "right" || data === "center" || data === "justify")) {
          const err1 = {
            instancePath,
            schemaPath: "#/enum",
            keyword: "enum",
            params: {
              allowedValues: schema17.enum
            },
            message: "must be equal to one of the allowed values"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate72.errors = vErrors;
        return errors === 0;
      }
      var schema21 = {
        "type": "string",
        "enum": ["top", "middle", "bottom"]
      };
      function validate74(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (typeof data !== "string") {
          const err0 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "string"
            },
            message: "must be string"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (!(data === "top" || data === "middle" || data === "bottom")) {
          const err1 = {
            instancePath,
            schemaPath: "#/enum",
            keyword: "enum",
            params: {
              allowedValues: schema21.enum
            },
            message: "must be equal to one of the allowed values"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate74.errors = vErrors;
        return errors === 0;
      }
      function validate71(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!(key0 === "alignment" || key0 === "verticalAlignment" || key0 === "width" || key0 === "wrapWord" || key0 === "truncate" || key0 === "paddingLeft" || key0 === "paddingRight")) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.alignment !== void 0) {
            if (!validate72(data.alignment, {
              instancePath: instancePath + "/alignment",
              parentData: data,
              parentDataProperty: "alignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate72.errors : vErrors.concat(validate72.errors);
              errors = vErrors.length;
            }
          }
          if (data.verticalAlignment !== void 0) {
            if (!validate74(data.verticalAlignment, {
              instancePath: instancePath + "/verticalAlignment",
              parentData: data,
              parentDataProperty: "verticalAlignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
              errors = vErrors.length;
            }
          }
          if (data.width !== void 0) {
            let data2 = data.width;
            if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
              const err1 = {
                instancePath: instancePath + "/width",
                schemaPath: "#/properties/width/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
            if (typeof data2 == "number" && isFinite(data2)) {
              if (data2 < 1 || isNaN(data2)) {
                const err2 = {
                  instancePath: instancePath + "/width",
                  schemaPath: "#/properties/width/minimum",
                  keyword: "minimum",
                  params: {
                    comparison: ">=",
                    limit: 1
                  },
                  message: "must be >= 1"
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
          }
          if (data.wrapWord !== void 0) {
            if (typeof data.wrapWord !== "boolean") {
              const err3 = {
                instancePath: instancePath + "/wrapWord",
                schemaPath: "#/properties/wrapWord/type",
                keyword: "type",
                params: {
                  type: "boolean"
                },
                message: "must be boolean"
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          }
          if (data.truncate !== void 0) {
            let data4 = data.truncate;
            if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
              const err4 = {
                instancePath: instancePath + "/truncate",
                schemaPath: "#/properties/truncate/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          }
          if (data.paddingLeft !== void 0) {
            let data5 = data.paddingLeft;
            if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
              const err5 = {
                instancePath: instancePath + "/paddingLeft",
                schemaPath: "#/properties/paddingLeft/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          }
          if (data.paddingRight !== void 0) {
            let data6 = data.paddingRight;
            if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
              const err6 = {
                instancePath: instancePath + "/paddingRight",
                schemaPath: "#/properties/paddingRight/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          }
        } else {
          const err7 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        validate71.errors = vErrors;
        return errors === 0;
      }
      function validate70(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        const _errs0 = errors;
        let valid0 = false;
        let passing0 = null;
        const _errs1 = errors;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!pattern0.test(key0)) {
              const err0 = {
                instancePath,
                schemaPath: "#/oneOf/0/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          for (const key1 in data) {
            if (pattern0.test(key1)) {
              if (!validate71(data[key1], {
                instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),
                parentData: data,
                parentDataProperty: key1,
                rootData
              })) {
                vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                errors = vErrors.length;
              }
            }
          }
        } else {
          const err1 = {
            instancePath,
            schemaPath: "#/oneOf/0/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        var _valid0 = _errs1 === errors;
        if (_valid0) {
          valid0 = true;
          passing0 = 0;
        }
        const _errs5 = errors;
        if (Array.isArray(data)) {
          const len0 = data.length;
          for (let i0 = 0; i0 < len0; i0++) {
            if (!validate71(data[i0], {
              instancePath: instancePath + "/" + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData
            })) {
              vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
              errors = vErrors.length;
            }
          }
        } else {
          const err2 = {
            instancePath,
            schemaPath: "#/oneOf/1/type",
            keyword: "type",
            params: {
              type: "array"
            },
            message: "must be array"
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 1];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 1;
          }
        }
        if (!valid0) {
          const err3 = {
            instancePath,
            schemaPath: "#/oneOf",
            keyword: "oneOf",
            params: {
              passingSchemas: passing0
            },
            message: "must match exactly one schema in oneOf"
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        } else {
          errors = _errs0;
          if (vErrors !== null) {
            if (_errs0) {
              vErrors.length = _errs0;
            } else {
              vErrors = null;
            }
          }
        }
        validate70.errors = vErrors;
        return errors === 0;
      }
      function validate79(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!(key0 === "alignment" || key0 === "verticalAlignment" || key0 === "width" || key0 === "wrapWord" || key0 === "truncate" || key0 === "paddingLeft" || key0 === "paddingRight")) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.alignment !== void 0) {
            if (!validate72(data.alignment, {
              instancePath: instancePath + "/alignment",
              parentData: data,
              parentDataProperty: "alignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate72.errors : vErrors.concat(validate72.errors);
              errors = vErrors.length;
            }
          }
          if (data.verticalAlignment !== void 0) {
            if (!validate74(data.verticalAlignment, {
              instancePath: instancePath + "/verticalAlignment",
              parentData: data,
              parentDataProperty: "verticalAlignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
              errors = vErrors.length;
            }
          }
          if (data.width !== void 0) {
            let data2 = data.width;
            if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
              const err1 = {
                instancePath: instancePath + "/width",
                schemaPath: "#/properties/width/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
            if (typeof data2 == "number" && isFinite(data2)) {
              if (data2 < 1 || isNaN(data2)) {
                const err2 = {
                  instancePath: instancePath + "/width",
                  schemaPath: "#/properties/width/minimum",
                  keyword: "minimum",
                  params: {
                    comparison: ">=",
                    limit: 1
                  },
                  message: "must be >= 1"
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
          }
          if (data.wrapWord !== void 0) {
            if (typeof data.wrapWord !== "boolean") {
              const err3 = {
                instancePath: instancePath + "/wrapWord",
                schemaPath: "#/properties/wrapWord/type",
                keyword: "type",
                params: {
                  type: "boolean"
                },
                message: "must be boolean"
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          }
          if (data.truncate !== void 0) {
            let data4 = data.truncate;
            if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
              const err4 = {
                instancePath: instancePath + "/truncate",
                schemaPath: "#/properties/truncate/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          }
          if (data.paddingLeft !== void 0) {
            let data5 = data.paddingLeft;
            if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
              const err5 = {
                instancePath: instancePath + "/paddingLeft",
                schemaPath: "#/properties/paddingLeft/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          }
          if (data.paddingRight !== void 0) {
            let data6 = data.paddingRight;
            if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
              const err6 = {
                instancePath: instancePath + "/paddingRight",
                schemaPath: "#/properties/paddingRight/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          }
        } else {
          const err7 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        validate79.errors = vErrors;
        return errors === 0;
      }
      function validate84(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (typeof data !== "string") {
          const err0 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "string"
            },
            message: "must be string"
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (!(data === "top" || data === "middle" || data === "bottom")) {
          const err1 = {
            instancePath,
            schemaPath: "#/enum",
            keyword: "enum",
            params: {
              allowedValues: schema21.enum
            },
            message: "must be equal to one of the allowed values"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate84.errors = vErrors;
        return errors === 0;
      }
      function validate43(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        ;
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!(key0 === "border" || key0 === "header" || key0 === "columns" || key0 === "columnDefault" || key0 === "drawVerticalLine" || key0 === "drawHorizontalLine" || key0 === "singleLine" || key0 === "spanningCells")) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.border !== void 0) {
            if (!validate45(data.border, {
              instancePath: instancePath + "/border",
              parentData: data,
              parentDataProperty: "border",
              rootData
            })) {
              vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
              errors = vErrors.length;
            }
          }
          if (data.header !== void 0) {
            let data1 = data.header;
            if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
              if (data1.content === void 0) {
                const err1 = {
                  instancePath: instancePath + "/header",
                  schemaPath: "#/properties/header/required",
                  keyword: "required",
                  params: {
                    missingProperty: "content"
                  },
                  message: "must have required property 'content'"
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
              for (const key1 in data1) {
                if (!(key1 === "content" || key1 === "alignment" || key1 === "wrapWord" || key1 === "truncate" || key1 === "paddingLeft" || key1 === "paddingRight")) {
                  const err2 = {
                    instancePath: instancePath + "/header",
                    schemaPath: "#/properties/header/additionalProperties",
                    keyword: "additionalProperties",
                    params: {
                      additionalProperty: key1
                    },
                    message: "must NOT have additional properties"
                  };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              }
              if (data1.content !== void 0) {
                if (typeof data1.content !== "string") {
                  const err3 = {
                    instancePath: instancePath + "/header/content",
                    schemaPath: "#/properties/header/properties/content/type",
                    keyword: "type",
                    params: {
                      type: "string"
                    },
                    message: "must be string"
                  };
                  if (vErrors === null) {
                    vErrors = [err3];
                  } else {
                    vErrors.push(err3);
                  }
                  errors++;
                }
              }
              if (data1.alignment !== void 0) {
                if (!validate68(data1.alignment, {
                  instancePath: instancePath + "/header/alignment",
                  parentData: data1,
                  parentDataProperty: "alignment",
                  rootData
                })) {
                  vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
                  errors = vErrors.length;
                }
              }
              if (data1.wrapWord !== void 0) {
                if (typeof data1.wrapWord !== "boolean") {
                  const err4 = {
                    instancePath: instancePath + "/header/wrapWord",
                    schemaPath: "#/properties/header/properties/wrapWord/type",
                    keyword: "type",
                    params: {
                      type: "boolean"
                    },
                    message: "must be boolean"
                  };
                  if (vErrors === null) {
                    vErrors = [err4];
                  } else {
                    vErrors.push(err4);
                  }
                  errors++;
                }
              }
              if (data1.truncate !== void 0) {
                let data5 = data1.truncate;
                if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                  const err5 = {
                    instancePath: instancePath + "/header/truncate",
                    schemaPath: "#/properties/header/properties/truncate/type",
                    keyword: "type",
                    params: {
                      type: "integer"
                    },
                    message: "must be integer"
                  };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                }
              }
              if (data1.paddingLeft !== void 0) {
                let data6 = data1.paddingLeft;
                if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                  const err6 = {
                    instancePath: instancePath + "/header/paddingLeft",
                    schemaPath: "#/properties/header/properties/paddingLeft/type",
                    keyword: "type",
                    params: {
                      type: "integer"
                    },
                    message: "must be integer"
                  };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
              }
              if (data1.paddingRight !== void 0) {
                let data7 = data1.paddingRight;
                if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                  const err7 = {
                    instancePath: instancePath + "/header/paddingRight",
                    schemaPath: "#/properties/header/properties/paddingRight/type",
                    keyword: "type",
                    params: {
                      type: "integer"
                    },
                    message: "must be integer"
                  };
                  if (vErrors === null) {
                    vErrors = [err7];
                  } else {
                    vErrors.push(err7);
                  }
                  errors++;
                }
              }
            } else {
              const err8 = {
                instancePath: instancePath + "/header",
                schemaPath: "#/properties/header/type",
                keyword: "type",
                params: {
                  type: "object"
                },
                message: "must be object"
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          }
          if (data.columns !== void 0) {
            if (!validate70(data.columns, {
              instancePath: instancePath + "/columns",
              parentData: data,
              parentDataProperty: "columns",
              rootData
            })) {
              vErrors = vErrors === null ? validate70.errors : vErrors.concat(validate70.errors);
              errors = vErrors.length;
            }
          }
          if (data.columnDefault !== void 0) {
            if (!validate79(data.columnDefault, {
              instancePath: instancePath + "/columnDefault",
              parentData: data,
              parentDataProperty: "columnDefault",
              rootData
            })) {
              vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
              errors = vErrors.length;
            }
          }
          if (data.drawVerticalLine !== void 0) {
            if (typeof data.drawVerticalLine != "function") {
              const err9 = {
                instancePath: instancePath + "/drawVerticalLine",
                schemaPath: "#/properties/drawVerticalLine/typeof",
                keyword: "typeof",
                params: {},
                message: 'must pass "typeof" keyword validation'
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
          }
          if (data.drawHorizontalLine !== void 0) {
            if (typeof data.drawHorizontalLine != "function") {
              const err10 = {
                instancePath: instancePath + "/drawHorizontalLine",
                schemaPath: "#/properties/drawHorizontalLine/typeof",
                keyword: "typeof",
                params: {},
                message: 'must pass "typeof" keyword validation'
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          }
          if (data.singleLine !== void 0) {
            if (typeof data.singleLine != "boolean") {
              const err11 = {
                instancePath: instancePath + "/singleLine",
                schemaPath: "#/properties/singleLine/typeof",
                keyword: "typeof",
                params: {},
                message: 'must pass "typeof" keyword validation'
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          }
          if (data.spanningCells !== void 0) {
            let data13 = data.spanningCells;
            if (Array.isArray(data13)) {
              const len0 = data13.length;
              for (let i0 = 0; i0 < len0; i0++) {
                let data14 = data13[i0];
                if (data14 && typeof data14 == "object" && !Array.isArray(data14)) {
                  if (data14.row === void 0) {
                    const err12 = {
                      instancePath: instancePath + "/spanningCells/" + i0,
                      schemaPath: "#/properties/spanningCells/items/required",
                      keyword: "required",
                      params: {
                        missingProperty: "row"
                      },
                      message: "must have required property 'row'"
                    };
                    if (vErrors === null) {
                      vErrors = [err12];
                    } else {
                      vErrors.push(err12);
                    }
                    errors++;
                  }
                  if (data14.col === void 0) {
                    const err13 = {
                      instancePath: instancePath + "/spanningCells/" + i0,
                      schemaPath: "#/properties/spanningCells/items/required",
                      keyword: "required",
                      params: {
                        missingProperty: "col"
                      },
                      message: "must have required property 'col'"
                    };
                    if (vErrors === null) {
                      vErrors = [err13];
                    } else {
                      vErrors.push(err13);
                    }
                    errors++;
                  }
                  for (const key2 in data14) {
                    if (!func8.call(schema13.properties.spanningCells.items.properties, key2)) {
                      const err14 = {
                        instancePath: instancePath + "/spanningCells/" + i0,
                        schemaPath: "#/properties/spanningCells/items/additionalProperties",
                        keyword: "additionalProperties",
                        params: {
                          additionalProperty: key2
                        },
                        message: "must NOT have additional properties"
                      };
                      if (vErrors === null) {
                        vErrors = [err14];
                      } else {
                        vErrors.push(err14);
                      }
                      errors++;
                    }
                  }
                  if (data14.col !== void 0) {
                    let data15 = data14.col;
                    if (!(typeof data15 == "number" && (!(data15 % 1) && !isNaN(data15)) && isFinite(data15))) {
                      const err15 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/col",
                        schemaPath: "#/properties/spanningCells/items/properties/col/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err15];
                      } else {
                        vErrors.push(err15);
                      }
                      errors++;
                    }
                    if (typeof data15 == "number" && isFinite(data15)) {
                      if (data15 < 0 || isNaN(data15)) {
                        const err16 = {
                          instancePath: instancePath + "/spanningCells/" + i0 + "/col",
                          schemaPath: "#/properties/spanningCells/items/properties/col/minimum",
                          keyword: "minimum",
                          params: {
                            comparison: ">=",
                            limit: 0
                          },
                          message: "must be >= 0"
                        };
                        if (vErrors === null) {
                          vErrors = [err16];
                        } else {
                          vErrors.push(err16);
                        }
                        errors++;
                      }
                    }
                  }
                  if (data14.row !== void 0) {
                    let data16 = data14.row;
                    if (!(typeof data16 == "number" && (!(data16 % 1) && !isNaN(data16)) && isFinite(data16))) {
                      const err17 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/row",
                        schemaPath: "#/properties/spanningCells/items/properties/row/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                    }
                    if (typeof data16 == "number" && isFinite(data16)) {
                      if (data16 < 0 || isNaN(data16)) {
                        const err18 = {
                          instancePath: instancePath + "/spanningCells/" + i0 + "/row",
                          schemaPath: "#/properties/spanningCells/items/properties/row/minimum",
                          keyword: "minimum",
                          params: {
                            comparison: ">=",
                            limit: 0
                          },
                          message: "must be >= 0"
                        };
                        if (vErrors === null) {
                          vErrors = [err18];
                        } else {
                          vErrors.push(err18);
                        }
                        errors++;
                      }
                    }
                  }
                  if (data14.colSpan !== void 0) {
                    let data17 = data14.colSpan;
                    if (!(typeof data17 == "number" && (!(data17 % 1) && !isNaN(data17)) && isFinite(data17))) {
                      const err19 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/colSpan",
                        schemaPath: "#/properties/spanningCells/items/properties/colSpan/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                    }
                    if (typeof data17 == "number" && isFinite(data17)) {
                      if (data17 < 1 || isNaN(data17)) {
                        const err20 = {
                          instancePath: instancePath + "/spanningCells/" + i0 + "/colSpan",
                          schemaPath: "#/properties/spanningCells/items/properties/colSpan/minimum",
                          keyword: "minimum",
                          params: {
                            comparison: ">=",
                            limit: 1
                          },
                          message: "must be >= 1"
                        };
                        if (vErrors === null) {
                          vErrors = [err20];
                        } else {
                          vErrors.push(err20);
                        }
                        errors++;
                      }
                    }
                  }
                  if (data14.rowSpan !== void 0) {
                    let data18 = data14.rowSpan;
                    if (!(typeof data18 == "number" && (!(data18 % 1) && !isNaN(data18)) && isFinite(data18))) {
                      const err21 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/rowSpan",
                        schemaPath: "#/properties/spanningCells/items/properties/rowSpan/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err21];
                      } else {
                        vErrors.push(err21);
                      }
                      errors++;
                    }
                    if (typeof data18 == "number" && isFinite(data18)) {
                      if (data18 < 1 || isNaN(data18)) {
                        const err22 = {
                          instancePath: instancePath + "/spanningCells/" + i0 + "/rowSpan",
                          schemaPath: "#/properties/spanningCells/items/properties/rowSpan/minimum",
                          keyword: "minimum",
                          params: {
                            comparison: ">=",
                            limit: 1
                          },
                          message: "must be >= 1"
                        };
                        if (vErrors === null) {
                          vErrors = [err22];
                        } else {
                          vErrors.push(err22);
                        }
                        errors++;
                      }
                    }
                  }
                  if (data14.alignment !== void 0) {
                    if (!validate68(data14.alignment, {
                      instancePath: instancePath + "/spanningCells/" + i0 + "/alignment",
                      parentData: data14,
                      parentDataProperty: "alignment",
                      rootData
                    })) {
                      vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
                      errors = vErrors.length;
                    }
                  }
                  if (data14.verticalAlignment !== void 0) {
                    if (!validate84(data14.verticalAlignment, {
                      instancePath: instancePath + "/spanningCells/" + i0 + "/verticalAlignment",
                      parentData: data14,
                      parentDataProperty: "verticalAlignment",
                      rootData
                    })) {
                      vErrors = vErrors === null ? validate84.errors : vErrors.concat(validate84.errors);
                      errors = vErrors.length;
                    }
                  }
                  if (data14.wrapWord !== void 0) {
                    if (typeof data14.wrapWord !== "boolean") {
                      const err23 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/wrapWord",
                        schemaPath: "#/properties/spanningCells/items/properties/wrapWord/type",
                        keyword: "type",
                        params: {
                          type: "boolean"
                        },
                        message: "must be boolean"
                      };
                      if (vErrors === null) {
                        vErrors = [err23];
                      } else {
                        vErrors.push(err23);
                      }
                      errors++;
                    }
                  }
                  if (data14.truncate !== void 0) {
                    let data22 = data14.truncate;
                    if (!(typeof data22 == "number" && (!(data22 % 1) && !isNaN(data22)) && isFinite(data22))) {
                      const err24 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/truncate",
                        schemaPath: "#/properties/spanningCells/items/properties/truncate/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err24];
                      } else {
                        vErrors.push(err24);
                      }
                      errors++;
                    }
                  }
                  if (data14.paddingLeft !== void 0) {
                    let data23 = data14.paddingLeft;
                    if (!(typeof data23 == "number" && (!(data23 % 1) && !isNaN(data23)) && isFinite(data23))) {
                      const err25 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/paddingLeft",
                        schemaPath: "#/properties/spanningCells/items/properties/paddingLeft/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err25];
                      } else {
                        vErrors.push(err25);
                      }
                      errors++;
                    }
                  }
                  if (data14.paddingRight !== void 0) {
                    let data24 = data14.paddingRight;
                    if (!(typeof data24 == "number" && (!(data24 % 1) && !isNaN(data24)) && isFinite(data24))) {
                      const err26 = {
                        instancePath: instancePath + "/spanningCells/" + i0 + "/paddingRight",
                        schemaPath: "#/properties/spanningCells/items/properties/paddingRight/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err26];
                      } else {
                        vErrors.push(err26);
                      }
                      errors++;
                    }
                  }
                } else {
                  const err27 = {
                    instancePath: instancePath + "/spanningCells/" + i0,
                    schemaPath: "#/properties/spanningCells/items/type",
                    keyword: "type",
                    params: {
                      type: "object"
                    },
                    message: "must be object"
                  };
                  if (vErrors === null) {
                    vErrors = [err27];
                  } else {
                    vErrors.push(err27);
                  }
                  errors++;
                }
              }
            } else {
              const err28 = {
                instancePath: instancePath + "/spanningCells",
                schemaPath: "#/properties/spanningCells/type",
                keyword: "type",
                params: {
                  type: "array"
                },
                message: "must be array"
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          }
        } else {
          const err29 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err29];
          } else {
            vErrors.push(err29);
          }
          errors++;
        }
        validate43.errors = vErrors;
        return errors === 0;
      }
      exports2["streamConfig.json"] = validate86;
      function validate87(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!func8.call(schema15.properties, key0)) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.topBody !== void 0) {
            if (!validate46(data.topBody, {
              instancePath: instancePath + "/topBody",
              parentData: data,
              parentDataProperty: "topBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topJoin !== void 0) {
            if (!validate46(data.topJoin, {
              instancePath: instancePath + "/topJoin",
              parentData: data,
              parentDataProperty: "topJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topLeft !== void 0) {
            if (!validate46(data.topLeft, {
              instancePath: instancePath + "/topLeft",
              parentData: data,
              parentDataProperty: "topLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.topRight !== void 0) {
            if (!validate46(data.topRight, {
              instancePath: instancePath + "/topRight",
              parentData: data,
              parentDataProperty: "topRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomBody !== void 0) {
            if (!validate46(data.bottomBody, {
              instancePath: instancePath + "/bottomBody",
              parentData: data,
              parentDataProperty: "bottomBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomJoin !== void 0) {
            if (!validate46(data.bottomJoin, {
              instancePath: instancePath + "/bottomJoin",
              parentData: data,
              parentDataProperty: "bottomJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomLeft !== void 0) {
            if (!validate46(data.bottomLeft, {
              instancePath: instancePath + "/bottomLeft",
              parentData: data,
              parentDataProperty: "bottomLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bottomRight !== void 0) {
            if (!validate46(data.bottomRight, {
              instancePath: instancePath + "/bottomRight",
              parentData: data,
              parentDataProperty: "bottomRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyLeft !== void 0) {
            if (!validate46(data.bodyLeft, {
              instancePath: instancePath + "/bodyLeft",
              parentData: data,
              parentDataProperty: "bodyLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyRight !== void 0) {
            if (!validate46(data.bodyRight, {
              instancePath: instancePath + "/bodyRight",
              parentData: data,
              parentDataProperty: "bodyRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.bodyJoin !== void 0) {
            if (!validate46(data.bodyJoin, {
              instancePath: instancePath + "/bodyJoin",
              parentData: data,
              parentDataProperty: "bodyJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.headerJoin !== void 0) {
            if (!validate46(data.headerJoin, {
              instancePath: instancePath + "/headerJoin",
              parentData: data,
              parentDataProperty: "headerJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinBody !== void 0) {
            if (!validate46(data.joinBody, {
              instancePath: instancePath + "/joinBody",
              parentData: data,
              parentDataProperty: "joinBody",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinLeft !== void 0) {
            if (!validate46(data.joinLeft, {
              instancePath: instancePath + "/joinLeft",
              parentData: data,
              parentDataProperty: "joinLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinRight !== void 0) {
            if (!validate46(data.joinRight, {
              instancePath: instancePath + "/joinRight",
              parentData: data,
              parentDataProperty: "joinRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinJoin !== void 0) {
            if (!validate46(data.joinJoin, {
              instancePath: instancePath + "/joinJoin",
              parentData: data,
              parentDataProperty: "joinJoin",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleUp !== void 0) {
            if (!validate46(data.joinMiddleUp, {
              instancePath: instancePath + "/joinMiddleUp",
              parentData: data,
              parentDataProperty: "joinMiddleUp",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleDown !== void 0) {
            if (!validate46(data.joinMiddleDown, {
              instancePath: instancePath + "/joinMiddleDown",
              parentData: data,
              parentDataProperty: "joinMiddleDown",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleLeft !== void 0) {
            if (!validate46(data.joinMiddleLeft, {
              instancePath: instancePath + "/joinMiddleLeft",
              parentData: data,
              parentDataProperty: "joinMiddleLeft",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
          if (data.joinMiddleRight !== void 0) {
            if (!validate46(data.joinMiddleRight, {
              instancePath: instancePath + "/joinMiddleRight",
              parentData: data,
              parentDataProperty: "joinMiddleRight",
              rootData
            })) {
              vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
              errors = vErrors.length;
            }
          }
        } else {
          const err1 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        validate87.errors = vErrors;
        return errors === 0;
      }
      function validate109(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        const _errs0 = errors;
        let valid0 = false;
        let passing0 = null;
        const _errs1 = errors;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!pattern0.test(key0)) {
              const err0 = {
                instancePath,
                schemaPath: "#/oneOf/0/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          for (const key1 in data) {
            if (pattern0.test(key1)) {
              if (!validate71(data[key1], {
                instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),
                parentData: data,
                parentDataProperty: key1,
                rootData
              })) {
                vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
                errors = vErrors.length;
              }
            }
          }
        } else {
          const err1 = {
            instancePath,
            schemaPath: "#/oneOf/0/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        var _valid0 = _errs1 === errors;
        if (_valid0) {
          valid0 = true;
          passing0 = 0;
        }
        const _errs5 = errors;
        if (Array.isArray(data)) {
          const len0 = data.length;
          for (let i0 = 0; i0 < len0; i0++) {
            if (!validate71(data[i0], {
              instancePath: instancePath + "/" + i0,
              parentData: data,
              parentDataProperty: i0,
              rootData
            })) {
              vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
              errors = vErrors.length;
            }
          }
        } else {
          const err2 = {
            instancePath,
            schemaPath: "#/oneOf/1/type",
            keyword: "type",
            params: {
              type: "array"
            },
            message: "must be array"
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 1];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 1;
          }
        }
        if (!valid0) {
          const err3 = {
            instancePath,
            schemaPath: "#/oneOf",
            keyword: "oneOf",
            params: {
              passingSchemas: passing0
            },
            message: "must match exactly one schema in oneOf"
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        } else {
          errors = _errs0;
          if (vErrors !== null) {
            if (_errs0) {
              vErrors.length = _errs0;
            } else {
              vErrors = null;
            }
          }
        }
        validate109.errors = vErrors;
        return errors === 0;
      }
      function validate113(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          for (const key0 in data) {
            if (!(key0 === "alignment" || key0 === "verticalAlignment" || key0 === "width" || key0 === "wrapWord" || key0 === "truncate" || key0 === "paddingLeft" || key0 === "paddingRight")) {
              const err0 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
          }
          if (data.alignment !== void 0) {
            if (!validate72(data.alignment, {
              instancePath: instancePath + "/alignment",
              parentData: data,
              parentDataProperty: "alignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate72.errors : vErrors.concat(validate72.errors);
              errors = vErrors.length;
            }
          }
          if (data.verticalAlignment !== void 0) {
            if (!validate74(data.verticalAlignment, {
              instancePath: instancePath + "/verticalAlignment",
              parentData: data,
              parentDataProperty: "verticalAlignment",
              rootData
            })) {
              vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
              errors = vErrors.length;
            }
          }
          if (data.width !== void 0) {
            let data2 = data.width;
            if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
              const err1 = {
                instancePath: instancePath + "/width",
                schemaPath: "#/properties/width/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
            if (typeof data2 == "number" && isFinite(data2)) {
              if (data2 < 1 || isNaN(data2)) {
                const err2 = {
                  instancePath: instancePath + "/width",
                  schemaPath: "#/properties/width/minimum",
                  keyword: "minimum",
                  params: {
                    comparison: ">=",
                    limit: 1
                  },
                  message: "must be >= 1"
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
          }
          if (data.wrapWord !== void 0) {
            if (typeof data.wrapWord !== "boolean") {
              const err3 = {
                instancePath: instancePath + "/wrapWord",
                schemaPath: "#/properties/wrapWord/type",
                keyword: "type",
                params: {
                  type: "boolean"
                },
                message: "must be boolean"
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          }
          if (data.truncate !== void 0) {
            let data4 = data.truncate;
            if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
              const err4 = {
                instancePath: instancePath + "/truncate",
                schemaPath: "#/properties/truncate/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          }
          if (data.paddingLeft !== void 0) {
            let data5 = data.paddingLeft;
            if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
              const err5 = {
                instancePath: instancePath + "/paddingLeft",
                schemaPath: "#/properties/paddingLeft/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          }
          if (data.paddingRight !== void 0) {
            let data6 = data.paddingRight;
            if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
              const err6 = {
                instancePath: instancePath + "/paddingRight",
                schemaPath: "#/properties/paddingRight/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          }
        } else {
          const err7 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        validate113.errors = vErrors;
        return errors === 0;
      }
      function validate86(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
        ;
        let vErrors = null;
        let errors = 0;
        if (data && typeof data == "object" && !Array.isArray(data)) {
          if (data.columnDefault === void 0) {
            const err0 = {
              instancePath,
              schemaPath: "#/required",
              keyword: "required",
              params: {
                missingProperty: "columnDefault"
              },
              message: "must have required property 'columnDefault'"
            };
            if (vErrors === null) {
              vErrors = [err0];
            } else {
              vErrors.push(err0);
            }
            errors++;
          }
          if (data.columnCount === void 0) {
            const err1 = {
              instancePath,
              schemaPath: "#/required",
              keyword: "required",
              params: {
                missingProperty: "columnCount"
              },
              message: "must have required property 'columnCount'"
            };
            if (vErrors === null) {
              vErrors = [err1];
            } else {
              vErrors.push(err1);
            }
            errors++;
          }
          for (const key0 in data) {
            if (!(key0 === "border" || key0 === "columns" || key0 === "columnDefault" || key0 === "columnCount" || key0 === "drawVerticalLine")) {
              const err2 = {
                instancePath,
                schemaPath: "#/additionalProperties",
                keyword: "additionalProperties",
                params: {
                  additionalProperty: key0
                },
                message: "must NOT have additional properties"
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
          }
          if (data.border !== void 0) {
            if (!validate87(data.border, {
              instancePath: instancePath + "/border",
              parentData: data,
              parentDataProperty: "border",
              rootData
            })) {
              vErrors = vErrors === null ? validate87.errors : vErrors.concat(validate87.errors);
              errors = vErrors.length;
            }
          }
          if (data.columns !== void 0) {
            if (!validate109(data.columns, {
              instancePath: instancePath + "/columns",
              parentData: data,
              parentDataProperty: "columns",
              rootData
            })) {
              vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
              errors = vErrors.length;
            }
          }
          if (data.columnDefault !== void 0) {
            if (!validate113(data.columnDefault, {
              instancePath: instancePath + "/columnDefault",
              parentData: data,
              parentDataProperty: "columnDefault",
              rootData
            })) {
              vErrors = vErrors === null ? validate113.errors : vErrors.concat(validate113.errors);
              errors = vErrors.length;
            }
          }
          if (data.columnCount !== void 0) {
            let data3 = data.columnCount;
            if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
              const err3 = {
                instancePath: instancePath + "/columnCount",
                schemaPath: "#/properties/columnCount/type",
                keyword: "type",
                params: {
                  type: "integer"
                },
                message: "must be integer"
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (typeof data3 == "number" && isFinite(data3)) {
              if (data3 < 1 || isNaN(data3)) {
                const err4 = {
                  instancePath: instancePath + "/columnCount",
                  schemaPath: "#/properties/columnCount/minimum",
                  keyword: "minimum",
                  params: {
                    comparison: ">=",
                    limit: 1
                  },
                  message: "must be >= 1"
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
          }
          if (data.drawVerticalLine !== void 0) {
            if (typeof data.drawVerticalLine != "function") {
              const err5 = {
                instancePath: instancePath + "/drawVerticalLine",
                schemaPath: "#/properties/drawVerticalLine/typeof",
                keyword: "typeof",
                params: {},
                message: 'must pass "typeof" keyword validation'
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          }
        } else {
          const err6 = {
            instancePath,
            schemaPath: "#/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        validate86.errors = vErrors;
        return errors === 0;
      }
    }
  });

  // node_modules/table/dist/src/validateConfig.js
  var require_validateConfig = __commonJS({
    "node_modules/table/dist/src/validateConfig.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.validateConfig = void 0;
      var validators_1 = __importDefault(require_validators());
      var validateConfig = (schemaId, config) => {
        const validate = validators_1.default[schemaId];
        if (!validate(config) && validate.errors) {
          const errors = validate.errors.map((error) => {
            return {
              message: error.message,
              params: error.params,
              schemaPath: error.schemaPath
            };
          });
          console.log("config", config);
          console.log("errors", errors);
          throw new Error("Invalid config.");
        }
      };
      exports2.validateConfig = validateConfig;
    }
  });

  // node_modules/table/dist/src/makeStreamConfig.js
  var require_makeStreamConfig = __commonJS({
    "node_modules/table/dist/src/makeStreamConfig.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.makeStreamConfig = void 0;
      var utils_1 = require_utils();
      var validateConfig_1 = require_validateConfig();
      var makeColumnsConfig = (columnCount, columns = {}, columnDefault) => {
        return Array.from({ length: columnCount }).map((_, index) => {
          return {
            alignment: "left",
            paddingLeft: 1,
            paddingRight: 1,
            truncate: Number.POSITIVE_INFINITY,
            verticalAlignment: "top",
            wrapWord: false,
            ...columnDefault,
            ...columns[index]
          };
        });
      };
      var makeStreamConfig = (config) => {
        (0, validateConfig_1.validateConfig)("streamConfig.json", config);
        if (config.columnDefault.width === void 0) {
          throw new Error("Must provide config.columnDefault.width when creating a stream.");
        }
        return {
          drawVerticalLine: () => {
            return true;
          },
          ...config,
          border: (0, utils_1.makeBorderConfig)(config.border),
          columns: makeColumnsConfig(config.columnCount, config.columns, config.columnDefault)
        };
      };
      exports2.makeStreamConfig = makeStreamConfig;
    }
  });

  // node_modules/table/dist/src/mapDataUsingRowHeights.js
  var require_mapDataUsingRowHeights = __commonJS({
    "node_modules/table/dist/src/mapDataUsingRowHeights.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.mapDataUsingRowHeights = exports2.padCellVertically = void 0;
      var utils_1 = require_utils();
      var wrapCell_1 = require_wrapCell();
      var createEmptyStrings = (length) => {
        return new Array(length).fill("");
      };
      var padCellVertically = (lines, rowHeight, verticalAlignment) => {
        const availableLines = rowHeight - lines.length;
        if (verticalAlignment === "top") {
          return [...lines, ...createEmptyStrings(availableLines)];
        }
        if (verticalAlignment === "bottom") {
          return [...createEmptyStrings(availableLines), ...lines];
        }
        return [
          ...createEmptyStrings(Math.floor(availableLines / 2)),
          ...lines,
          ...createEmptyStrings(Math.ceil(availableLines / 2))
        ];
      };
      exports2.padCellVertically = padCellVertically;
      var mapDataUsingRowHeights = (unmappedRows, rowHeights, config) => {
        const nColumns = unmappedRows[0].length;
        const mappedRows = unmappedRows.map((unmappedRow, unmappedRowIndex) => {
          const outputRowHeight = rowHeights[unmappedRowIndex];
          const outputRow = Array.from({ length: outputRowHeight }, () => {
            return new Array(nColumns).fill("");
          });
          unmappedRow.forEach((cell, cellIndex) => {
            var _a;
            const containingRange = (_a = config.spanningCellManager) === null || _a === void 0 ? void 0 : _a.getContainingRange({
              col: cellIndex,
              row: unmappedRowIndex
            });
            if (containingRange) {
              containingRange.extractCellContent(unmappedRowIndex).forEach((cellLine, cellLineIndex) => {
                outputRow[cellLineIndex][cellIndex] = cellLine;
              });
              return;
            }
            const cellLines = (0, wrapCell_1.wrapCell)(cell, config.columns[cellIndex].width, config.columns[cellIndex].wrapWord);
            const paddedCellLines = (0, exports2.padCellVertically)(cellLines, outputRowHeight, config.columns[cellIndex].verticalAlignment);
            paddedCellLines.forEach((cellLine, cellLineIndex) => {
              outputRow[cellLineIndex][cellIndex] = cellLine;
            });
          });
          return outputRow;
        });
        return (0, utils_1.flatten)(mappedRows);
      };
      exports2.mapDataUsingRowHeights = mapDataUsingRowHeights;
    }
  });

  // node_modules/table/dist/src/padTableData.js
  var require_padTableData = __commonJS({
    "node_modules/table/dist/src/padTableData.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.padTableData = exports2.padString = void 0;
      var padString = (input, paddingLeft, paddingRight) => {
        return " ".repeat(paddingLeft) + input + " ".repeat(paddingRight);
      };
      exports2.padString = padString;
      var padTableData = (rows, config) => {
        return rows.map((cells, rowIndex) => {
          return cells.map((cell, cellIndex) => {
            var _a;
            const containingRange = (_a = config.spanningCellManager) === null || _a === void 0 ? void 0 : _a.getContainingRange({
              col: cellIndex,
              row: rowIndex
            }, { mapped: true });
            if (containingRange) {
              return cell;
            }
            const { paddingLeft, paddingRight } = config.columns[cellIndex];
            return (0, exports2.padString)(cell, paddingLeft, paddingRight);
          });
        });
      };
      exports2.padTableData = padTableData;
    }
  });

  // node_modules/table/dist/src/stringifyTableData.js
  var require_stringifyTableData = __commonJS({
    "node_modules/table/dist/src/stringifyTableData.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.stringifyTableData = void 0;
      var utils_1 = require_utils();
      var stringifyTableData = (rows) => {
        return rows.map((cells) => {
          return cells.map((cell) => {
            return (0, utils_1.normalizeString)(String(cell));
          });
        });
      };
      exports2.stringifyTableData = stringifyTableData;
    }
  });

  // node_modules/lodash.truncate/index.js
  var require_lodash = __commonJS({
    "node_modules/lodash.truncate/index.js"(exports2, module2) {
      var DEFAULT_TRUNC_LENGTH = 30;
      var DEFAULT_TRUNC_OMISSION = "...";
      var INFINITY = 1 / 0;
      var MAX_INTEGER = 17976931348623157e292;
      var NAN = 0 / 0;
      var regexpTag = "[object RegExp]";
      var symbolTag = "[object Symbol]";
      var reTrim = /^\s+|\s+$/g;
      var reFlags = /\w*$/;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsOctal = /^0o[0-7]+$/i;
      var rsAstralRange = "\\ud800-\\udfff";
      var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
      var rsComboSymbolsRange = "\\u20d0-\\u20f0";
      var rsVarRange = "\\ufe0e\\ufe0f";
      var rsAstral = "[" + rsAstralRange + "]";
      var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
      var rsFitz = "\\ud83c[\\udffb-\\udfff]";
      var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
      var rsNonAstral = "[^" + rsAstralRange + "]";
      var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
      var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
      var rsZWJ = "\\u200d";
      var reOptMod = rsModifier + "?";
      var rsOptVar = "[" + rsVarRange + "]?";
      var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
      var rsSeq = rsOptVar + reOptMod + rsOptJoin;
      var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
      var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
      var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
      var freeParseInt = parseInt;
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var freeExports = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
      var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var freeProcess = moduleExports && freeGlobal.process;
      var nodeUtil = function() {
        try {
          return freeProcess && freeProcess.binding("util");
        } catch (e) {
        }
      }();
      var nodeIsRegExp = nodeUtil && nodeUtil.isRegExp;
      var asciiSize = baseProperty("length");
      function asciiToArray(string) {
        return string.split("");
      }
      function baseProperty(key) {
        return function(object) {
          return object == null ? void 0 : object[key];
        };
      }
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }
      function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
      }
      function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
      }
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          result++;
        }
        return result;
      }
      function unicodeToArray(string) {
        return string.match(reUnicode) || [];
      }
      var objectProto = Object.prototype;
      var objectToString = objectProto.toString;
      var Symbol2 = root.Symbol;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseIsRegExp(value) {
        return isObject(value) && objectToString.call(value) == regexpTag;
      }
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result = Array(length);
        while (++index < length) {
          result[index] = array[index + start];
        }
        return result;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === void 0 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      function isObject(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result = toFinite(value), remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === void 0) {
          return result + omission;
        }
        if (strSymbols) {
          end += result.length - end;
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result;
            if (!separator.global) {
              separator = RegExp(separator.source, toString(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result = result.slice(0, newEnd === void 0 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result.lastIndexOf(separator);
          if (index > -1) {
            result = result.slice(0, index);
          }
        }
        return result + omission;
      }
      module2.exports = truncate;
    }
  });

  // node_modules/table/dist/src/truncateTableData.js
  var require_truncateTableData = __commonJS({
    "node_modules/table/dist/src/truncateTableData.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.truncateTableData = exports2.truncateString = void 0;
      var lodash_truncate_1 = __importDefault(require_lodash());
      var truncateString = (input, length) => {
        return (0, lodash_truncate_1.default)(input, {
          length,
          omission: "\u2026"
        });
      };
      exports2.truncateString = truncateString;
      var truncateTableData = (rows, truncates) => {
        return rows.map((cells) => {
          return cells.map((cell, cellIndex) => {
            return (0, exports2.truncateString)(cell, truncates[cellIndex]);
          });
        });
      };
      exports2.truncateTableData = truncateTableData;
    }
  });

  // node_modules/table/dist/src/createStream.js
  var require_createStream = __commonJS({
    "node_modules/table/dist/src/createStream.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.createStream = void 0;
      var alignTableData_1 = require_alignTableData();
      var calculateRowHeights_1 = require_calculateRowHeights();
      var drawBorder_1 = require_drawBorder();
      var drawRow_1 = require_drawRow();
      var makeStreamConfig_1 = require_makeStreamConfig();
      var mapDataUsingRowHeights_1 = require_mapDataUsingRowHeights();
      var padTableData_1 = require_padTableData();
      var stringifyTableData_1 = require_stringifyTableData();
      var truncateTableData_1 = require_truncateTableData();
      var utils_1 = require_utils();
      var prepareData = (data, config) => {
        let rows = (0, stringifyTableData_1.stringifyTableData)(data);
        rows = (0, truncateTableData_1.truncateTableData)(rows, (0, utils_1.extractTruncates)(config));
        const rowHeights = (0, calculateRowHeights_1.calculateRowHeights)(rows, config);
        rows = (0, mapDataUsingRowHeights_1.mapDataUsingRowHeights)(rows, rowHeights, config);
        rows = (0, alignTableData_1.alignTableData)(rows, config);
        rows = (0, padTableData_1.padTableData)(rows, config);
        return rows;
      };
      var create = (row, columnWidths, config) => {
        const rows = prepareData([row], config);
        const body = rows.map((literalRow) => {
          return (0, drawRow_1.drawRow)(literalRow, config);
        }).join("");
        let output;
        output = "";
        output += (0, drawBorder_1.drawBorderTop)(columnWidths, config);
        output += body;
        output += (0, drawBorder_1.drawBorderBottom)(columnWidths, config);
        output = output.trimEnd();
        process.stdout.write(output);
      };
      var append = (row, columnWidths, config) => {
        const rows = prepareData([row], config);
        const body = rows.map((literalRow) => {
          return (0, drawRow_1.drawRow)(literalRow, config);
        }).join("");
        let output = "";
        const bottom = (0, drawBorder_1.drawBorderBottom)(columnWidths, config);
        if (bottom !== "\n") {
          output = "\r\x1B[K";
        }
        output += (0, drawBorder_1.drawBorderJoin)(columnWidths, config);
        output += body;
        output += bottom;
        output = output.trimEnd();
        process.stdout.write(output);
      };
      var createStream = (userConfig) => {
        const config = (0, makeStreamConfig_1.makeStreamConfig)(userConfig);
        const columnWidths = Object.values(config.columns).map((column) => {
          return column.width + column.paddingLeft + column.paddingRight;
        });
        let empty = true;
        return {
          write: (row) => {
            if (row.length !== config.columnCount) {
              throw new Error("Row cell count does not match the config.columnCount.");
            }
            if (empty) {
              empty = false;
              create(row, columnWidths, config);
            } else {
              append(row, columnWidths, config);
            }
          }
        };
      };
      exports2.createStream = createStream;
    }
  });

  // node_modules/table/dist/src/calculateOutputColumnWidths.js
  var require_calculateOutputColumnWidths = __commonJS({
    "node_modules/table/dist/src/calculateOutputColumnWidths.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.calculateOutputColumnWidths = void 0;
      var calculateOutputColumnWidths = (config) => {
        return config.columns.map((col) => {
          return col.paddingLeft + col.width + col.paddingRight;
        });
      };
      exports2.calculateOutputColumnWidths = calculateOutputColumnWidths;
    }
  });

  // node_modules/table/dist/src/drawTable.js
  var require_drawTable = __commonJS({
    "node_modules/table/dist/src/drawTable.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.drawTable = void 0;
      var drawBorder_1 = require_drawBorder();
      var drawContent_1 = require_drawContent();
      var drawRow_1 = require_drawRow();
      var utils_1 = require_utils();
      var drawTable = (rows, outputColumnWidths, rowHeights, config) => {
        const { drawHorizontalLine, singleLine } = config;
        const contents = (0, utils_1.groupBySizes)(rows, rowHeights).map((group, groupIndex) => {
          return group.map((row) => {
            return (0, drawRow_1.drawRow)(row, {
              ...config,
              rowIndex: groupIndex
            });
          }).join("");
        });
        return (0, drawContent_1.drawContent)({
          contents,
          drawSeparator: (index, size) => {
            if (index === 0 || index === size) {
              return drawHorizontalLine(index, size);
            }
            return !singleLine && drawHorizontalLine(index, size);
          },
          elementType: "row",
          rowIndex: -1,
          separatorGetter: (0, drawBorder_1.createTableBorderGetter)(outputColumnWidths, {
            ...config,
            rowCount: contents.length
          }),
          spanningCellManager: config.spanningCellManager
        });
      };
      exports2.drawTable = drawTable;
    }
  });

  // node_modules/table/dist/src/injectHeaderConfig.js
  var require_injectHeaderConfig = __commonJS({
    "node_modules/table/dist/src/injectHeaderConfig.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.injectHeaderConfig = void 0;
      var injectHeaderConfig = (rows, config) => {
        var _a;
        let spanningCellConfig = (_a = config.spanningCells) !== null && _a !== void 0 ? _a : [];
        const headerConfig = config.header;
        const adjustedRows = [...rows];
        if (headerConfig) {
          spanningCellConfig = spanningCellConfig.map(({ row, ...rest }) => {
            return {
              ...rest,
              row: row + 1
            };
          });
          const { content, ...headerStyles } = headerConfig;
          spanningCellConfig.unshift({
            alignment: "center",
            col: 0,
            colSpan: rows[0].length,
            paddingLeft: 1,
            paddingRight: 1,
            row: 0,
            wrapWord: false,
            ...headerStyles
          });
          adjustedRows.unshift([content, ...Array.from({ length: rows[0].length - 1 }).fill("")]);
        }
        return [
          adjustedRows,
          spanningCellConfig
        ];
      };
      exports2.injectHeaderConfig = injectHeaderConfig;
    }
  });

  // node_modules/table/dist/src/calculateMaximumColumnWidths.js
  var require_calculateMaximumColumnWidths = __commonJS({
    "node_modules/table/dist/src/calculateMaximumColumnWidths.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.calculateMaximumColumnWidths = exports2.calculateMaximumCellWidth = void 0;
      var string_width_1 = __importDefault(require_string_width());
      var utils_1 = require_utils();
      var calculateMaximumCellWidth = (cell) => {
        return Math.max(...cell.split("\n").map(string_width_1.default));
      };
      exports2.calculateMaximumCellWidth = calculateMaximumCellWidth;
      var calculateMaximumColumnWidths = (rows, spanningCellConfigs = []) => {
        const columnWidths = new Array(rows[0].length).fill(0);
        const rangeCoordinates = spanningCellConfigs.map(utils_1.calculateRangeCoordinate);
        const isSpanningCell = (rowIndex, columnIndex) => {
          return rangeCoordinates.some((rangeCoordinate) => {
            return (0, utils_1.isCellInRange)({
              col: columnIndex,
              row: rowIndex
            }, rangeCoordinate);
          });
        };
        rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (isSpanningCell(rowIndex, cellIndex)) {
              return;
            }
            columnWidths[cellIndex] = Math.max(columnWidths[cellIndex], (0, exports2.calculateMaximumCellWidth)(cell));
          });
        });
        return columnWidths;
      };
      exports2.calculateMaximumColumnWidths = calculateMaximumColumnWidths;
    }
  });

  // node_modules/table/dist/src/alignSpanningCell.js
  var require_alignSpanningCell = __commonJS({
    "node_modules/table/dist/src/alignSpanningCell.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.alignVerticalRangeContent = exports2.wrapRangeContent = void 0;
      var string_width_1 = __importDefault(require_string_width());
      var alignString_1 = require_alignString();
      var mapDataUsingRowHeights_1 = require_mapDataUsingRowHeights();
      var padTableData_1 = require_padTableData();
      var truncateTableData_1 = require_truncateTableData();
      var utils_1 = require_utils();
      var wrapCell_1 = require_wrapCell();
      var wrapRangeContent = (rangeConfig, rangeWidth, context) => {
        const { topLeft, paddingRight, paddingLeft, truncate, wrapWord, alignment } = rangeConfig;
        const originalContent = context.rows[topLeft.row][topLeft.col];
        const contentWidth = rangeWidth - paddingLeft - paddingRight;
        return (0, wrapCell_1.wrapCell)((0, truncateTableData_1.truncateString)(originalContent, truncate), contentWidth, wrapWord).map((line) => {
          const alignedLine = (0, alignString_1.alignString)(line, contentWidth, alignment);
          return (0, padTableData_1.padString)(alignedLine, paddingLeft, paddingRight);
        });
      };
      exports2.wrapRangeContent = wrapRangeContent;
      var alignVerticalRangeContent = (range, content, context) => {
        const { rows, drawHorizontalLine, rowHeights } = context;
        const { topLeft, bottomRight, verticalAlignment } = range;
        if (rowHeights.length === 0) {
          return [];
        }
        const totalCellHeight = (0, utils_1.sumArray)(rowHeights.slice(topLeft.row, bottomRight.row + 1));
        const totalBorderHeight = bottomRight.row - topLeft.row;
        const hiddenHorizontalBorderCount = (0, utils_1.sequence)(topLeft.row + 1, bottomRight.row).filter((horizontalBorderIndex) => {
          return !drawHorizontalLine(horizontalBorderIndex, rows.length);
        }).length;
        const availableRangeHeight = totalCellHeight + totalBorderHeight - hiddenHorizontalBorderCount;
        return (0, mapDataUsingRowHeights_1.padCellVertically)(content, availableRangeHeight, verticalAlignment).map((line) => {
          if (line.length === 0) {
            return " ".repeat((0, string_width_1.default)(content[0]));
          }
          return line;
        });
      };
      exports2.alignVerticalRangeContent = alignVerticalRangeContent;
    }
  });

  // node_modules/table/dist/src/calculateSpanningCellWidth.js
  var require_calculateSpanningCellWidth = __commonJS({
    "node_modules/table/dist/src/calculateSpanningCellWidth.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.calculateSpanningCellWidth = void 0;
      var utils_1 = require_utils();
      var calculateSpanningCellWidth = (rangeConfig, dependencies) => {
        const { columnsConfig, drawVerticalLine } = dependencies;
        const { topLeft, bottomRight } = rangeConfig;
        const totalWidth = (0, utils_1.sumArray)(columnsConfig.slice(topLeft.col, bottomRight.col + 1).map(({ width }) => {
          return width;
        }));
        const totalPadding = topLeft.col === bottomRight.col ? columnsConfig[topLeft.col].paddingRight + columnsConfig[bottomRight.col].paddingLeft : (0, utils_1.sumArray)(columnsConfig.slice(topLeft.col, bottomRight.col + 1).map(({ paddingLeft, paddingRight }) => {
          return paddingLeft + paddingRight;
        }));
        const totalBorderWidths = bottomRight.col - topLeft.col;
        const totalHiddenVerticalBorders = (0, utils_1.sequence)(topLeft.col + 1, bottomRight.col).filter((verticalBorderIndex) => {
          return !drawVerticalLine(verticalBorderIndex, columnsConfig.length);
        }).length;
        return totalWidth + totalPadding + totalBorderWidths - totalHiddenVerticalBorders;
      };
      exports2.calculateSpanningCellWidth = calculateSpanningCellWidth;
    }
  });

  // node_modules/table/dist/src/makeRangeConfig.js
  var require_makeRangeConfig = __commonJS({
    "node_modules/table/dist/src/makeRangeConfig.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.makeRangeConfig = void 0;
      var utils_1 = require_utils();
      var makeRangeConfig = (spanningCellConfig, columnsConfig) => {
        var _a;
        const { topLeft, bottomRight } = (0, utils_1.calculateRangeCoordinate)(spanningCellConfig);
        const cellConfig = {
          ...columnsConfig[topLeft.col],
          ...spanningCellConfig,
          paddingRight: (_a = spanningCellConfig.paddingRight) !== null && _a !== void 0 ? _a : columnsConfig[bottomRight.col].paddingRight
        };
        return {
          ...cellConfig,
          bottomRight,
          topLeft
        };
      };
      exports2.makeRangeConfig = makeRangeConfig;
    }
  });

  // node_modules/table/dist/src/spanningCellManager.js
  var require_spanningCellManager = __commonJS({
    "node_modules/table/dist/src/spanningCellManager.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.createSpanningCellManager = void 0;
      var alignSpanningCell_1 = require_alignSpanningCell();
      var calculateSpanningCellWidth_1 = require_calculateSpanningCellWidth();
      var makeRangeConfig_1 = require_makeRangeConfig();
      var utils_1 = require_utils();
      var findRangeConfig = (cell, rangeConfigs) => {
        return rangeConfigs.find((rangeCoordinate) => {
          return (0, utils_1.isCellInRange)(cell, rangeCoordinate);
        });
      };
      var getContainingRange = (rangeConfig, context) => {
        const width = (0, calculateSpanningCellWidth_1.calculateSpanningCellWidth)(rangeConfig, context);
        const wrappedContent = (0, alignSpanningCell_1.wrapRangeContent)(rangeConfig, width, context);
        const alignedContent = (0, alignSpanningCell_1.alignVerticalRangeContent)(rangeConfig, wrappedContent, context);
        const getCellContent = (rowIndex) => {
          const { topLeft } = rangeConfig;
          const { drawHorizontalLine, rowHeights } = context;
          const totalWithinHorizontalBorderHeight = rowIndex - topLeft.row;
          const totalHiddenHorizontalBorderHeight = (0, utils_1.sequence)(topLeft.row + 1, rowIndex).filter((index) => {
            return !(drawHorizontalLine === null || drawHorizontalLine === void 0 ? void 0 : drawHorizontalLine(index, rowHeights.length));
          }).length;
          const offset = (0, utils_1.sumArray)(rowHeights.slice(topLeft.row, rowIndex)) + totalWithinHorizontalBorderHeight - totalHiddenHorizontalBorderHeight;
          return alignedContent.slice(offset, offset + rowHeights[rowIndex]);
        };
        const getBorderContent = (borderIndex) => {
          const { topLeft } = rangeConfig;
          const offset = (0, utils_1.sumArray)(context.rowHeights.slice(topLeft.row, borderIndex)) + (borderIndex - topLeft.row - 1);
          return alignedContent[offset];
        };
        return {
          ...rangeConfig,
          extractBorderContent: getBorderContent,
          extractCellContent: getCellContent,
          height: wrappedContent.length,
          width
        };
      };
      var inSameRange = (cell1, cell2, ranges) => {
        const range1 = findRangeConfig(cell1, ranges);
        const range2 = findRangeConfig(cell2, ranges);
        if (range1 && range2) {
          return (0, utils_1.areCellEqual)(range1.topLeft, range2.topLeft);
        }
        return false;
      };
      var hashRange = (range) => {
        const { row, col } = range.topLeft;
        return `${row}/${col}`;
      };
      var createSpanningCellManager = (parameters) => {
        const { spanningCellConfigs, columnsConfig } = parameters;
        const ranges = spanningCellConfigs.map((config) => {
          return (0, makeRangeConfig_1.makeRangeConfig)(config, columnsConfig);
        });
        const rangeCache = {};
        let rowHeights = [];
        return {
          getContainingRange: (cell, options) => {
            var _a;
            const originalRow = (options === null || options === void 0 ? void 0 : options.mapped) ? (0, utils_1.findOriginalRowIndex)(rowHeights, cell.row) : cell.row;
            const range = findRangeConfig({
              ...cell,
              row: originalRow
            }, ranges);
            if (!range) {
              return void 0;
            }
            if (rowHeights.length === 0) {
              return getContainingRange(range, {
                ...parameters,
                rowHeights
              });
            }
            const hash = hashRange(range);
            (_a = rangeCache[hash]) !== null && _a !== void 0 ? _a : rangeCache[hash] = getContainingRange(range, {
              ...parameters,
              rowHeights
            });
            return rangeCache[hash];
          },
          inSameRange: (cell1, cell2) => {
            return inSameRange(cell1, cell2, ranges);
          },
          rowHeights,
          setRowHeights: (_rowHeights) => {
            rowHeights = _rowHeights;
          }
        };
      };
      exports2.createSpanningCellManager = createSpanningCellManager;
    }
  });

  // node_modules/table/dist/src/validateSpanningCellConfig.js
  var require_validateSpanningCellConfig = __commonJS({
    "node_modules/table/dist/src/validateSpanningCellConfig.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.validateSpanningCellConfig = void 0;
      var utils_1 = require_utils();
      var inRange = (start, end, value) => {
        return start <= value && value <= end;
      };
      var validateSpanningCellConfig = (rows, configs) => {
        const [nRow, nCol] = [rows.length, rows[0].length];
        configs.forEach((config, configIndex) => {
          const { colSpan, rowSpan } = config;
          if (colSpan === void 0 && rowSpan === void 0) {
            throw new Error(`Expect at least colSpan or rowSpan is provided in config.spanningCells[${configIndex}]`);
          }
          if (colSpan !== void 0 && colSpan < 1) {
            throw new Error(`Expect colSpan is not equal zero, instead got: ${colSpan} in config.spanningCells[${configIndex}]`);
          }
          if (rowSpan !== void 0 && rowSpan < 1) {
            throw new Error(`Expect rowSpan is not equal zero, instead got: ${rowSpan} in config.spanningCells[${configIndex}]`);
          }
        });
        const rangeCoordinates = configs.map(utils_1.calculateRangeCoordinate);
        rangeCoordinates.forEach(({ topLeft, bottomRight }, rangeIndex) => {
          if (!inRange(0, nCol - 1, topLeft.col) || !inRange(0, nRow - 1, topLeft.row) || !inRange(0, nCol - 1, bottomRight.col) || !inRange(0, nRow - 1, bottomRight.row)) {
            throw new Error(`Some cells in config.spanningCells[${rangeIndex}] are out of the table`);
          }
        });
        const configOccupy = Array.from({ length: nRow }, () => {
          return Array.from({ length: nCol });
        });
        rangeCoordinates.forEach(({ topLeft, bottomRight }, rangeIndex) => {
          (0, utils_1.sequence)(topLeft.row, bottomRight.row).forEach((row) => {
            (0, utils_1.sequence)(topLeft.col, bottomRight.col).forEach((col) => {
              if (configOccupy[row][col] !== void 0) {
                throw new Error(`Spanning cells in config.spanningCells[${configOccupy[row][col]}] and config.spanningCells[${rangeIndex}] are overlap each other`);
              }
              configOccupy[row][col] = rangeIndex;
            });
          });
        });
      };
      exports2.validateSpanningCellConfig = validateSpanningCellConfig;
    }
  });

  // node_modules/table/dist/src/makeTableConfig.js
  var require_makeTableConfig = __commonJS({
    "node_modules/table/dist/src/makeTableConfig.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.makeTableConfig = void 0;
      var calculateMaximumColumnWidths_1 = require_calculateMaximumColumnWidths();
      var spanningCellManager_1 = require_spanningCellManager();
      var utils_1 = require_utils();
      var validateConfig_1 = require_validateConfig();
      var validateSpanningCellConfig_1 = require_validateSpanningCellConfig();
      var makeColumnsConfig = (rows, columns, columnDefault, spanningCellConfigs) => {
        const columnWidths = (0, calculateMaximumColumnWidths_1.calculateMaximumColumnWidths)(rows, spanningCellConfigs);
        return rows[0].map((_, columnIndex) => {
          return {
            alignment: "left",
            paddingLeft: 1,
            paddingRight: 1,
            truncate: Number.POSITIVE_INFINITY,
            verticalAlignment: "top",
            width: columnWidths[columnIndex],
            wrapWord: false,
            ...columnDefault,
            ...columns === null || columns === void 0 ? void 0 : columns[columnIndex]
          };
        });
      };
      var makeTableConfig = (rows, config = {}, injectedSpanningCellConfig) => {
        var _a, _b, _c, _d, _e;
        (0, validateConfig_1.validateConfig)("config.json", config);
        (0, validateSpanningCellConfig_1.validateSpanningCellConfig)(rows, (_a = config.spanningCells) !== null && _a !== void 0 ? _a : []);
        const spanningCellConfigs = (_b = injectedSpanningCellConfig !== null && injectedSpanningCellConfig !== void 0 ? injectedSpanningCellConfig : config.spanningCells) !== null && _b !== void 0 ? _b : [];
        const columnsConfig = makeColumnsConfig(rows, config.columns, config.columnDefault, spanningCellConfigs);
        const drawVerticalLine = (_c = config.drawVerticalLine) !== null && _c !== void 0 ? _c : () => {
          return true;
        };
        const drawHorizontalLine = (_d = config.drawHorizontalLine) !== null && _d !== void 0 ? _d : () => {
          return true;
        };
        return {
          ...config,
          border: (0, utils_1.makeBorderConfig)(config.border),
          columns: columnsConfig,
          drawHorizontalLine,
          drawVerticalLine,
          singleLine: (_e = config.singleLine) !== null && _e !== void 0 ? _e : false,
          spanningCellManager: (0, spanningCellManager_1.createSpanningCellManager)({
            columnsConfig,
            drawHorizontalLine,
            drawVerticalLine,
            rows,
            spanningCellConfigs
          })
        };
      };
      exports2.makeTableConfig = makeTableConfig;
    }
  });

  // node_modules/table/dist/src/validateTableData.js
  var require_validateTableData = __commonJS({
    "node_modules/table/dist/src/validateTableData.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.validateTableData = void 0;
      var utils_1 = require_utils();
      var validateTableData = (rows) => {
        if (!Array.isArray(rows)) {
          throw new TypeError("Table data must be an array.");
        }
        if (rows.length === 0) {
          throw new Error("Table must define at least one row.");
        }
        if (rows[0].length === 0) {
          throw new Error("Table must define at least one column.");
        }
        const columnNumber = rows[0].length;
        for (const row of rows) {
          if (!Array.isArray(row)) {
            throw new TypeError("Table row data must be an array.");
          }
          if (row.length !== columnNumber) {
            throw new Error("Table must have a consistent number of cells.");
          }
          for (const cell of row) {
            if (/[\u0001-\u0006\u0008\u0009\u000B-\u001A]/.test((0, utils_1.normalizeString)(String(cell)))) {
              throw new Error("Table data must not contain control characters.");
            }
          }
        }
      };
      exports2.validateTableData = validateTableData;
    }
  });

  // node_modules/table/dist/src/table.js
  var require_table = __commonJS({
    "node_modules/table/dist/src/table.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.table = void 0;
      var alignTableData_1 = require_alignTableData();
      var calculateOutputColumnWidths_1 = require_calculateOutputColumnWidths();
      var calculateRowHeights_1 = require_calculateRowHeights();
      var drawTable_1 = require_drawTable();
      var injectHeaderConfig_1 = require_injectHeaderConfig();
      var makeTableConfig_1 = require_makeTableConfig();
      var mapDataUsingRowHeights_1 = require_mapDataUsingRowHeights();
      var padTableData_1 = require_padTableData();
      var stringifyTableData_1 = require_stringifyTableData();
      var truncateTableData_1 = require_truncateTableData();
      var utils_1 = require_utils();
      var validateTableData_1 = require_validateTableData();
      var table2 = (data, userConfig = {}) => {
        (0, validateTableData_1.validateTableData)(data);
        let rows = (0, stringifyTableData_1.stringifyTableData)(data);
        const [injectedRows, injectedSpanningCellConfig] = (0, injectHeaderConfig_1.injectHeaderConfig)(rows, userConfig);
        const config = (0, makeTableConfig_1.makeTableConfig)(injectedRows, userConfig, injectedSpanningCellConfig);
        rows = (0, truncateTableData_1.truncateTableData)(injectedRows, (0, utils_1.extractTruncates)(config));
        const rowHeights = (0, calculateRowHeights_1.calculateRowHeights)(rows, config);
        config.spanningCellManager.setRowHeights(rowHeights);
        rows = (0, mapDataUsingRowHeights_1.mapDataUsingRowHeights)(rows, rowHeights, config);
        rows = (0, alignTableData_1.alignTableData)(rows, config);
        rows = (0, padTableData_1.padTableData)(rows, config);
        const outputColumnWidths = (0, calculateOutputColumnWidths_1.calculateOutputColumnWidths)(config);
        return (0, drawTable_1.drawTable)(rows, outputColumnWidths, rowHeights, config);
      };
      exports2.table = table2;
    }
  });

  // node_modules/table/dist/src/types/api.js
  var require_api = __commonJS({
    "node_modules/table/dist/src/types/api.js"(exports2) {
      "use strict";
      Object.defineProperty(exports2, "__esModule", { value: true });
    }
  });

  // node_modules/table/dist/src/index.js
  var require_src = __commonJS({
    "node_modules/table/dist/src/index.js"(exports2) {
      "use strict";
      var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.getBorderCharacters = exports2.createStream = exports2.table = void 0;
      var createStream_1 = require_createStream();
      Object.defineProperty(exports2, "createStream", { enumerable: true, get: function() {
        return createStream_1.createStream;
      } });
      var getBorderCharacters_1 = require_getBorderCharacters();
      Object.defineProperty(exports2, "getBorderCharacters", { enumerable: true, get: function() {
        return getBorderCharacters_1.getBorderCharacters;
      } });
      var table_1 = require_table();
      Object.defineProperty(exports2, "table", { enumerable: true, get: function() {
        return table_1.table;
      } });
      __exportStar(require_api(), exports2);
    }
  });

  // node_modules/workerpool/dist/workerpool.js
  var require_workerpool = __commonJS({
    "node_modules/workerpool/dist/workerpool.js"(exports, module) {
      (function webpackUniversalModuleDefinition(root, factory) {
        if (typeof exports === "object" && typeof module === "object")
          module.exports = factory();
        else if (typeof define === "function" && define.amd)
          define("workerpool", [], factory);
        else if (typeof exports === "object")
          exports["workerpool"] = factory();
        else
          root["workerpool"] = factory();
      })(typeof self !== "undefined" ? self : exports, function() {
        return (
          /******/
          function() {
            var __webpack_modules__ = {
              /***/
              345: (
                /***/
                function(module2, __unused_webpack_exports, __webpack_require__2) {
                  var Promise2 = __webpack_require__2(219);
                  var WorkerHandler = __webpack_require__2(751);
                  var environment = __webpack_require__2(828);
                  var DebugPortAllocator = __webpack_require__2(833);
                  var DEBUG_PORT_ALLOCATOR = new DebugPortAllocator();
                  function Pool(script, options) {
                    if (typeof script === "string") {
                      this.script = script || null;
                    } else {
                      this.script = null;
                      options = script;
                    }
                    this.workers = [];
                    this.tasks = [];
                    options = options || {};
                    this.forkArgs = Object.freeze(options.forkArgs || []);
                    this.forkOpts = Object.freeze(options.forkOpts || {});
                    this.workerThreadOpts = Object.freeze(options.workerThreadOpts || {});
                    this.debugPortStart = options.debugPortStart || 43210;
                    this.nodeWorker = options.nodeWorker;
                    this.workerType = options.workerType || options.nodeWorker || "auto";
                    this.maxQueueSize = options.maxQueueSize || Infinity;
                    this.workerTerminateTimeout = options.workerTerminateTimeout || 1e3;
                    this.onCreateWorker = options.onCreateWorker || function() {
                      return null;
                    };
                    this.onTerminateWorker = options.onTerminateWorker || function() {
                      return null;
                    };
                    if (options && "maxWorkers" in options) {
                      validateMaxWorkers(options.maxWorkers);
                      this.maxWorkers = options.maxWorkers;
                    } else {
                      this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
                    }
                    if (options && "minWorkers" in options) {
                      if (options.minWorkers === "max") {
                        this.minWorkers = this.maxWorkers;
                      } else {
                        validateMinWorkers(options.minWorkers);
                        this.minWorkers = options.minWorkers;
                        this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers);
                      }
                      this._ensureMinWorkers();
                    }
                    this._boundNext = this._next.bind(this);
                    if (this.workerType === "thread") {
                      WorkerHandler.ensureWorkerThreads();
                    }
                  }
                  Pool.prototype.exec = function(method, params, options) {
                    if (params && !Array.isArray(params)) {
                      throw new TypeError('Array expected as argument "params"');
                    }
                    if (typeof method === "string") {
                      var resolver = Promise2.defer();
                      if (this.tasks.length >= this.maxQueueSize) {
                        throw new Error("Max queue size of " + this.maxQueueSize + " reached");
                      }
                      var tasks = this.tasks;
                      var task = {
                        method,
                        params,
                        resolver,
                        timeout: null,
                        options
                      };
                      tasks.push(task);
                      var originalTimeout = resolver.promise.timeout;
                      resolver.promise.timeout = function timeout(delay) {
                        if (tasks.indexOf(task) !== -1) {
                          task.timeout = delay;
                          return resolver.promise;
                        } else {
                          return originalTimeout.call(resolver.promise, delay);
                        }
                      };
                      this._next();
                      return resolver.promise;
                    } else if (typeof method === "function") {
                      return this.exec("run", [String(method), params]);
                    } else {
                      throw new TypeError('Function or string expected as argument "method"');
                    }
                  };
                  Pool.prototype.proxy = function() {
                    if (arguments.length > 0) {
                      throw new Error("No arguments expected");
                    }
                    var pool = this;
                    return this.exec("methods").then(function(methods) {
                      var proxy = {};
                      methods.forEach(function(method) {
                        proxy[method] = function() {
                          return pool.exec(method, Array.prototype.slice.call(arguments));
                        };
                      });
                      return proxy;
                    });
                  };
                  Pool.prototype._next = function() {
                    if (this.tasks.length > 0) {
                      var worker2 = this._getWorker();
                      if (worker2) {
                        var me = this;
                        var task = this.tasks.shift();
                        if (task.resolver.promise.pending) {
                          var promise = worker2.exec(task.method, task.params, task.resolver, task.options).then(me._boundNext)["catch"](function() {
                            if (worker2.terminated) {
                              return me._removeWorker(worker2);
                            }
                          }).then(function() {
                            me._next();
                          });
                          if (typeof task.timeout === "number") {
                            promise.timeout(task.timeout);
                          }
                        } else {
                          me._next();
                        }
                      }
                    }
                  };
                  Pool.prototype._getWorker = function() {
                    var workers = this.workers;
                    for (var i = 0; i < workers.length; i++) {
                      var worker2 = workers[i];
                      if (worker2.busy() === false) {
                        return worker2;
                      }
                    }
                    if (workers.length < this.maxWorkers) {
                      worker2 = this._createWorkerHandler();
                      workers.push(worker2);
                      return worker2;
                    }
                    return null;
                  };
                  Pool.prototype._removeWorker = function(worker2) {
                    var me = this;
                    DEBUG_PORT_ALLOCATOR.releasePort(worker2.debugPort);
                    this._removeWorkerFromList(worker2);
                    this._ensureMinWorkers();
                    return new Promise2(function(resolve, reject) {
                      worker2.terminate(false, function(err) {
                        me.onTerminateWorker({
                          forkArgs: worker2.forkArgs,
                          forkOpts: worker2.forkOpts,
                          workerThreadOpts: worker2.workerThreadOpts,
                          script: worker2.script
                        });
                        if (err) {
                          reject(err);
                        } else {
                          resolve(worker2);
                        }
                      });
                    });
                  };
                  Pool.prototype._removeWorkerFromList = function(worker2) {
                    var index = this.workers.indexOf(worker2);
                    if (index !== -1) {
                      this.workers.splice(index, 1);
                    }
                  };
                  Pool.prototype.terminate = function(force, timeout) {
                    var me = this;
                    this.tasks.forEach(function(task) {
                      task.resolver.reject(new Error("Pool terminated"));
                    });
                    this.tasks.length = 0;
                    var f = function f2(worker2) {
                      DEBUG_PORT_ALLOCATOR.releasePort(worker2.debugPort);
                      this._removeWorkerFromList(worker2);
                    };
                    var removeWorker = f.bind(this);
                    var promises = [];
                    var workers = this.workers.slice();
                    workers.forEach(function(worker2) {
                      var termPromise = worker2.terminateAndNotify(force, timeout).then(removeWorker).always(function() {
                        me.onTerminateWorker({
                          forkArgs: worker2.forkArgs,
                          forkOpts: worker2.forkOpts,
                          workerThreadOpts: worker2.workerThreadOpts,
                          script: worker2.script
                        });
                      });
                      promises.push(termPromise);
                    });
                    return Promise2.all(promises);
                  };
                  Pool.prototype.stats = function() {
                    var totalWorkers = this.workers.length;
                    var busyWorkers = this.workers.filter(function(worker2) {
                      return worker2.busy();
                    }).length;
                    return {
                      totalWorkers,
                      busyWorkers,
                      idleWorkers: totalWorkers - busyWorkers,
                      pendingTasks: this.tasks.length,
                      activeTasks: busyWorkers
                    };
                  };
                  Pool.prototype._ensureMinWorkers = function() {
                    if (this.minWorkers) {
                      for (var i = this.workers.length; i < this.minWorkers; i++) {
                        this.workers.push(this._createWorkerHandler());
                      }
                    }
                  };
                  Pool.prototype._createWorkerHandler = function() {
                    var overridenParams = this.onCreateWorker({
                      forkArgs: this.forkArgs,
                      forkOpts: this.forkOpts,
                      workerThreadOpts: this.workerThreadOpts,
                      script: this.script
                    }) || {};
                    return new WorkerHandler(overridenParams.script || this.script, {
                      forkArgs: overridenParams.forkArgs || this.forkArgs,
                      forkOpts: overridenParams.forkOpts || this.forkOpts,
                      workerThreadOpts: overridenParams.workerThreadOpts || this.workerThreadOpts,
                      debugPort: DEBUG_PORT_ALLOCATOR.nextAvailableStartingAt(this.debugPortStart),
                      workerType: this.workerType,
                      workerTerminateTimeout: this.workerTerminateTimeout
                    });
                  };
                  function validateMaxWorkers(maxWorkers) {
                    if (!isNumber(maxWorkers) || !isInteger(maxWorkers) || maxWorkers < 1) {
                      throw new TypeError("Option maxWorkers must be an integer number >= 1");
                    }
                  }
                  function validateMinWorkers(minWorkers) {
                    if (!isNumber(minWorkers) || !isInteger(minWorkers) || minWorkers < 0) {
                      throw new TypeError("Option minWorkers must be an integer number >= 0");
                    }
                  }
                  function isNumber(value) {
                    return typeof value === "number";
                  }
                  function isInteger(value) {
                    return Math.round(value) == value;
                  }
                  module2.exports = Pool;
                }
              ),
              /***/
              219: (
                /***/
                function(module2) {
                  "use strict";
                  function Promise2(handler, parent) {
                    var me = this;
                    if (!(this instanceof Promise2)) {
                      throw new SyntaxError("Constructor must be called with the new operator");
                    }
                    if (typeof handler !== "function") {
                      throw new SyntaxError("Function parameter handler(resolve, reject) missing");
                    }
                    var _onSuccess = [];
                    var _onFail = [];
                    this.resolved = false;
                    this.rejected = false;
                    this.pending = true;
                    var _process = function _process2(onSuccess, onFail) {
                      _onSuccess.push(onSuccess);
                      _onFail.push(onFail);
                    };
                    this.then = function(onSuccess, onFail) {
                      return new Promise2(function(resolve, reject) {
                        var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
                        var f = onFail ? _then(onFail, resolve, reject) : reject;
                        _process(s, f);
                      }, me);
                    };
                    var _resolve2 = function _resolve(result) {
                      me.resolved = true;
                      me.rejected = false;
                      me.pending = false;
                      _onSuccess.forEach(function(fn) {
                        fn(result);
                      });
                      _process = function _process2(onSuccess, onFail) {
                        onSuccess(result);
                      };
                      _resolve2 = _reject2 = function _reject() {
                      };
                      return me;
                    };
                    var _reject2 = function _reject(error) {
                      me.resolved = false;
                      me.rejected = true;
                      me.pending = false;
                      _onFail.forEach(function(fn) {
                        fn(error);
                      });
                      _process = function _process2(onSuccess, onFail) {
                        onFail(error);
                      };
                      _resolve2 = _reject2 = function _reject3() {
                      };
                      return me;
                    };
                    this.cancel = function() {
                      if (parent) {
                        parent.cancel();
                      } else {
                        _reject2(new CancellationError());
                      }
                      return me;
                    };
                    this.timeout = function(delay) {
                      if (parent) {
                        parent.timeout(delay);
                      } else {
                        var timer = setTimeout(function() {
                          _reject2(new TimeoutError("Promise timed out after " + delay + " ms"));
                        }, delay);
                        me.always(function() {
                          clearTimeout(timer);
                        });
                      }
                      return me;
                    };
                    handler(function(result) {
                      _resolve2(result);
                    }, function(error) {
                      _reject2(error);
                    });
                  }
                  function _then(callback, resolve, reject) {
                    return function(result) {
                      try {
                        var res = callback(result);
                        if (res && typeof res.then === "function" && typeof res["catch"] === "function") {
                          res.then(resolve, reject);
                        } else {
                          resolve(res);
                        }
                      } catch (error) {
                        reject(error);
                      }
                    };
                  }
                  Promise2.prototype["catch"] = function(onFail) {
                    return this.then(null, onFail);
                  };
                  Promise2.prototype.always = function(fn) {
                    return this.then(fn, fn);
                  };
                  Promise2.all = function(promises) {
                    return new Promise2(function(resolve, reject) {
                      var remaining = promises.length, results = [];
                      if (remaining) {
                        promises.forEach(function(p, i) {
                          p.then(function(result) {
                            results[i] = result;
                            remaining--;
                            if (remaining == 0) {
                              resolve(results);
                            }
                          }, function(error) {
                            remaining = 0;
                            reject(error);
                          });
                        });
                      } else {
                        resolve(results);
                      }
                    });
                  };
                  Promise2.defer = function() {
                    var resolver = {};
                    resolver.promise = new Promise2(function(resolve, reject) {
                      resolver.resolve = resolve;
                      resolver.reject = reject;
                    });
                    return resolver;
                  };
                  function CancellationError(message) {
                    this.message = message || "promise cancelled";
                    this.stack = new Error().stack;
                  }
                  CancellationError.prototype = new Error();
                  CancellationError.prototype.constructor = Error;
                  CancellationError.prototype.name = "CancellationError";
                  Promise2.CancellationError = CancellationError;
                  function TimeoutError(message) {
                    this.message = message || "timeout exceeded";
                    this.stack = new Error().stack;
                  }
                  TimeoutError.prototype = new Error();
                  TimeoutError.prototype.constructor = Error;
                  TimeoutError.prototype.name = "TimeoutError";
                  Promise2.TimeoutError = TimeoutError;
                  module2.exports = Promise2;
                }
              ),
              /***/
              751: (
                /***/
                function(module2, __unused_webpack_exports, __webpack_require__2) {
                  "use strict";
                  function _createForOfIteratorHelper(o, allowArrayLike) {
                    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
                    if (!it) {
                      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                        if (it)
                          o = it;
                        var i = 0;
                        var F = function F2() {
                        };
                        return { s: F, n: function n() {
                          if (i >= o.length)
                            return { done: true };
                          return { done: false, value: o[i++] };
                        }, e: function e(_e) {
                          throw _e;
                        }, f: F };
                      }
                      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    }
                    var normalCompletion = true, didErr = false, err;
                    return { s: function s() {
                      it = it.call(o);
                    }, n: function n() {
                      var step = it.next();
                      normalCompletion = step.done;
                      return step;
                    }, e: function e(_e2) {
                      didErr = true;
                      err = _e2;
                    }, f: function f() {
                      try {
                        if (!normalCompletion && it["return"] != null)
                          it["return"]();
                      } finally {
                        if (didErr)
                          throw err;
                      }
                    } };
                  }
                  function _unsupportedIterableToArray(o, minLen) {
                    if (!o)
                      return;
                    if (typeof o === "string")
                      return _arrayLikeToArray(o, minLen);
                    var n = Object.prototype.toString.call(o).slice(8, -1);
                    if (n === "Object" && o.constructor)
                      n = o.constructor.name;
                    if (n === "Map" || n === "Set")
                      return Array.from(o);
                    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                      return _arrayLikeToArray(o, minLen);
                  }
                  function _arrayLikeToArray(arr, len) {
                    if (len == null || len > arr.length)
                      len = arr.length;
                    for (var i = 0, arr2 = new Array(len); i < len; i++) {
                      arr2[i] = arr[i];
                    }
                    return arr2;
                  }
                  function ownKeys(object, enumerableOnly) {
                    var keys = Object.keys(object);
                    if (Object.getOwnPropertySymbols) {
                      var symbols = Object.getOwnPropertySymbols(object);
                      enumerableOnly && (symbols = symbols.filter(function(sym) {
                        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                      })), keys.push.apply(keys, symbols);
                    }
                    return keys;
                  }
                  function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                      var source = null != arguments[i] ? arguments[i] : {};
                      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
                        _defineProperty(target, key, source[key]);
                      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
                        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                      });
                    }
                    return target;
                  }
                  function _defineProperty(obj, key, value) {
                    key = _toPropertyKey(key);
                    if (key in obj) {
                      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
                    } else {
                      obj[key] = value;
                    }
                    return obj;
                  }
                  function _toPropertyKey(arg) {
                    var key = _toPrimitive(arg, "string");
                    return _typeof2(key) === "symbol" ? key : String(key);
                  }
                  function _toPrimitive(input, hint) {
                    if (_typeof2(input) !== "object" || input === null)
                      return input;
                    var prim = input[Symbol.toPrimitive];
                    if (prim !== void 0) {
                      var res = prim.call(input, hint || "default");
                      if (_typeof2(res) !== "object")
                        return res;
                      throw new TypeError("@@toPrimitive must return a primitive value.");
                    }
                    return (hint === "string" ? String : Number)(input);
                  }
                  function _typeof2(obj) {
                    "@babel/helpers - typeof";
                    return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                      return typeof obj2;
                    } : function(obj2) {
                      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, _typeof2(obj);
                  }
                  var Promise2 = __webpack_require__2(219);
                  var environment = __webpack_require__2(828);
                  var requireFoolWebpack2 = __webpack_require__2(397);
                  var TERMINATE_METHOD_ID2 = "__workerpool-terminate__";
                  function ensureWorkerThreads() {
                    var WorkerThreads2 = tryRequireWorkerThreads();
                    if (!WorkerThreads2) {
                      throw new Error("WorkerPool: workerType = 'thread' is not supported, Node >= 11.7.0 required");
                    }
                    return WorkerThreads2;
                  }
                  function ensureWebWorker() {
                    if (typeof Worker !== "function" && ((typeof Worker === "undefined" ? "undefined" : _typeof2(Worker)) !== "object" || typeof Worker.prototype.constructor !== "function")) {
                      throw new Error("WorkerPool: Web Workers not supported");
                    }
                  }
                  function tryRequireWorkerThreads() {
                    try {
                      return requireFoolWebpack2("worker_threads");
                    } catch (error) {
                      if (_typeof2(error) === "object" && error !== null && error.code === "MODULE_NOT_FOUND") {
                        return null;
                      } else {
                        throw error;
                      }
                    }
                  }
                  function getDefaultWorker() {
                    if (environment.platform === "browser") {
                      if (typeof Blob === "undefined") {
                        throw new Error("Blob not supported by the browser");
                      }
                      if (!window.URL || typeof window.URL.createObjectURL !== "function") {
                        throw new Error("URL.createObjectURL not supported by the browser");
                      }
                      var blob = new Blob([__webpack_require__2(670)], {
                        type: "text/javascript"
                      });
                      return window.URL.createObjectURL(blob);
                    } else {
                      return __dirname + "/worker.js";
                    }
                  }
                  function setupWorker(script, options) {
                    if (options.workerType === "web") {
                      ensureWebWorker();
                      return setupBrowserWorker(script, Worker);
                    } else if (options.workerType === "thread") {
                      WorkerThreads2 = ensureWorkerThreads();
                      return setupWorkerThreadWorker(script, WorkerThreads2, options.workerThreadOpts);
                    } else if (options.workerType === "process" || !options.workerType) {
                      return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack2("child_process"));
                    } else {
                      if (environment.platform === "browser") {
                        ensureWebWorker();
                        return setupBrowserWorker(script, Worker);
                      } else {
                        var WorkerThreads2 = tryRequireWorkerThreads();
                        if (WorkerThreads2) {
                          return setupWorkerThreadWorker(script, WorkerThreads2);
                        } else {
                          return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack2("child_process"));
                        }
                      }
                    }
                  }
                  function setupBrowserWorker(script, Worker2) {
                    var worker2 = new Worker2(script);
                    worker2.isBrowserWorker = true;
                    worker2.on = function(event, callback) {
                      this.addEventListener(event, function(message) {
                        callback(message.data);
                      });
                    };
                    worker2.send = function(message, transfer) {
                      this.postMessage(message, transfer);
                    };
                    return worker2;
                  }
                  function setupWorkerThreadWorker(script, WorkerThreads2, workerThreadOptions) {
                    var worker2 = new WorkerThreads2.Worker(script, _objectSpread({
                      stdout: false,
                      // automatically pipe worker.STDOUT to process.STDOUT
                      stderr: false
                    }, workerThreadOptions));
                    worker2.isWorkerThread = true;
                    worker2.send = function(message, transfer) {
                      this.postMessage(message, transfer);
                    };
                    worker2.kill = function() {
                      this.terminate();
                      return true;
                    };
                    worker2.disconnect = function() {
                      this.terminate();
                    };
                    return worker2;
                  }
                  function setupProcessWorker(script, options, child_process) {
                    var worker2 = child_process.fork(script, options.forkArgs, options.forkOpts);
                    var send = worker2.send;
                    worker2.send = function(message) {
                      return send.call(worker2, message);
                    };
                    worker2.isChildProcess = true;
                    return worker2;
                  }
                  function resolveForkOptions(opts) {
                    opts = opts || {};
                    var processExecArgv = process.execArgv.join(" ");
                    var inspectorActive = processExecArgv.indexOf("--inspect") !== -1;
                    var debugBrk = processExecArgv.indexOf("--debug-brk") !== -1;
                    var execArgv = [];
                    if (inspectorActive) {
                      execArgv.push("--inspect=" + opts.debugPort);
                      if (debugBrk) {
                        execArgv.push("--debug-brk");
                      }
                    }
                    process.execArgv.forEach(function(arg) {
                      if (arg.indexOf("--max-old-space-size") > -1) {
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
                  function objectToError(obj) {
                    var temp = new Error("");
                    var props = Object.keys(obj);
                    for (var i = 0; i < props.length; i++) {
                      temp[props[i]] = obj[props[i]];
                    }
                    return temp;
                  }
                  function WorkerHandler(script, _options) {
                    var me = this;
                    var options = _options || {};
                    this.script = script || getDefaultWorker();
                    this.worker = setupWorker(this.script, options);
                    this.debugPort = options.debugPort;
                    this.forkOpts = options.forkOpts;
                    this.forkArgs = options.forkArgs;
                    this.workerThreadOpts = options.workerThreadOpts;
                    this.workerTerminateTimeout = options.workerTerminateTimeout;
                    if (!script) {
                      this.worker.ready = true;
                    }
                    this.requestQueue = [];
                    this.worker.on("message", function(response) {
                      if (me.terminated) {
                        return;
                      }
                      if (typeof response === "string" && response === "ready") {
                        me.worker.ready = true;
                        dispatchQueuedRequests();
                      } else {
                        var id = response.id;
                        var task = me.processing[id];
                        if (task !== void 0) {
                          if (response.isEvent) {
                            if (task.options && typeof task.options.on === "function") {
                              task.options.on(response.payload);
                            }
                          } else {
                            delete me.processing[id];
                            if (me.terminating === true) {
                              me.terminate();
                            }
                            if (response.error) {
                              task.resolver.reject(objectToError(response.error));
                            } else {
                              task.resolver.resolve(response.result);
                            }
                          }
                        }
                      }
                    });
                    function onError(error) {
                      me.terminated = true;
                      for (var id in me.processing) {
                        if (me.processing[id] !== void 0) {
                          me.processing[id].resolver.reject(error);
                        }
                      }
                      me.processing = /* @__PURE__ */ Object.create(null);
                    }
                    function dispatchQueuedRequests() {
                      var _iterator = _createForOfIteratorHelper(me.requestQueue.splice(0)), _step;
                      try {
                        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                          var request = _step.value;
                          me.worker.send(request.message, request.transfer);
                        }
                      } catch (err) {
                        _iterator.e(err);
                      } finally {
                        _iterator.f();
                      }
                    }
                    var worker2 = this.worker;
                    this.worker.on("error", onError);
                    this.worker.on("exit", function(exitCode, signalCode) {
                      var message = "Workerpool Worker terminated Unexpectedly\n";
                      message += "    exitCode: `" + exitCode + "`\n";
                      message += "    signalCode: `" + signalCode + "`\n";
                      message += "    workerpool.script: `" + me.script + "`\n";
                      message += "    spawnArgs: `" + worker2.spawnargs + "`\n";
                      message += "    spawnfile: `" + worker2.spawnfile + "`\n";
                      message += "    stdout: `" + worker2.stdout + "`\n";
                      message += "    stderr: `" + worker2.stderr + "`\n";
                      onError(new Error(message));
                    });
                    this.processing = /* @__PURE__ */ Object.create(null);
                    this.terminating = false;
                    this.terminated = false;
                    this.cleaning = false;
                    this.terminationHandler = null;
                    this.lastId = 0;
                  }
                  WorkerHandler.prototype.methods = function() {
                    return this.exec("methods");
                  };
                  WorkerHandler.prototype.exec = function(method, params, resolver, options) {
                    if (!resolver) {
                      resolver = Promise2.defer();
                    }
                    var id = ++this.lastId;
                    this.processing[id] = {
                      id,
                      resolver,
                      options
                    };
                    var request = {
                      message: {
                        id,
                        method,
                        params
                      },
                      transfer: options && options.transfer
                    };
                    if (this.terminated) {
                      resolver.reject(new Error("Worker is terminated"));
                    } else if (this.worker.ready) {
                      this.worker.send(request.message, request.transfer);
                    } else {
                      this.requestQueue.push(request);
                    }
                    var me = this;
                    return resolver.promise["catch"](function(error) {
                      if (error instanceof Promise2.CancellationError || error instanceof Promise2.TimeoutError) {
                        delete me.processing[id];
                        return me.terminateAndNotify(true).then(function() {
                          throw error;
                        }, function(err) {
                          throw err;
                        });
                      } else {
                        throw error;
                      }
                    });
                  };
                  WorkerHandler.prototype.busy = function() {
                    return this.cleaning || Object.keys(this.processing).length > 0;
                  };
                  WorkerHandler.prototype.terminate = function(force, callback) {
                    var me = this;
                    if (force) {
                      for (var id in this.processing) {
                        if (this.processing[id] !== void 0) {
                          this.processing[id].resolver.reject(new Error("Worker terminated"));
                        }
                      }
                      this.processing = /* @__PURE__ */ Object.create(null);
                    }
                    if (typeof callback === "function") {
                      this.terminationHandler = callback;
                    }
                    if (!this.busy()) {
                      var cleanup = function cleanup2(err) {
                        me.terminated = true;
                        me.cleaning = false;
                        if (me.worker != null && me.worker.removeAllListeners) {
                          me.worker.removeAllListeners("message");
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
                        if (typeof this.worker.kill === "function") {
                          if (this.worker.killed) {
                            cleanup(new Error("worker already killed!"));
                            return;
                          }
                          var cleanExitTimeout = setTimeout(function() {
                            if (me.worker) {
                              me.worker.kill();
                            }
                          }, this.workerTerminateTimeout);
                          this.worker.once("exit", function() {
                            clearTimeout(cleanExitTimeout);
                            if (me.worker) {
                              me.worker.killed = true;
                            }
                            cleanup();
                          });
                          if (this.worker.ready) {
                            this.worker.send(TERMINATE_METHOD_ID2);
                          } else {
                            this.requestQueue.push(TERMINATE_METHOD_ID2);
                          }
                          this.cleaning = true;
                          return;
                        } else if (typeof this.worker.terminate === "function") {
                          this.worker.terminate();
                          this.worker.killed = true;
                        } else {
                          throw new Error("Failed to terminate worker");
                        }
                      }
                      cleanup();
                    } else {
                      this.terminating = true;
                    }
                  };
                  WorkerHandler.prototype.terminateAndNotify = function(force, timeout) {
                    var resolver = Promise2.defer();
                    if (timeout) {
                      resolver.promise.timeout = timeout;
                    }
                    this.terminate(force, function(err, worker2) {
                      if (err) {
                        resolver.reject(err);
                      } else {
                        resolver.resolve(worker2);
                      }
                    });
                    return resolver.promise;
                  };
                  module2.exports = WorkerHandler;
                  module2.exports._tryRequireWorkerThreads = tryRequireWorkerThreads;
                  module2.exports._setupProcessWorker = setupProcessWorker;
                  module2.exports._setupBrowserWorker = setupBrowserWorker;
                  module2.exports._setupWorkerThreadWorker = setupWorkerThreadWorker;
                  module2.exports.ensureWorkerThreads = ensureWorkerThreads;
                }
              ),
              /***/
              833: (
                /***/
                function(module2) {
                  "use strict";
                  var MAX_PORTS = 65535;
                  module2.exports = DebugPortAllocator;
                  function DebugPortAllocator() {
                    this.ports = /* @__PURE__ */ Object.create(null);
                    this.length = 0;
                  }
                  DebugPortAllocator.prototype.nextAvailableStartingAt = function(starting) {
                    while (this.ports[starting] === true) {
                      starting++;
                    }
                    if (starting >= MAX_PORTS) {
                      throw new Error("WorkerPool debug port limit reached: " + starting + ">= " + MAX_PORTS);
                    }
                    this.ports[starting] = true;
                    this.length++;
                    return starting;
                  };
                  DebugPortAllocator.prototype.releasePort = function(port) {
                    delete this.ports[port];
                    this.length--;
                  };
                }
              ),
              /***/
              828: (
                /***/
                function(module2, __unused_webpack_exports, __webpack_require__2) {
                  var requireFoolWebpack2 = __webpack_require__2(397);
                  var isNode = function isNode2(nodeProcess) {
                    return typeof nodeProcess !== "undefined" && nodeProcess.versions != null && nodeProcess.versions.node != null;
                  };
                  module2.exports.isNode = isNode;
                  module2.exports.platform = typeof process !== "undefined" && isNode(process) ? "node" : "browser";
                  var worker_threads = tryRequireFoolWebpack("worker_threads");
                  module2.exports.isMainThread = module2.exports.platform === "node" ? (!worker_threads || worker_threads.isMainThread) && !process.connected : typeof Window !== "undefined";
                  module2.exports.cpus = module2.exports.platform === "browser" ? self.navigator.hardwareConcurrency : requireFoolWebpack2("os").cpus().length;
                  function tryRequireFoolWebpack(module3) {
                    try {
                      return requireFoolWebpack2(module3);
                    } catch (err) {
                      return null;
                    }
                  }
                }
              ),
              /***/
              670: (
                /***/
                function(module2) {
                  module2.exports = `!function(){var __webpack_modules__={577:function(e){e.exports=function(e,r){this.message=e,this.transfer=r}}},__webpack_module_cache__={};function __webpack_require__(e){var r=__webpack_module_cache__[e];return void 0!==r||(r=__webpack_module_cache__[e]={exports:{}},__webpack_modules__[e](r,r.exports,__webpack_require__)),r.exports}var __webpack_exports__={};!function(){var exports=__webpack_exports__,__webpack_unused_export__;function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var Transfer=__webpack_require__(577),requireFoolWebpack=eval("typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \\" + module + \\" not found.') }"),TERMINATE_METHOD_ID="__workerpool-terminate__",worker={exit:function(){}},WorkerThreads,parentPort;if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(e,r){addEventListener(e,function(e){r(e.data)})},worker.send=function(e){postMessage(e)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(error){if("object"!==_typeof(error)||null===error||"MODULE_NOT_FOUND"!==error.code)throw error}WorkerThreads&&null!==WorkerThreads.parentPort?(parentPort=WorkerThreads.parentPort,worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)):(worker.on=process.on.bind(process),worker.send=function(e){process.send(e)},worker.on("disconnect",function(){process.exit(1)})),worker.exit=process.exit.bind(process)}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(e,r){return Object.defineProperty(e,r,{value:o[r],enumerable:!0})},{})}function isPromise(e){return e&&"function"==typeof e.then&&"function"==typeof e.catch}worker.methods={},worker.methods.run=function(e,r){e=new Function("return ("+e+").apply(null, arguments);");return e.apply(e,r)},worker.methods.methods=function(){return Object.keys(worker.methods)},worker.terminationHandler=void 0,worker.cleanupAndExit=function(e){function r(){worker.exit(e)}if(!worker.terminationHandler)return r();var o=worker.terminationHandler(e);isPromise(o)?o.then(r,r):r()};var currentRequestId=null;worker.on("message",function(r){if(r===TERMINATE_METHOD_ID)return worker.cleanupAndExit(0);try{var e=worker.methods[r.method];if(!e)throw new Error('Unknown method "'+r.method+'"');currentRequestId=r.id;var o=e.apply(e,r.params);isPromise(o)?o.then(function(e){e instanceof Transfer?worker.send({id:r.id,result:e.message,error:null},e.transfer):worker.send({id:r.id,result:e,error:null}),currentRequestId=null}).catch(function(e){worker.send({id:r.id,result:null,error:convertError(e)}),currentRequestId=null}):(o instanceof Transfer?worker.send({id:r.id,result:o.message,error:null},o.transfer):worker.send({id:r.id,result:o,error:null}),currentRequestId=null)}catch(e){worker.send({id:r.id,result:null,error:convertError(e)})}}),worker.register=function(e,r){if(e)for(var o in e)e.hasOwnProperty(o)&&(worker.methods[o]=e[o]);r&&(worker.terminationHandler=r.onTerminate),worker.send("ready")},worker.emit=function(e){currentRequestId&&(e instanceof Transfer?worker.send({id:currentRequestId,isEvent:!0,payload:e.message},e.transfer):worker.send({id:currentRequestId,isEvent:!0,payload:e}))},__webpack_unused_export__=worker.register,worker.emit}()}();`;
                }
              ),
              /***/
              397: (
                /***/
                function(module) {
                  var requireFoolWebpack = eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`);
                  module.exports = requireFoolWebpack;
                }
              ),
              /***/
              577: (
                /***/
                function(module2) {
                  function Transfer2(message, transfer) {
                    this.message = message;
                    this.transfer = transfer;
                  }
                  module2.exports = Transfer2;
                }
              ),
              /***/
              744: (
                /***/
                function(__unused_webpack_module, exports, __webpack_require__) {
                  function _typeof(obj) {
                    "@babel/helpers - typeof";
                    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                      return typeof obj2;
                    } : function(obj2) {
                      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                    }, _typeof(obj);
                  }
                  var Transfer = __webpack_require__(577);
                  var requireFoolWebpack = eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`);
                  var TERMINATE_METHOD_ID = "__workerpool-terminate__";
                  var worker = {
                    exit: function exit() {
                    }
                  };
                  if (typeof self !== "undefined" && typeof postMessage === "function" && typeof addEventListener === "function") {
                    worker.on = function(event, callback) {
                      addEventListener(event, function(message) {
                        callback(message.data);
                      });
                    };
                    worker.send = function(message) {
                      postMessage(message);
                    };
                  } else if (typeof process !== "undefined") {
                    var WorkerThreads;
                    try {
                      WorkerThreads = requireFoolWebpack("worker_threads");
                    } catch (error) {
                      if (_typeof(error) === "object" && error !== null && error.code === "MODULE_NOT_FOUND") {
                      } else {
                        throw error;
                      }
                    }
                    if (WorkerThreads && /* if there is a parentPort, we are in a WorkerThread */
                    WorkerThreads.parentPort !== null) {
                      var parentPort = WorkerThreads.parentPort;
                      worker.send = parentPort.postMessage.bind(parentPort);
                      worker.on = parentPort.on.bind(parentPort);
                      worker.exit = process.exit.bind(process);
                    } else {
                      worker.on = process.on.bind(process);
                      worker.send = function(message) {
                        process.send(message);
                      };
                      worker.on("disconnect", function() {
                        process.exit(1);
                      });
                      worker.exit = process.exit.bind(process);
                    }
                  } else {
                    throw new Error("Script must be executed as a worker");
                  }
                  function convertError(error) {
                    return Object.getOwnPropertyNames(error).reduce(function(product, name) {
                      return Object.defineProperty(product, name, {
                        value: error[name],
                        enumerable: true
                      });
                    }, {});
                  }
                  function isPromise(value) {
                    return value && typeof value.then === "function" && typeof value["catch"] === "function";
                  }
                  worker.methods = {};
                  worker.methods.run = function run(fn, args) {
                    var f = new Function("return (" + fn + ").apply(null, arguments);");
                    return f.apply(f, args);
                  };
                  worker.methods.methods = function methods() {
                    return Object.keys(worker.methods);
                  };
                  worker.terminationHandler = void 0;
                  worker.cleanupAndExit = function(code) {
                    var _exit = function _exit2() {
                      worker.exit(code);
                    };
                    if (!worker.terminationHandler) {
                      return _exit();
                    }
                    var result = worker.terminationHandler(code);
                    if (isPromise(result)) {
                      result.then(_exit, _exit);
                    } else {
                      _exit();
                    }
                  };
                  var currentRequestId = null;
                  worker.on("message", function(request) {
                    if (request === TERMINATE_METHOD_ID) {
                      return worker.cleanupAndExit(0);
                    }
                    try {
                      var method = worker.methods[request.method];
                      if (method) {
                        currentRequestId = request.id;
                        var result = method.apply(method, request.params);
                        if (isPromise(result)) {
                          result.then(function(result2) {
                            if (result2 instanceof Transfer) {
                              worker.send({
                                id: request.id,
                                result: result2.message,
                                error: null
                              }, result2.transfer);
                            } else {
                              worker.send({
                                id: request.id,
                                result: result2,
                                error: null
                              });
                            }
                            currentRequestId = null;
                          })["catch"](function(err) {
                            worker.send({
                              id: request.id,
                              result: null,
                              error: convertError(err)
                            });
                            currentRequestId = null;
                          });
                        } else {
                          if (result instanceof Transfer) {
                            worker.send({
                              id: request.id,
                              result: result.message,
                              error: null
                            }, result.transfer);
                          } else {
                            worker.send({
                              id: request.id,
                              result,
                              error: null
                            });
                          }
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
                  worker.register = function(methods, options) {
                    if (methods) {
                      for (var name in methods) {
                        if (methods.hasOwnProperty(name)) {
                          worker.methods[name] = methods[name];
                        }
                      }
                    }
                    if (options) {
                      worker.terminationHandler = options.onTerminate;
                    }
                    worker.send("ready");
                  };
                  worker.emit = function(payload) {
                    if (currentRequestId) {
                      if (payload instanceof Transfer) {
                        worker.send({
                          id: currentRequestId,
                          isEvent: true,
                          payload: payload.message
                        }, payload.transfer);
                        return;
                      }
                      worker.send({
                        id: currentRequestId,
                        isEvent: true,
                        payload
                      });
                    }
                  };
                  if (true) {
                    exports.add = worker.register;
                    exports.emit = worker.emit;
                  }
                }
              )
              /******/
            };
            var __webpack_module_cache__ = {};
            function __webpack_require__(moduleId) {
              var cachedModule = __webpack_module_cache__[moduleId];
              if (cachedModule !== void 0) {
                return cachedModule.exports;
              }
              var module2 = __webpack_module_cache__[moduleId] = {
                /******/
                // no module.id needed
                /******/
                // no module.loaded needed
                /******/
                exports: {}
                /******/
              };
              __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
              return module2.exports;
            }
            var __webpack_exports__ = {};
            !function() {
              var exports2 = __webpack_exports__;
              var environment = __webpack_require__(828);
              exports2.pool = function pool(script, options) {
                var Pool = __webpack_require__(345);
                return new Pool(script, options);
              };
              exports2.worker = function worker2(methods, options) {
                var worker3 = __webpack_require__(744);
                worker3.add(methods, options);
              };
              exports2.workerEmit = function workerEmit(payload) {
                var worker2 = __webpack_require__(744);
                worker2.emit(payload);
              };
              exports2.Promise = __webpack_require__(219);
              exports2.Transfer = __webpack_require__(577);
              exports2.platform = environment.platform;
              exports2.isMainThread = environment.isMainThread;
              exports2.cpus = environment.cpus;
            }();
            return __webpack_exports__;
          }()
        );
      });
    }
  });

  // src/utils/math.tsx
  var import_fraction = __toESM(require_fraction());
  var import_table = __toESM(require_src());
  var ZERO = new import_fraction.default(0);
  var ONE = new import_fraction.default(1);
  var EMPTY_PMF = /* @__PURE__ */ new Map([[0, ONE]]);
  var zero_pmf = () => /* @__PURE__ */ new Map([[0, ONE]]);
  var shiftPMF = (pmf, shift) => new Map([...pmf.entries()].map(([k, v]) => [k + shift, v]));
  var clean_zeros = (pmf) => new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));
  var clean_jpm = (map) => new Map([...map.entries()].filter(([_, v]) => v.size !== 0));
  var parseDiceStrings = ({
    diceStrings,
    crit
  }) => {
    const dice = diceStrings.map(
      (damage) => [
        ...damage.matchAll(
          /(?<sign>[+-]?)?(?<count>\d*)((?<dice>d)(?<face>\d+)(?<op>kh|kl)?)?/gi
        )
      ].filter((match) => match[0]).map((match) => {
        const g = match.groups;
        return {
          positive: !g?.sign?.includes("-"),
          count: Number(g?.count?.trim() ?? 1),
          face: Number(g?.face?.trim()),
          op: g?.op,
          dice: !!g?.dice
        };
      })
    ).flat();
    dice.forEach((d) => {
      if (crit === "raw" && d.dice) {
        d.count *= 2;
      }
    });
    return { dice };
  };
  var numberRange = (start, end) => new Array(end - start).fill(void 0).map((d, i) => i + start);
  var add_pmfs = (pmfX_, pmfY_, add) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const absMin = Math.min(...pmfX.keys(), ...pmfY.keys()) - (add ? 0 : Math.max(...pmfY.keys()));
    const absMax = Math.max(...pmfX.keys()) + Math.max(...pmfY.keys());
    const R = numberRange(absMin, absMax + 1);
    const jointProbMap = clean_jpm(
      new Map(
        R.map((valX) => [
          valX.toString(),
          clean_zeros(
            new Map(
              R.map((valY) => [
                valY,
                (pmfX.get(valX) ?? ZERO).mul(pmfY.get(valY) ?? ZERO)
              ])
            )
          )
        ])
      )
    );
    const pmf = /* @__PURE__ */ new Map();
    [...jointProbMap.entries()].forEach(([x, xPMF]) => {
      [...xPMF.entries()].forEach(([y, prob]) => {
        const k = add ? Number(x) + Number(y) : Number(x) - Number(y);
        pmf.set(k, (pmf.get(k) ?? ZERO).add(prob));
      });
    });
    return pmf;
  };
  var make_pmf = (diceFace, advantage = 0, pos = true) => {
    if (advantage === 0) {
      return new Map(
        [...Array(diceFace).keys()].map((i) => [i + 1, new import_fraction.default(1, diceFace)])
      );
    }
    const A = Math.abs(advantage) + 1;
    const x = [...Array(diceFace).keys()].map((v) => v + 1).map(
      (v) => [v, new import_fraction.default(v ** A - (v - 1) ** A, diceFace ** A)]
    );
    const basePMF = new Map(
      [...x.map(([k, v]) => [advantage > 0 ? k : diceFace - k + 1, v])].sort(
        ([kl, _], [kr, __]) => kl < kr ? -1 : 1
      )
    );
    if (pos === false) {
      return add_pmfs(zero_pmf(), basePMF, false);
    }
    return basePMF;
  };
  var printPMF = (pmf) => {
    console.log(
      new Map(
        [...pmf.entries()].sort(([kl, _vl], [kr, _vr]) => kl - kr).map(([k, v]) => [k, new import_fraction.default(v).valueOf().toFixed(6)])
      )
    );
    console.log(
      `SUM: ${[...pmf.values()].reduce((acc, n) => acc.add(n), ZERO).toString()}`
    );
  };
  var computeCritChance = ({
    advantage,
    critFaces
  }) => {
    if (advantage === 0) {
      return new import_fraction.default(critFaces, 20);
    }
    if (advantage > 0) {
      return ONE.sub(new import_fraction.default(20 - critFaces, 20).pow(1 + advantage));
    }
    return new import_fraction.default(
      critFaces,
      20
    ).pow(1 + Math.abs(advantage));
  };
  var computeDicePMFs = (dice) => {
    let pmfs;
    if (!dice.dice) {
      pmfs = [/* @__PURE__ */ new Map([[Number(dice.count), ONE]])];
    } else if (dice.op === "kh" || dice.op === "kl") {
      const c = Number(dice.count);
      pmfs = [
        make_pmf(Number(dice.face), dice.op === "kh" ? c : -c, dice.positive)
      ];
    } else {
      pmfs = [...Array(Number(dice.count) || 1).keys()].map(
        () => make_pmf(Number(dice.face), 0, dice.positive)
      );
    }
    console.log("making dice pmf");
    console.log(dice);
    console.log(pmfs);
    return {
      ...dice,
      pmf: pmfs.reduce((acc, n) => add_pmfs(acc, n, true), EMPTY_PMF)
    };
  };
  var combineDice = (formula) => {
    console.log(`combining ${formula.dice.toString()}`);
    const pmf = formula.dice.map(computeDicePMFs).flat().map((x) => x).reduce((acc, n) => add_pmfs(acc, n.pmf, true), EMPTY_PMF);
    return { ...formula, pmf };
  };
  var weighted_mean_pmf = (pmf) => [...pmf.entries()].reduce(
    (acc, [d, p]) => acc.add(new import_fraction.default(d).mul(p)),
    ZERO
  );
  var jointProbPMFs = (jpm_pmfs) => {
    console.log("Combining damage PMFs");
    const data = [
      ["Name", "Damage", "Chance"],
      ...jpm_pmfs.map(({ pmf: pmf2, chance, name }) => [name, weighted_mean_pmf(pmf2).toString(), chance.toString()])
    ];
    console.log((0, import_table.table)(data));
    const pmf = /* @__PURE__ */ new Map();
    const keySet = /* @__PURE__ */ new Set([...jpm_pmfs.map((jp) => [...jp.pmf.keys()]).flat(2)]);
    console.log({ keySet });
    [...keySet].forEach(
      (k) => pmf.set(
        k,
        jpm_pmfs.reduce((acc, n) => acc.add((n.pmf.get(k) || ZERO).mul(n.chance)), ZERO)
      )
    );
    console.log("REs");
    printPMF(pmf);
    return pmf;
  };

  // src/modules/damage/constants.tsx
  var modifierIndex = 0;
  var defaultModifierOptions = [
    { label: "Bless [+1d4]", value: (modifierIndex++).toString() },
    { label: "Bane [-1d4]", value: (modifierIndex++).toString() },
    {
      label: "S:DS Favored by the Gods [+2d4]",
      value: (modifierIndex++).toString()
    },
    {
      label: "C:PC Emboldening Bond [+1d4]",
      value: (modifierIndex++).toString()
    },
    {
      label: "D:S Cosmic Omen (Weal) [+1d4]",
      value: (modifierIndex++).toString()
    }
  ];
  var ACs = numberRange(1, 30 + 1);

  // src/modules/damage2/mathWorker.ts
  var import_fraction2 = __toESM(require_fraction());
  var import_workerpool = __toESM(require_workerpool());
  var normalizePMF = (pmf) => Object.fromEntries(
    [...pmf.entries()].filter(([num, frac]) => !frac.equals(ZERO)).map(([num, frac]) => [num, frac.toFraction()])
  );
  var normalizePMFMess = (pmf) => Object.fromEntries(
    [...pmf.entries()].filter(([num, frac]) => !frac.equals(ZERO)).map(([num, frac]) => [num, frac.toString()])
  );
  var normalizeDamagePMFByAC = (damagePMFByAC) => Object.fromEntries(
    [...damagePMFByAC.entries()].map(([ac, pmf]) => [ac, normalizePMF(pmf)])
  );
  var normalizeDamagePMFByACMess = (damagePMFByAC) => Object.fromEntries(
    [...damagePMFByAC.entries()].map(([ac, pmf]) => [ac, normalizePMFMess(pmf)])
  );
  var cumSumHits = (pmf) => {
    let acc = new import_fraction2.default(0);
    const cumSum = new Map(
      [...pmf.entries()].sort(([lk, lv], [rk, rv]) => lk - rk).map(([val, p]) => [val + 1, acc = acc.add(p)])
    );
    const minKey = Math.min(...cumSum.keys());
    const maxKey = Math.max(...cumSum.keys());
    if (minKey > 1) {
      numberRange(1, minKey).forEach((e) => {
        cumSum.set(e, ZERO);
      });
    }
    if (maxKey < 30) {
      numberRange(maxKey, 30).forEach((e) => {
        cumSum.set(e, cumSum.get(maxKey));
      });
    }
    return cumSum;
  };
  function computeDamagePmf({
    hitDamagePMF,
    missDamagePMF,
    damageOnFirstHitPMF,
    critDamageOnFirstHitPMF,
    critDamagePMF,
    rollUnderChance,
    critChance,
    critFailChance,
    noCritsChance,
    damagerMetadata
  }) {
    const nonCritFactor = ONE.sub(noCritsChance);
    const critSum = critFailChance.add(critChance);
    console.log({ allCritFaceCount: nonCritFactor });
    console.log({ nonCritFactor });
    console.log({ critSum });
    console.log({ rollUnderChance });
    const regularMissChance = nonCritFactor.mul(rollUnderChance);
    console.log({ regularMissChance });
    const hitChance = ONE.sub(critChance).sub(critFailChance).sub(regularMissChance);
    const missChance = regularMissChance.add(critFailChance);
    console.log("hitDamagePMF");
    printPMF(hitDamagePMF);
    console.log("missDamagePMF");
    printPMF(missDamagePMF);
    console.log("critDamagePMF");
    printPMF(critDamagePMF);
    const pmfs = [
      { name: "Hit", pmf: hitDamagePMF, chance: hitChance },
      { name: "Miss", pmf: missDamagePMF, chance: regularMissChance },
      { name: "Crit Miss", pmf: missDamagePMF, chance: critFailChance },
      { name: "Crit", pmf: critDamagePMF, chance: critChance }
    ];
    return numberRange(1, damagerMetadata.attackCount + 1).reduce((acc, n) => {
      const damagePMF = add_pmfs(acc, jointProbPMFs(pmfs), true);
      return damagePMF;
    }, zero_pmf());
  }
  var computeDamageInfo = (damagerMetadata) => {
    console.log("cdi");
    console.log(damagerMetadata);
    const attackRoll = combineDice(
      parseDiceStrings({ diceStrings: damagerMetadata.attack })
    );
    const allCritFaceCount = damagerMetadata.critFaceCount + damagerMetadata.critFailFaceCount;
    let op;
    if (damagerMetadata.advantage > 0) {
      op = "kh";
    } else if (damagerMetadata.advantage < 0) {
      op = "kl";
    }
    console.log({ op });
    const attackRollBase = computeDicePMFs({
      positive: true,
      count: Math.abs(damagerMetadata.advantage),
      face: 20 - allCritFaceCount,
      op,
      dice: true
    });
    const singleDiceAttackRollBase = computeDicePMFs({
      positive: true,
      count: 1,
      face: 20 - allCritFaceCount,
      op: void 0,
      dice: true
    });
    console.log("attack roll ");
    printPMF(attackRollBase.pmf);
    const critChance = computeCritChance({
      advantage: damagerMetadata.advantage,
      critFaces: damagerMetadata.critFaceCount
    });
    console.log({ critChance });
    const critFailChance = computeCritChance({
      advantage: -damagerMetadata.advantage,
      critFaces: damagerMetadata.critFailFaceCount
    });
    console.log({ critFailChance });
    const noCritsChance = computeCritChance({
      advantage: damagerMetadata.advantage,
      critFaces: damagerMetadata.critFailFaceCount + damagerMetadata.critFaceCount
    });
    const finalAttackRoll = add_pmfs(
      shiftPMF(attackRollBase.pmf, damagerMetadata.critFaceCount),
      attackRoll.pmf,
      true
    );
    console.log("final attack roll pmf...");
    printPMF(finalAttackRoll);
    const missChanceByACNonCrit = cumSumHits(finalAttackRoll);
    console.log("missChanceByACNonCrit.");
    printPMF(missChanceByACNonCrit);
    const hitDamagePMF = combineDice(
      parseDiceStrings({ diceStrings: damagerMetadata.damage })
    ).pmf;
    const critDamagePMF = combineDice(
      parseDiceStrings({ diceStrings: damagerMetadata.damage, crit: "raw" })
    ).pmf;
    const missDamagePMF = combineDice(
      parseDiceStrings({ diceStrings: [damagerMetadata.damageOnMiss] })
    ).pmf || zero_pmf();
    const damageOnFirstHitPMF = combineDice(
      parseDiceStrings({ diceStrings: [damagerMetadata.damageOnFirstHit] })
    ).pmf || zero_pmf();
    const critDamageOnFirstHitPMF = combineDice(
      parseDiceStrings({
        diceStrings: [damagerMetadata.damageOnFirstHit],
        crit: "raw"
      })
    ).pmf;
    console.log({ damageOnFirstHitPMF });
    console.log(damagerMetadata.damageOnFirstHit);
    const damagePMFByAC = ACs.reduce((damageMap, ac) => {
      console.log(`======= COMPUTING AC ${ac} =======`);
      const rollUnderChance = missChanceByACNonCrit.get(ac) ?? ONE;
      console.log(`Roll under: ${rollUnderChance.toString()}`);
      const finalDamagePMF = computeDamagePmf({
        hitDamagePMF,
        missDamagePMF,
        damageOnFirstHitPMF,
        critDamagePMF,
        rollUnderChance,
        critDamageOnFirstHitPMF,
        critChance,
        critFailChance,
        noCritsChance,
        damagerMetadata
      });
      damageMap.set(ac, finalDamagePMF);
      return damageMap;
    }, /* @__PURE__ */ new Map());
    console.log("messy normalized");
    console.log(normalizeDamagePMFByACMess(damagePMFByAC));
    console.log("Normalized Damage PMF By AC:");
    console.log(normalizeDamagePMFByAC(damagePMFByAC));
    return {
      damagePMFByAC,
      damagerMetadata
    };
  };
  import_workerpool.default.worker({
    computeDamageInfo
  });
})();
/*! Bundled license information:

fraction.js/fraction.js:
  (**
   * @license Fraction.js v4.2.0 05/03/2022
   * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
   *
   * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
   * Dual licensed under the MIT or GPL Version 2 licenses.
   **)

workerpool/dist/workerpool.js:
  (**
   * workerpool.js
   * https://github.com/josdejong/workerpool
   *
   * Offload tasks to a pool of workers on node.js and in the browser.
   *
   * @version 6.4.0
   * @date    2023-02-24
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
   *)
*/
