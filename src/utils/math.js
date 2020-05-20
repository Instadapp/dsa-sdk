module.exports = class MathHelpers {
  constructor(_dsa) {
    this.web3 = _dsa.web3;
  }

  divWithDec(num, power) {
    power = power ? power : 0;
    return Number(num) / 10 ** power;
  }

  bigNumInString(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }
    return String(x);
  }
};
