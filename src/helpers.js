const helpers = {
  cleanAddress: function (address) {
    return address.slice(0, 4) + "..." + address.slice(-4);
  },

  cleanTxn: function (txHash) {
    return txHash.slice(0, 6) + "..." + txHash.slice(-6);
  },

  cleanDecimal: function (num, power) {
    var MUL_DIV = 100;
    if (power) {
      MUL_DIV = 10 ** power;
    }
    return Math.floor(Number(num) * MUL_DIV) / MUL_DIV;
  },

  cleanNumber: function (num) {
    if (num > 1000000) {
      var _num = cleanDecimal(num / 1000000);
      return `${_num.toLocaleString()} M`;
    } else if (num > 10000) {
      var _num = cleanDecimal(num / 1000);
      return `${_num.toLocaleString()} K`;
    } else if (!num) {
      return "0.00";
    }
    return cleanDecimal(num).toLocaleString();
  },

  bigNumInString: function (x) {
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
    return x;
  },
};
