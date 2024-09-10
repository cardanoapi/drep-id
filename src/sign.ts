import { ShelleyWallet, cborBackend } from "libcardano";
import * as blake from "blakejs";

export async function signTx(tx: string, wallet: ShelleyWallet) {
  // decode transaction body and calculate hash
  let decodedTx = cborBackend.decode(Buffer.from(tx, "hex"));
  const reEncodedTx = Buffer.from(cborBackend.encode(decodedTx)).toString(
    "hex"
  );

  if (tx != reEncodedTx) {
    console.warn("[CardanoTestWallet] Re-encoded tx is not same");
    console.warn("[CardanoTestWallet]   Starting Tx", tx);
    console.warn("[CardanoTestWallet] Re-Encoded Tx", reEncodedTx);
  }

  const txbody = Uint8Array.from(cborBackend.encode(decodedTx[0]));
  const txHash = blake.blake2b(txbody, undefined, 32);

  // sign the transaction hash with payment key
  const paymentKeySig = await wallet.paymentKey.signRaw(Buffer.from(txHash));

  // create witness set object
  const witness = new Map();
  const vkeyWitnesses = [[wallet.paymentKey.public, paymentKeySig]];

  witness.set(0, vkeyWitnesses);

  return Buffer.from(cborBackend.encode(witness)).toString("hex");
}
