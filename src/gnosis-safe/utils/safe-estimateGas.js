const BigNumber = require("bignumber.js");

module.exports = class GasEstimate {
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.transactionsHelpers = _dsa.transactionsHelpers;
  }

  estimateDataGasCosts(data) {
    const reducer = (accumulator, currentValue) => {
      if (currentValue === "0x") {
        return accumulator + 0;
      }
      if (currentValue === "00") {
        return accumulator + 4;
      }
      return accumulator + 16;
    };
    return data.match(/.{2}/g).reduce(reducer, 0);
  }

  async estimateSafeTxGas(safe, safeAddress, data, to, valueInWei, operation) {
    return new Promise(async (resolves, reject) => {
      try {
        let safeInstance = safe;
        if (!safeInstance) {
          safeInstance = await this.transactionsHelpers.getGnosisSafeInstanceAt(
            safeAddress
          );
        }
        const estimateData = safeInstance.methods
          .requiredTxGas(to, valueInWei, data, operation)
          .encodeABI();
        const estimateResponse = await this.web3.eth.call({
          to: safeAddress,
          from: safeAddress,
          data: estimateData,
        });
        const txGasEstimation =
          new BigNumber(estimateResponse.substring(138), 16).toNumber() + 10000;

        // 21000 - additional gas costs (e.g. base tx costs, transfer costs)
        const dataGasEstimation =
          this.estimateDataGasCosts(estimateData) + 21000;
        const additionalGasBatches = [
          10000,
          20000,
          40000,
          80000,
          160000,
          320000,
          640000,
          1280000,
          2560000,
          5120000,
        ];

        const batch = new this.web3.BatchRequest();
        const estimationRequests = additionalGasBatches.map(
          (additionalGas) =>
            new Promise((resolve) => {
              // there are no type definitions for .request, so for now ts-ignore is there
              // Issue link: https://github.com/ethereum/web3.js/issues/3144
              // eslint-disable-next-line
              // @ts-ignore
              const request = this.web3.eth.call.request(
                {
                  to: safeAddress,
                  from: safeAddress,
                  data: estimateData,
                  gasPrice: 0,
                  gasLimit: txGasEstimation + dataGasEstimation + additionalGas,
                },
                (error, res) => {
                  // res.data check is for OpenEthereum/Parity revert messages format
                  const isOpenEthereumRevertMsg =
                    res && typeof res.data === "string";

                  const isEstimationSuccessful =
                    !error &&
                    ((typeof res === "string" && res !== "0x") ||
                      (isOpenEthereumRevertMsg && res.data.slice(9) !== "0x"));

                  resolve({
                    success: isEstimationSuccessful,
                    estimation: txGasEstimation + additionalGas,
                  });
                }
              );

              batch.add(request);
            })
        );
        batch.execute();

        const estimationResponses = await Promise.all(estimationRequests);
        const firstSuccessfulRequest = estimationResponses.find(
          (res) => res.success
        );

        if (firstSuccessfulRequest) {
          return resolves(firstSuccessfulRequest.estimation);
        }

        reject("Transaction might fail.");
      } catch (error) {
        reject("Error calculating tx gas estimation", error);
      }
    });
  }
};
