/**
 * account resolver
 */
module.exports = class Account {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.internal = _dsa.internal;
  }

  /**
   * global number of DSAs
   */
  async count() {
    var _c = new this.web3.eth.Contract(
      this.ABI.core.list,
      this.address.core.list
    );
    return new Promise((resolve, reject) => {
      return _c.methods
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
   * returns accounts in a simple array of objects for addresses owned by the address
   * @param _authority the ethereum address or .eth name
   */
  async getAccounts(_authority) {
    if (_authority.includes(".eth"))
      _authority = await this.internal.web3.eth.ens.getAddress(_authority);
    if (!_authority) _authority = await this.internal.getAddress();
    var _c = new this.web3.eth.Contract(
      this.ABI.read.core,
      this.address.read.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAuthorityDetails(_authority)
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

  /**
   * returns accounts in a simple array of objects
   * @param _id the DSA number
   */
  async getAuthById(_id) {
    var _c = new this.web3.eth.Contract(
      this.ABI.read.core,
      this.address.read.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getIDAuthorities(_id)
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
   * returns accounts in a simple array of objects
   * @param _addr the DSA address
   */
  async getAuthByAddress(_addr) {
    var _c = new this.web3.eth.Contract(
      this.ABI.read.core,
      this.address.read.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAccountAuthorities(_addr)
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
   * returns authorities with its type in a simple array of objects.
   * @param dsaAddr the DSA address
   */
  async getAuthoritiesTypes(dsaAddr) {
    var _c = new this.web3.eth.Contract(
      this.ABI.read.core,
      this.address.read.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAccountAuthoritiesTypes(dsaAddr)
        .call({ from: this.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
