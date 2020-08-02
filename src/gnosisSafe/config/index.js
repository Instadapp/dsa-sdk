import mainnetProdConfig from "./production-mainnet";
import prodConfig from './production'
import {
  RELAY_API_URL,
  SIGNATURES_VIA_METAMASK,
  TX_SERVICE_HOST,
  SAFE_APPS_URL
} from './names'

export const ensureOnce = (fn) => {
  let executed = false;
  let response;

  return (...args) => {
    if (executed) {
      return response;
    }

    executed = true;
    // eslint-disable-next-line
    response = fn.apply(undefined, args);

    return response;
  };
};

const configuration = () => {
  return mainnetProdConfig;
};

const getConfig = ensureOnce(configuration);

export const getTxServiceHost = () => {
  const config = getConfig();

  return config[TX_SERVICE_HOST];
};

export const getTxServiceUriFrom = (safeAddress) =>
  `safes/${safeAddress}/transactions/`;

export const getIncomingTxServiceUriTo = (safeAddress) =>
  `safes/${safeAddress}/incoming-transfers/`;

export const getSafeCreationTxUri = (safeAddress) =>
  `safes/${safeAddress}/creation/`;

export const signaturesViaMetamask = () => {
  const config = getConfig();

  return config[SIGNATURES_VIA_METAMASK];
};
