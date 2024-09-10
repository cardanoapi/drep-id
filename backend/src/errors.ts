export function InvalidMintData() {
  throw new Error("Invalid mint data");
}

export function AlreadyRegistered(dRepName: string) {
  throw new Error(
    `You have already registered as ${Buffer.from(dRepName, "hex").toString(
      "utf-8"
    )}`
  );
}

export function NoSelections() {
  throw new Error("No selections allowed from platform address");
}

export function NoInputs() {
  throw new Error("No inputs allowed from platform address");
}

export function NoCollaterals() {
  throw new Error("No collateral inputs allowed from platform address");
}

export function InvalidField() {
  throw new Error(`Encountered Invalid Tx Fields`);
}

export function PlatformNotPaid(address: string) {
  throw new Error(`Please make a contribution to ${address}`);
}

export function MissingOutput() {
  throw new Error(`Transaction Missing Output`);
}

export function MissingNetwork() {
  throw new Error(`Missing NETWORK in .env`);
}

export function InvalidNetwork() {
  throw new Error(`Invalid Network: Expected 0 for testnet or 1 for mainnet`);
}
