const Helpers = require("./helpers.js");
const { address, ABI, token } = require("./constant.js");

module.exports = class Internal {

    constructor() {
        this.ABI = ABI;
        this.address = address;
        this.token = token;
        this.helpers = new Helpers();
      }

      /**
   * returns the input interface required for cast()
   */
  getTarget(_co) {
    const _t = address.connectors[_co];
    if (_t) return _t;
    else return console.error(`${_co} is invalid connector.`);
  }

    /**
     * returns the input interface required for cast()
     */
    getInterface(_type, _co, _m) {
        const _abi = ABI[_type][_co];
        for (let i = 0; i < _abi.length; i++) {
            if (_abi[i].name == _m) {
                return _abi[i];
            }
        }
        return console.error(`${_m} is invalid method.`);
    }

    /**
   * returns encoded data of delegate call
   */
  encodeMethod(_d) {
    const _co = _d.connector;
    const _m = _d.method;
    const _a = _d.args; // []
    const _i = this.getInterface("connector", _co, _m);
    return web3.eth.abi.encodeFunctionCall(_i, _a);
  }

  packSpells(_d) {
    let _s;
    if (Array.isArray(_d.spells)) {
      _s = _d.spells; // required
    } else {
      _s = _d.spells.spells; // required
    }
    let _ta = []
    let _eda = [];
    for (let i = 0; i < _s.length; i++) {
      _ta.push(this.getTarget(_s[i].connector));
      _eda.push(this.encodeMethod(_s[i]));
    }
    return [_ta, _eda];
  }

}