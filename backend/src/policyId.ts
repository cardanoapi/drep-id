const CSL = require("@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib");
import CardanoWasm, {
  NativeScript,
  ScriptPubkey,
} from "@emurgo/cardano-serialization-lib-nodejs";

export function getPolicy(keyBytes: Buffer): string {
  const scriptPubKey = ScriptPubkey.new(
    CSL.Ed25519KeyHash.from_bytes(keyBytes)
  );
  return NativeScript.new_script_pubkey(scriptPubKey).hash().to_hex();
}
