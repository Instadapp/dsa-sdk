const semverSatisfies = require("semver/functions/satisfies");
const APIHelpers = require("./utils/safe-api.js");
const TransactionsHelpers = require("./utils/safe-tnx.js");
const GasEstimate = require("./utils/safe-estimateGas.js");
const OffchainSigner = require("./utils/offchainSigner/index.js");
const Web3Helper = require("./utils/safe-provider.js");

module.exports = class GnosisSafe {
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.tokens = _dsa.tokens;
    this.address = _dsa.address;
    this.math = _dsa.math;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.dsa = _dsa;
    this.instance = _dsa.instance;
    this.origin = _dsa.origin;
    this.sendTxn = _dsa.sendTxn;
    this.internal = _dsa.internal;

    this.apiHelpers = new APIHelpers(this);
    this.web3Helper = new Web3Helper(this);
    this.transactionsHelpers = new TransactionsHelpers(this);
    this.gasEstimate = new GasEstimate(this);
    this.offchainSigner = new OffchainSigner(this);
  }

  async getSafeAddresses(address) {
    return await this.apiHelpers.getSafeAddresses(address);
  }

  async getSafeOwners(safeAddress) {
    let _safeAddress = safeAddress ? safeAddress : this.safeAddress;
    return await this.apiHelpers.getSafeOwners(_safeAddress);
  }

  /**
   * returns the estimate gas cost
   * @param _d.from the from address
   * @param _d.gnosisSafe the from address
   * @param _d.to the to address
   * @param _d.spells spells
   * @param _d.value the call ETH value
   *
   */
  async estimateGnosisSafeGas(_d) {
    if (!_d.to) _d.to = this.instance.address;
    if (_d.to == this.address.genesis)
      throw new Error(
        `Please configure the DSA instance by calling dsa.setInstance(dsaId, {gnosisSafe: Addr}). More details: https://docs.instadapp.io/setup`
      );
    if (!_d.from) _d.from = await this.internal.getAddress();
    if (!_d.value) _d.value = "0";
    let encodedSpellData = this.dsa.encodeCastABI(_d.spells);
    const _owners = await this.apiHelpers.getSafeOwners(
      this.web3.utils.toChecksumAddress(_d.gnosisSafe)
    );

    if (_owners.indexOf(this.web3.utils.toChecksumAddress(_d.from)) == "-1")
      throw new Error("'from' address is not owner of safe address");
    const safeInstance = await this.transactionsHelpers.getGnosisSafeInstanceAt(
      _d.gnosisSafe
    );
    return new Promise(async (resolve, reject) => {
      await this.gasEstimate
        .estimateSafeTxGas(
          safeInstance,
          _d.gnosisSafe,
          encodedSpellData,
          _d.to,
          _d.value,
          0
        )
        .then((gasLimit) => resolve(gasLimit))
        .catch((err) => reject(err));
    });
  }

  /**
   * returns the estimate gas cost
   * @param _d.to the to address
   * @param _d.from the from address
   * @param _d.spells spells
   * @param _d.value the call ETH value
   *
   */
  async encodeGnosisCastABI(_d) {
    if (!_d.to) _d.to = this.instance.address;
    if (_d.to == this.address.genesis)
      throw new Error(
        `Please configure the DSA instance by calling dsa.setInstance(dsaId, {gnosisSafe: Addr}). More details: https://docs.instadapp.io/setup`
      );

    if (!_d.from) _d.from = await this.internal.getAddress();
    if (!_d.value) _d.value = "0";
    let encodedSpellData = this.dsa.encodeCastABI(_d.spells);
    let MainSafeAddress = "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F";
    const contract = new this.web3.eth.Contract(
      this.ABI.gnosisSafe.abi,
      MainSafeAddress
    );

    const sigs = `0x000000000000000000000000${_d.from.replace(
      "0x",
      ""
    )}000000000000000000000000000000000000000000000000000000000000000001`;
    return contract.methods
      .execTransaction(
        _d.to,
        _d.value,
        encodedSpellData,
        0,
        9000000,
        0,
        0,
        this.address.genesis,
        this.address.genesis,
        sigs
      )
      .encodeABI();
  }

  /**
   * submit transaction with all the spells
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   * @param _d.origin (optional)
   * @param _d.to (optional)
   * @param _d.from (optional)
   * @param _d.value (optional)
   * @param _d.gasPrice (optional only for "browser" mode)
   * @param _d.gas (optional)
   * @param {number|string} _d.nonce (optional) txn nonce (mostly for node implementation)
   */
  submitTx = async (_d) => {
    const web3 = this.web3;
    const safeAddress = this.instance.config.gnosisSafe;
    if (!safeAddress)
      throw new Error(
        "`safeAddress` is not defined. Run `await dsa.setInstance(dsaId, { gnosisSafe: safeAddr })`"
      );
    const _addr = await this.internal.getAddress();
    const _espell = this.internal.encodeSpells(_d);
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.from) _d.from = _addr;
    if (!_d.origin) _d.origin = this.origin;
    _d.type = 1;

    let _c = new web3.eth.Contract(
      this.ABI.core.account,
      this.instance.address
    );
    _d.callData = _c.methods.cast(..._espell, _d.origin).encodeABI();

    let txObj = await this.internal.getTxObj(_d);
    return new Promise(async (resolve, reject) => {
      await this.createTransaction({
        safeAddress,
        from: txObj.from,
        to: txObj.to,
        valueInWei: txObj.value,
        txData: txObj.data,
      })
        .then((hash) => {
          resolve(hash);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  async createTransaction({
    safeAddress,
    to,
    from,
    valueInWei,
    txData = "0x",
    txNonce,
    operation = 0,
    origin = null,
  }) {
    return new Promise(async (resolve, reject) => {
      const _owners = await this.apiHelpers.getSafeOwners(safeAddress);
      if (_owners.indexOf(this.web3.utils.toChecksumAddress(from)) == "-1")
        throw new Error("'from' address is not owner of safe address");
      const {
        hardwareWallet,
        smartContractWallet,
      } = await this.web3Helper.getProviderInfo(from);
      const safeInstance = await this.transactionsHelpers.getGnosisSafeInstanceAt(
        safeAddress
      );
      const lastTx = await this.transactionsHelpers.getLastTx(safeAddress);
      const nonce = Number(
        await this.transactionsHelpers.getNewTxNonce(
          txNonce,
          lastTx,
          safeInstance
        )
      );
      const isExecution = await this.transactionsHelpers.shouldExecuteTransaction(
        safeInstance,
        nonce,
        lastTx
      );
      const safeVersion = await safeInstance.methods.VERSION().call();
      const safeTxGas = await this.gasEstimate.estimateSafeTxGas(
        safeInstance,
        safeAddress,
        txData,
        to,
        valueInWei,
        operation
      );

      // https://docs.gnosis.io/safe/docs/docs5/#pre-validated-signatures
      const sigs = `0x000000000000000000000000${from.replace(
        "0x",
        ""
      )}000000000000000000000000000000000000000000000000000000000000000001`;

      const txArgs = {
        safeInstance,
        to,
        valueInWei,
        data: txData,
        operation,
        nonce,
        safeTxGas,
        baseGas: 0,
        gasPrice: 0,
        gasToken: this.address.genesis,
        refundReceiver: this.address.genesis,
        sender: from,
        sigs,
      };

      try {
        // Here we're checking that safe contract version is greater or equal 1.1.1, but
        // theoretically EIP712 should also work for 1.0.0 contracts
        const canTryOffchainSigning =
          !isExecution &&
          !smartContractWallet &&
          semverSatisfies(
            safeVersion,
            this.offchainSigner.SAFE_VERSION_FOR_OFFCHAIN_SIGNATURES
          );
        if (canTryOffchainSigning) {
          const signature = await this.offchainSigner.tryOffchainSigning(
            { ...txArgs, safeAddress },
            hardwareWallet
          );
          if (signature) {
            await this.apiHelpers.saveTxToHistory({
              ...txArgs,
              signature,
              origin,
            });
            resolve({
              signature: signature,
            });
            return;
          }
        }

        const tx = isExecution
          ? await this.transactionsHelpers.getExecutionTransaction(txArgs)
          : await this.transactionsHelpers.getApprovalTransaction(txArgs);
        const sendParams = { from, value: 0 };
        await tx
          .send(sendParams)
          .once("transactionHash", async (hash) => {
            try {
              await Promise.all([
                this.apiHelpers.saveTxToHistory({ ...txArgs, hash, origin }),
              ]);
              resolve({
                txHash: hash,
              });
            } catch (e) {}
          })
          .on("error", (error) => {
            console.error("Tx error: ", error);
          });
      } catch (err) {
        reject(`Error creating the Tx.`);
      }
    });
  }
};
