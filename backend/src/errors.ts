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

export function TreasuryNotPaid(address: string) {
  throw new Error(`Please make a contribution of atlease 1 Ada to ${address}`);
}

export function MissingOutput() {
  throw new Error(`Transaction Missing Output`);
}

export function InvalidNetwork() {
  throw new Error(`Invalid Network: Expected 0 for testnet or 1 for mainnet`);
}

export function SingleMetadata() {
  throw new Error(`Expected Single Metadata`);
}

export function InvalidPolicyInMetadata(expected: string, got: string) {
  throw new Error(
    `Invalid Policy in Metadata: Expected: ${expected}; Got: ${got} `
  );
}

export function InvalidMetadataAssetName(asset_name: string, name: string) {
  throw new Error(
    `Invalid Metadata Name. Expected: ${asset_name}; Got: ${name}`
  );
}

export function MissingDRepId() {
  throw new Error(`Missing Field drepId in Metadata`);
}

export function InvalidDrepId() {
  throw new Error(`Invalid or Missing field "drepId" in Metadata`);
}

export function MissingEnvVariable(env: string) {
  throw new Error(`Missing environment variable: ${env}`);
}
