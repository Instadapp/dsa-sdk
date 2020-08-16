/**
 * cast helpers
 */
module.exports = class CastHelper {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.origin = _dsa.origin;
    this.dsa = _dsa;
  }

  /**
   * returns cast encoded data
   * @param _d.connector the from address
   * @param _d.method the to address
   */
  encoded(_d) {
    var _internal = this.internal;
    var _args = _internal.encodeSpells(_d);
    return {
      targets: _args[0],
      spells: _args[1],
    };
  }

  /**
   * returns the estimate gas cost
   * @param _d.from the from address
   * @param _d.to the to address
   * @param _d.value eth value
   * @param _d.spells cast spells
   */
  async estimateGas(_d) {
    var _internal = this.internal;
    var _args = _internal.encodeSpells(_d);
    _args.push(this.origin);
    if (!_d.to) _d.to = this.instance.address;
    if (_d.to == this.address.genesis)
      throw new Error(
        `Please configure the DSA instance by calling dsa.setInstance(dsaId). More details: https://docs.instadapp.io/setup`
      );
    if (!_d.from) _d.from = await _internal.getAddress();
    if (!_d.value) _d.value = "0";
    var _abi = _internal.getInterface("core", "account", "cast");
    var _obj = {
      abi: _abi,
      args: _args,
      from: _d.from,
      to: _d.to,
      value: _d.value,
    };
    return new Promise((resolve, reject) => {
      _internal
        .estimateGas(_obj)
        .then((gas) => {
          resolve(gas);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns the encoded cast ABI byte code to send via a transaction or call.
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   * @param _d.to (optional) the address of the smart contract to call
   * @param _d.origin (optional) the transaction origin source
   */
  encodeABI(_d) {
    let _enodedSpell = this.internal.encodeSpells(_d);
    if (!_d.to) _d.to = this.instance.address;
    if (_d.to == this.address.genesis)
      throw new Error(
        `Please configure the DSA instance by calling dsa.setInstance(dsaId). More details: https://docs.instadapp.io/setup`
      );
    if (!_d.origin) _d.origin = this.origin;
    let _contract = new this.web3.eth.Contract(this.ABI.core.account, _d.to);
    return _contract.methods.cast(..._enodedSpell, _d.origin).encodeABI();
  }
};
