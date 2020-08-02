import {getWeb3} from '../getWeb3'
export const CALL = 0;
export const DELEGATE_CALL = 1;
export const TX_TYPE_EXECUTION = "execution";
export const TX_TYPE_CONFIRMATION = "confirmation";

const web3 = getWeb3();

export const getApprovalTransaction = async ({
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
}) => {
  const txHash = await safeInstance.methods
    .getTransactionHash(to, valueInWei, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce)
    .call({
      from: sender,
    })

  try {
    return safeInstance.methods.approveHash(txHash)
  } catch (err) {
    console.error(`Error while approving transaction: ${err}`)
    throw err
  }
}

export const getExecutionTransaction = async ({
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
}) => {
  try {
    const contract = new web3.eth.Contract(
      GnosisSafeSol.abi,
      safeInstance.address
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
};
