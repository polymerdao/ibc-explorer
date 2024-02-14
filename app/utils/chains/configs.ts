import { Chain } from "utils/types/chain";
import { OptimismIcon, BaseIcon } from "./icons";

export type CHAIN = 'optimism' | 'base';

let opDispatcher = process.env.OP_DISPATCHER!;
let baseDispatcher = process.env.BASE_DISPATCHER!;

export const CHAIN_CONFIGS: {
  [key in CHAIN]: Chain;
} = {
  optimism: {
    id: 11155420,
    display: "Optimism",
    rpc: "https://opt-sepolia.g.alchemy.com/v2/RN7slh_2cUIuzhxo4M9VgYCbqRcPOmkJ",
    dispatcher: opDispatcher,
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    id: 84532,
    display: "Base",
    rpc: "https://base-sepolia.g.alchemy.com/v2/zGVxj0T-xvSR29_t7MlIhqRskkSwugVM",
    dispatcher: baseDispatcher,
    blockTime: 2,
    icon: BaseIcon,
  }
};
