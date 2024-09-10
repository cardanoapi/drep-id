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

export function NoCollaterals() {
  throw new Error("No collateral inputs allowed from platform address");
}

export function InvalidField(fields: string[], allowedFields: string[]) {
  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );
  throw new Error(`Encountered Invalid Tx Fields: ${invalidFields}`);
}

export function PlatformNotPaid(address: string) {
  throw new Error(`Please make a contribution to ${address}`);
}
