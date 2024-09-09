export function InvalidMintData() {
  throw new Error("Invalid mint data");
}

export function AlreadyRegistered(dRepName: string) {
  throw new Error(`You have already registered as ${dRepName}`);
}

export function NoSelections() {
  throw new Error("No selections allowed from platform address");
}

export function NoInputs() {
    throw new Error("No inputs allowed from platform address");
  }