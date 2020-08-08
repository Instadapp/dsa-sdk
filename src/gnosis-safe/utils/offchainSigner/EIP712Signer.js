module.exports = class EIP712Signer {
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.EIP712_NOT_SUPPORTED_ERROR_MSG = "ETH_SIGN_NOT_SUPPORTED";
  }
  async generateTypedDataFrom({
    baseGas,
    data,
    gasPrice,
    gasToken,
    nonce,
    operation,
    refundReceiver,
    safeAddress,
    safeTxGas,
    to,
    valueInWei,
  }) {
    const typedData = {
      types: {
        EIP712Domain: [
          {
            type: "address",
            name: "verifyingContract",
          },
        ],
        SafeTx: [
          { type: "address", name: "to" },
          { type: "uint256", name: "value" },
          { type: "bytes", name: "data" },
          { type: "uint8", name: "operation" },
          { type: "uint256", name: "safeTxGas" },
          { type: "uint256", name: "baseGas" },
          { type: "uint256", name: "gasPrice" },
          { type: "address", name: "gasToken" },
          { type: "address", name: "refundReceiver" },
          { type: "uint256", name: "nonce" },
        ],
      },
      domain: {
        verifyingContract: safeAddress,
      },
      primaryType: "SafeTx",
      message: {
        to,
        value: valueInWei,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce: Number(nonce),
      },
    };

    return typedData;
  }

  getEIP712Signer(version) {
    return async (txArgs) => {
      const typedData = await this.generateTypedDataFrom(txArgs);

      let method = "eth_signTypedData_v3";
      if (version === "v4") {
        method = "eth_signTypedData_v4";
      }
      if (!version) {
        method = "eth_signTypedData";
      }

      const jsonTypedData = JSON.stringify(typedData);
      const signedTypedData = {
        jsonrpc: "2.0",
        method,
        params:
          version === "v3" || version === "v4"
            ? [txArgs.sender, jsonTypedData]
            : [jsonTypedData, txArgs.sender],
        from: txArgs.sender,
        id: new Date().getTime(),
      };

      const web3 = this.web3;

      return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(signedTypedData, (err, signature) => {
          if (err) {
            reject(err);
            return;
          }

          if (signature.result == null) {
            reject(new Error(EIP712_NOT_SUPPORTED_ERROR_MSG));
            return;
          }

          resolve(signature.result.replace("0x", ""));
        });
      });
    };
  }
};
