import {
  Ed25519Key,
  ShelleyAddress,
  ShelleyWallet,
  cborBackend,
} from "libcardano";
import { setup } from "libcardano/lib/cardano/crypto";
import { fetchAssetData, fetchUTxOData, findDrepMetadata } from "./blockfrost";
import { getPolicy } from "./policyId";
import * as ERR from "./errors";
import { submitWithKuber } from "./kuber";
import { parseTxBody } from "libcardano/cardano/ledger-serialization/txBody";
import { parseTxWitness } from "libcardano/cardano/ledger-serialization/txWitnessSet";
import { signTx } from "./sign";
import cors from "cors";
import express from "express";
import * as blake from "blakejs";

require("dotenv").config();
const app = express();
const PORT = process.env.SOCKET_PORT || 3000;
const NETWORK = process.env.NETWORK;
const PAYMENT_KEY = process.env.PAYMENT_KEY;
const platformAddressBech32 = process.env.TREASURY_ADDRESS;
function getPlatformAddress(): string {
  if (platformAddressBech32) {
    return platformAddressBech32;
  } else {
    throw ERR.MissingEnvVariable("TREASURY_ADDRESS");
  }
}
async function generateWallet() {
  await setup();
  if (PAYMENT_KEY) {
    const ed25519PaymentKey = await Ed25519Key.fromPrivateKeyHex(PAYMENT_KEY);
    const platformWallet = new ShelleyWallet(ed25519PaymentKey);
    return platformWallet;
  } else {
    throw ERR.MissingEnvVariable("PAYMENT_KEY");
  }
}

async function generateAddress(addr_bytes: Buffer) {
  await setup();
  const address = ShelleyAddress.fromRawBytes(addr_bytes);
  return address;
}

function getNetworkId(): number {
  if (!NETWORK) {
    ERR.MissingEnvVariable("NETWORK");
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

type Request = {
  cborHex: string;
  description: string;
  hash: string;
  type: string;
};

export type Drep = { name: string } | { id: string };

// Route to submit transaction
app.post("/api/register", express.json(), async (req: any, res: any) => {
  try {
    await checkDRepRegistration(req.body);
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).send({ error: error.message || "Bad Request" });
  }
});

app.get("/api/drep", async (req: any, res: any) => {
  try {
    const drepId = req.query.id;
    const drepName = req.query.name;

    if (!drepId && !drepName) {
      return res
        .status(400)
        .send({ error: "Missing drepId or drepName in query" });
    }

    let metadata: any;
    let drep: Drep;
    if (drepId) {
      drep = { id: drepId };
    } else if (drepName) {
      drep = { name: drepName };
    } else {
      throw new Error(
        "Unexpected state: Neither drepId nor drepName is provided"
      );
    }
    metadata = await findDrep(drep);
    if (!res.headersSent) {
      res.status(200).json(metadata);
    }
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).send({ error: error.message || "Bad Request" });
  }
});

// find DRep
async function findDrep(req: Drep) {
  const metadata = await findDrepMetadata(req);
  return metadata;
}

// Function to check registration validation
async function checkDRepRegistration(req: Request) {
  const platformWallet: ShelleyWallet = await new Promise((resolve) => {
    setTimeout(async () => {
      const wallet = await generateWallet();
      resolve(wallet);
    }, 500);
  });

  const txCbor = cborBackend.decode(Buffer.from(req.cborHex, "hex"));
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
  const policy = getPolicy(txWitnesses.nativeScripts[0].addrKeyHash);
  const assetData: any = await fetchAssetData(policy + drepName);
  if (assetData.status == 200) {
    ERR.AlreadyRegistered(drepName);
    return;
  } else {
  }

  // validate other fields
  const invalidFields =
    !txBody.certificates &&
    !txBody.withdrawals &&
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
      outputs.map(async (output: any) => {
        if (Array.isArray(output)) {
          const outputAddress = output[0];
          const shelleyAddress = ShelleyAddress.fromRawBytes(outputAddress);
          const bech32 = shelleyAddress.toBech32();
          if (bech32 === getPlatformAddress()) {
            if (
              (typeof output[1] == "number" || typeof output[1] == "bigint") &&
              output[1] >= 1000000
            )
              return output;
          }
          return null;
        }
      })
    )
  ).filter(Boolean);
  if (platformOutputs.length === 0) {
    ERR.PlatformNotPaid(getPlatformAddress());
  }

  //validate metadata
  try {
    const metadata = txCbor[3].value.get(0).get(721);
    if (metadata.size != 1) {
      ERR.SingleMetadata();
    }
    const metadataObj = Object.fromEntries(metadata);
    const metadataPolicyInfo = Object.keys(metadataObj)[0];
    if (metadataPolicyInfo != policy) {
      ERR.InvalidPolicyInMetadata(policy, metadataPolicyInfo);
    }
    const metadataAssetMap = metadata.get(metadataPolicyInfo);
    const metadataAssetInfo = Object.keys(
      Object.fromEntries(metadataAssetMap)
    )[0];
    const metadataAssetName = metadataAssetMap
      .get(metadataAssetInfo)
      .get("name");
    if (!metadataAssetMap.get(metadataAssetInfo).get("drepId")) {
      ERR.MissingDRepId();
    }
    const drepId = metadataAssetMap.get(metadataAssetInfo).get("drepId");
    if (
      (drepId.length != 56 && drepId.length != 58) ||
      drepId.slice(0, 4) != "drep"
    ) {
      ERR.InvalidDrepId();
    }

    if (metadataAssetName !== metadataAssetInfo) {
      ERR.InvalidMetadataAssetName(metadataAssetName, metadataAssetInfo);
    }
  } catch (error: any) {
    throw new Error("Invalid Metadata: " + error.message);
  }

  const platformSignature = await signTx(req.cborHex, platformWallet);
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
  console.log(
    "Submitted: " +
      Buffer.from(
        blake.blake2b(
          Uint8Array.from(cborBackend.encode(txCbor[0])),
          undefined,
          32
        )
      ).toString("hex")
  );
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
