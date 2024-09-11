import {
  Ed25519Key,
  ShelleyAddress,
  ShelleyWallet,
  cborBackend,
} from "libcardano";
import { setup } from "libcardano/lib/cardano/crypto";
import { fetchAssetData, fetchUTxOData } from "./blockfrost";
import { getPolicy } from "./policyId";
import * as ERR from "./errors";
import { fetchTxCbor, submitWithKuber } from "./kuber";
import { parseTxBody } from "libcardano/cardano/ledger-serialization/txBody";
import { parseTxWitness } from "libcardano/cardano/ledger-serialization/txWitnessSet";
import { signTx } from "./sign";
import cors from "cors";
import express from "express";

require("dotenv").config();
const app = express();
const PORT = process.env.SOCKET_PORT || 3000;
const NETWORK = process.env.NETWORK;
const PAYMENT_KEY = process.env.PAYMENT_KEY;
const STAKE_KEY = process.env.STAKE_KEY;

async function generateWallet() {
  await setup();
  if (PAYMENT_KEY && STAKE_KEY) {
    const ed25519PaymentKey = await Ed25519Key.fromPrivateKeyHex(PAYMENT_KEY);
    const ed25519StakeKey = await Ed25519Key.fromPrivateKeyHex(STAKE_KEY);
    const platformWallet = new ShelleyWallet(
      ed25519PaymentKey,
      ed25519StakeKey
    );
    return platformWallet;
  } else {
    throw new Error("Missing Environment Variable: PAYMENT_KEY or STAKE_KEY");
  }
}

async function generateAddress(addr_bytes: Buffer) {
  await setup();
  const address = ShelleyAddress.fromRawBytes(addr_bytes);
  return address;
}

function getNetworkId(): number {
  if (!NETWORK) {
    ERR.MissingNetwork();
  }
  const netId = parseInt(NETWORK as string);
  if (netId == 0 || netId == 1) return netId;
  else throw ERR.InvalidNetwork();
}

// Middleware for CORS
app.use(
  cors({
    origin: "*",
  })
);

// Route to submit transaction
app.post("/api/register", express.json(), async (req: any, res: any) => {
  try {
    await checkMint(req.body);
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).send({ error: error.message || "Bad Request" });
  }
});

// Function to check mint validity
async function checkMint(req: Record<any, any>) {
  const platformWallet: ShelleyWallet = await new Promise((resolve) => {
    setTimeout(async () => {
      const wallet = await generateWallet();
      resolve(wallet);
    }, 500);
  });

  const platformAddress = platformWallet.addressBech32(getNetworkId());

  await validateTxJson(req, platformAddress);

  // using libcardano

  const txCbor = cborBackend.decode(Buffer.from(await fetchTxCbor(req), "hex"));
  const txBody = parseTxBody(txCbor[0]);
  const txWitnesses = parseTxWitness(txCbor[1]);

  // validate proper mint amount
  const mint = txBody.mint;
  if (!mint || mint.length !== 1) {
    ERR.InvalidMintData();
    return;
  }

  const validMint = mint[0];
  const amount = validMint.amount;
  if (
    !amount ||
    Object.keys(amount).length !== 1 ||
    Object.values(amount)[0].quantity !== "1" ||
    txWitnesses.nativeScripts?.length !== 1 ||
    txWitnesses.nativeScripts[0].type !== "ScriptPubKey"
  ) {
    ERR.InvalidMintData();
    return;
  }

  // validate unique mint
  const drepName = validMint.amount[0].tokenName;
  const policy = getPolicy(txWitnesses.nativeScripts[0].addrKeyHash) + drepName;
  const assetData = await fetchAssetData(policy);
  if (assetData == 200) {
    ERR.AlreadyRegistered(drepName);
    return;
  }

  // validate other fields
  const invalidFields =
    !txBody.certificates &&
    !txBody.withdrawals &&
    !txBody.auxDataHash &&
    !txBody.scriptDataHash &&
    !txBody.votingProcedures &&
    !txBody.proposalProcedures &&
    !txBody.currentTreasuryValue &&
    !txBody.donation;
  if (!invalidFields) {
    ERR.InvalidField();
  }

  // validate platform paid
  // manually deserializing outputs since there is an issue with libcardano
  const outputs = txCbor[0].get(1);
  const platformOutputs = (
    await Promise.all(
      outputs.map(async (output: any[]) => {
        const outputAddress = output[0];
        const shelleyAddress = await generateAddress(outputAddress);
        const bech32 = shelleyAddress.toBech32();

        if (bech32 === platformAddress && output[1] > 0) {
          return output;
        }
        return null;
      })
    )
  ).filter(Boolean);
  if (platformOutputs.length === 0) {
    ERR.PlatformNotPaid(platformAddress);
  }
  const platformSignature = await signTx(
    await fetchTxCbor(req),
    platformWallet
  );
  const signatureBuffer = cborBackend
    .decode(Buffer.from(platformSignature, "hex"))
    .get(0);
  const signatureSet = new Set(signatureBuffer);
  const existingVkey = txCbor[1].get(0);
  let combinedWitness = signatureSet;
  if (existingVkey) {
    combinedWitness = new Set([...existingVkey, ...signatureSet]);
  }
  txCbor[1].set(0, combinedWitness);
  const finalTx = cborBackend.encode(txCbor).toString("hex");
  await submitWithKuber(finalTx);
}

async function validateTxJson(req: Record<any, any>, platformAddress: string) {
  // validate no selections from platform address
  const selections = req.selections;
  if (selections?.includes(platformAddress)) {
    ERR.NoSelections();
  }

  // validate no inputs from platform address
  const inputs = req.inputs;
  const platformInputs = await fetchUTxOData(platformAddress);
  inputs?.forEach((input: string) => {
    if (platformInputs?.includes(input)) {
      ERR.NoInputs();
    }
  });

  //validate no collateral from platform address
  const collaterals = req.collaterals;
  collaterals?.forEach((collateral: string) => {
    if (platformInputs?.includes(collateral)) {
      ERR.NoCollaterals();
    }
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
