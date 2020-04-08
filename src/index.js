const Helpers = require("./helpers.js");
const Internal = require("./internal.js");
const address = require("./constant/address.js");
const ABI = require("./constant/abi.js");
const token = require("./constant/token.js");

module.exports = class DSA {
  constructor() {
    this.address = address;
    this.ABI = ABI;
    this.token = token;
    this.instance = {
      id: 0,
      address: _address.genesis,
      version: 1,
      origin: _address.genesis,
    };
    this.helpers = new Helpers();
    this.internal = new Internal();
  }

  /**
   * sets the current DSA ID
   */
  setInstance(_o) {
    if (_o.id) this.instance.id = _o.id; // DSA ID
    if (_o.address) this.instance.address = _o.address;
    if (_o.version) this.instance.version = _o.version;
    if (_o.origin) this.instance.origin = _o.origin;
  }

  /**
   * build new DSA
   */
  async build(_d) {
    let _addr = await this.internal.getAddress();
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _addr;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = this.instance.origin;
    if (!_d.from) _d.from = _addr;
    var _c = await new web3.eth.Contract(
      this.ABI.core.index,
      this.address.core.index
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .build(_d.owner, _d.version, _d.origin)
        .send(_d)
        .on("transactionHash", (txHash) => {
          resolve(txHash);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  /**
   * global number of DSAs
   */
  async count() {
    var _c = new web3.eth.Contract(this.ABI.core.list, this.address.core.list);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .accounts()
        .call({ from: this.address.genesis })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   */
  async getAccounts(_owner) {
    if (!_owner) _owner = await this.internal.getAddress();
    var _c = new web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .getOwnerDetails(_owner)
        .call({ from: this.address.genesis })
        .then((_d) => {
          var _l = _d.IDs.length;
          var accounts = [];
          for (var i = 0; i < _l; i++) {
            accounts.push({
              id: _d.IDs[i],
              address: _d.accounts[i],
              version: _d.versions[i],
            });
          }
          resolve(accounts);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getAuthById(_id) {
    var _c = new web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .getIDOwners(_id)
        .call({ from: this.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getAuthByAddress(_addr) {
    var _c = new web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .getAccountOwners(_addr)
        .call({ from: this.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * execute all the spells
   */
  async cast(_d) {
    let _addr = await this.internal.getAddress();
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.from) _d.from = _addr;
    let _espell = this.internal.encodeSpells(_d);
    let _ta = _espell[0];
    let _eda = _espell[1];
    let _o = this.instance.origin;
    var _c = new web3.eth.Contract(
      this.ABI.core.account,
      this.instance.address
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .cast(_ta, _eda, _o)
        .send(_d)
        .on("transactionHash", (txHash) => {
          resolve(txHash);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  /**
   * estimate cast gas cost
   */
  async estimateCastGas(_d) {
    var _internal = this.internal;
    var _args = _internal.encodeSpells(_d);
    _args.push(this.instance.origin);
    if (!_d.to) _d.to = this.instance.address;
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
    return new Promise(async function (resolve, reject) {
      await _internal
        .estimateGas(_obj)
        .then((gas) => {
          console.log(gas);
          resolve(gas);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * creating a new spell instance
   */
  Spell() {
    return new (class Spell {
      /**
       * empty spells array
       */
      constructor() {
        this.spells = [];
      }

      /**
       * add new spells
       */
      add(_s) {
        if (!_s.connector) return console.error(`connector not defined.`);
        if (!_s.method) return console.error(`method not defined.`);
        if (!_s.args) return console.error(`args not defined.`);
        this.spells.push(_s);
      }
    })();
  }

  /**
   * to call read functions and get raw data return
   */
  async read(_s) {
    var _c = new web3.eth.Contract(
      this.ABI.read[_s.protocol],
      this.address.read[_s.protocol]
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods[_s.method](..._s.args)
        .call()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
