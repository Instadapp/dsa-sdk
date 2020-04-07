module.exports = class Helpers {
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

  // var _d = {
  //   from:,
  //   to:,
  //   abi:,
  //   args:,
  //   value:,
  // }
  async getGasLimit(_d) {
    var encodeHash = web3.eth.abi.encodeFunctionCall(_d.abi, _d.args);
    return await web3.eth
      .estimateGas({
        from: _d.from,
        to: _d.to,
        data: encodeHash,
        value: _d.value,
      })
      .then((gas) => {
        resolve(gas);
      })
      .catch((err) => {
        reject({
          error: err,
          data: {
            abi: _d.abi,
            args: _d.args,
            from: _d.from,
            to: _d.to,
            data: encodeHash,
            value: _d.value,
          },
        });
        console.log(err);
      });
  }
};
