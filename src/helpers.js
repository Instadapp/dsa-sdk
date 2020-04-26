module.exports = class Helpers {
  constructor(_dsa) {
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
  }

  cleanAddress(address) {
    return address.slice(0, 4) + "..." + address.slice(-4);
  }

  cleanTxn(txHash) {
    return txHash.slice(0, 6) + "..." + txHash.slice(-6);
  }

  cleanDecimal(num, power) {
    var MUL_DIV = 100;
    if (power) {
      MUL_DIV = 10 ** power;
    }
    return Math.floor(Number(num) * MUL_DIV) / MUL_DIV;
  }

  divWithDec(num, power) {
    power = power ? power : 0;
    return Number(num) / 10 ** power;
  }

  getAddress(token) {
    var isAddress = this.web3.utils.isAddress(token.toLowerCase());
    if (isAddress) {
      return this.web3.utils.toChecksumAddress(token.toLowerCase());
    } else {
      if (Object.keys(this.tokens.info).indexOf(token.toLowerCase()) == -1)
        throw new Error("'token' symbol not found.");
      return this.web3.utils.toChecksumAddress(
        this.tokens.info[token.toLowerCase()].address
      );
    }
  }

  cleanNumber(num) {
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
    return x;
  }
};
