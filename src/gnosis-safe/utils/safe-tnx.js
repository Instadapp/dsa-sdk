const axios = require("axios");

module.exports = class TransactionHelpers {
  constructor(_dsa) {
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.ABI = _dsa.ABI;
    this.apiHelpers = _dsa.apiHelpers;
  }

  async getGnosisSafeInstanceAt(safeAddress) {
    return await new this.web3.eth.Contract(
      this.ABI.gnosisSafe.abi,
      safeAddress
    );
  }

  async getLastTx(safeAddress) {
    try {
      const url = await this.apiHelpers.buildTxServiceUrl(safeAddress);
      const response = await axios.get(url, { params: { limit: 1 } });
      return response.data.results[0] || null;
    } catch (e) {
      console.error("failed to retrieve last Tx from server", e);
      return null;
    }
  }

  async getNewTxNonce(txNonce, lastTx, safeInstance) {
    if (!Number.isInteger(Number.parseInt(txNonce, 10))) {
      return lastTx === null
        ? // use current's safe nonce as fallback
          (await safeInstance.methods.nonce().call()).toString()
        : `${lastTx.nonce + 1}`;
    }
    return txNonce;
  }

  async shouldExecuteTransaction(safeInstance, nonce, lastTx) {
    const threshold = await safeInstance.methods.getThreshold().call();

    // Tx will automatically be executed if and only if the threshold is 1
    if (Number(threshold) === 1) {
      const isFirstTransaction = Number.parseInt(nonce) === 0;
      // if the previous tx is not executed, it's delayed using the approval mechanisms,
      // once the previous tx is executed, the current tx will be available to be executed
      // by the user using the exec button.
      const canExecuteCurrentTransaction = lastTx && lastTx.isExecuted;

      return isFirstTransaction || canExecuteCurrentTransaction;
    }
    return false;
  }

  async getApprovalTransaction({
    baseGas,
    data,
    gasPrice,
    gasToken,
    nonce,
    operation,
    refundReceiver,
    safeInstance,
    safeTxGas,
    sender,
    to,
    valueInWei,
  }) {
    const txHash = await safeInstance.methods
      .getTransactionHash(
        to,
        valueInWei,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce
      )
      .call({
        from: sender,
      });

    try {
      return safeInstance.methods.approveHash(txHash);
    } catch (err) {
      console.error(`Error while approving transaction: ${err}`);
      throw err;
    }
  }

  async getExecutionTransaction({
    baseGas,
    data,
    gasPrice,
    gasToken,
    operation,
    refundReceiver,
    safeInstance,
    safeTxGas,
    sigs,
    to,
    valueInWei,
  }) {
    try {
      const web3 = this.web3;
      const contract = new web3.eth.Contract(
        this.ABI.gnosisSafe.abi,
        safeInstance._address
      );

      return contract.methods.execTransaction(
        to,
        valueInWei,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        sigs
      );
    } catch (err) {
      console.error(`Error while creating transaction: ${err}`);
      throw err;
    }
  }
};
