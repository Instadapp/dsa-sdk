import {
  TX_SERVICE_HOST,
  SIGNATURES_VIA_METAMASK,
  RELAY_API_URL,
} from "./names";

const prodMainnetConfig = {
  [TX_SERVICE_HOST]: "https://safe-transaction.mainnet.gnosis.io/api/v1/",
  [SIGNATURES_VIA_METAMASK]: false,
  [RELAY_API_URL]: "https://safe-relay.gnosis.io/api/v1/",
};

export default prodMainnetConfig;
