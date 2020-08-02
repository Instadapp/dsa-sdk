import axios from "axios";

import { getTxServiceHost, getTxServiceUriFrom } from "../config/index";
import { getWeb3 } from "../getWeb3";

const web3 = getWeb3();

const calculateBodyFrom = async (
  safeInstance,
  to,
  valueInWei,
  data,
  operation,
  nonce,
  safeTxGas,
  baseGas,
  gasPrice,
  gasToken,
  refundReceiver,
  transactionHash,
  sender,
  origin,
  signature
) => {
  const contractTransactionHash = await safeInstance.methods
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
    .call();

  return {
    to: web3.utils.toChecksumAddress(to),
    value: valueInWei,
    data,
    operation,
    nonce,
    safeTxGas,
    baseGas,
    gasPrice,
    gasToken,
    refundReceiver,
    contractTransactionHash,
    transactionHash,
    sender: web3.utils.toChecksumAddress(sender),
    origin,
    signature,
  };
};

export const buildTxServiceUrl = async (safeAddress) => {
  const host = getTxServiceHost();
  const address = web3.utils.toChecksumAddress(safeAddress);
  const base = getTxServiceUriFrom(address);
  return `${host}${base}?has_confirmations=True`;
};

export const saveTxToHistory = async ({
  baseGas,
  data,
  gasPrice,
  gasToken,
  nonce,
  operation,
  origin,
  refundReceiver,
  safeInstance,
  safeTxGas,
  sender,
  signature,
  to,
  txHash,
  valueInWei,
}) => {
  const url = buildTxServiceUrl(safeInstance.address);
  const body = await calculateBodyFrom(
    safeInstance,
    to,
    valueInWei,
    data,
    operation,
    nonce,
    safeTxGas,
    baseGas,
    gasPrice,
    gasToken,
    refundReceiver,
    txHash || null,
    sender,
    origin || null,
    signature
  );
  const response = await axios.post(url, body);
  const SUCCESS_STATUS = 201; // CREATED status

  if (response.status !== SUCCESS_STATUS) {
    return Promise.reject(new Error("Error submitting the transaction"));
  }

  return Promise.resolve();
};
