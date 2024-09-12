import {
  Ed25519Key,
  ShelleyAddress,
  ShelleyWallet,
  cborBackend,
} from "libcardano";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { setup } from "libcardano/lib/cardano/crypto";
import { fetchAssetData, findDrepMetadata } from "./blockfrost";
import { getPolicy } from "./policyId";
import * as ERR from "./errors";
import { submitWithKuber } from "./kuber";
import { parseTxBody } from "libcardano/cardano/ledger-serialization/txBody";
import { parseTxWitness } from "libcardano/cardano/ledger-serialization/txWitnessSet";
import { signTx } from "./sign";
import cors from "cors";
import express from "express";
import * as blake from "blakejs";
import { swaggerSpec } from "./swaggerConfig";

require("dotenv").config();
const app = express();
const PORT = process.env.SOCKET_PORT || 3000;
const NETWORK = process.env.NETWORK;
const PAYMENT_KEY = process.env.PAYMENT_KEY;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

function getTreasuryAddress(): string {
  if (TREASURY_ADDRESS) {
    return TREASURY_ADDRESS;
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

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

type Request = {
  cborHex: string;
};

export type Drep = { name: string } | { id: string };

// Route to submit transaction
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register DRep by minting a token
 *     description: Submit a transaction to create a DRep profile by minting a Token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cborHex:
 *                 type: string
 *                 description: CBOR-encoded transaction hex
 *     responses:
 *       200:
 *         description: Transaction submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txHash:
 *                   type: string
 *                   description: Hash of the submitted transaction
 *       400:
 *         description: Bad Request - Invalid transaction data.
 */
app.post("/api/register", express.json(), async (req: any, res: any) => {
  try {
    const mint = await checkDRepRegistration(req.body);
    if (!res.headersSent) {
      return res.status(200).json(mint);
    }
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).send({ error: error.message || "Bad Request" });
  }
});

// Route to find DRep
/**
 * @swagger
 * /api/drep:
 *   get:
 *     summary: Retrieve DRep metadata
 *     description: Find and retrieve metadata for a DRep based on either its ID or name.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: The ID of the DRep (optional).
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the DRep (optional).
 *     responses:
 *       200:
 *         description: DRep metadata found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dRep:
 *                   type: object
 *                   nullable: true
 *                   description: DRep On-chain Metadata.
 *                 token:
 *                   type: object
 *                   nullable: true
 *                   description: DRep Token Metadata.
 *               example:
 *                 dRep:
 *                   drep_id: "drep1qpuw066kgawne88u0ukl0tfxhuxpclu7kvvgzvcdachgczhyd7x"
 *                   hex: "0078e7eb56475d3c9cfc7f2df7ad26bf0c1c7f9eb31881330dee2e8c"
 *                   url: "https://metadata-govtool.cardanoapi.io/data/Walter"
 *                   hash: "d8ecec10913aa85256d9ffb665efa4f740adb4edd345e6e0df07e97046388549"
 *                 token:
 *                  name: "JOHN CENA"
 *                  drepId: "drep1qpuw066kgawne88u0ukl0tfxhuxpclu7kvvgzvcdachgczhyd7x"
 *                  image: "https://bit.ly/3xpjbJ9"
 *                  mediaType: "image/jpeg"
 *       400:
 *         description: Bad request - Missing drepId or drepName in query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing drepId or drepName in query
 */
app.get("/api/drep", async (req: any, res: any) => {
  try {
    const { id: drepId, name: drepName } = req.query;
    if (!drepId && !drepName) {
      return res
        .status(400)
        .json({ error: "Missing drepId or drepName in query" });
    }
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
    const metadata = await findDrepMetadata(drep);
    if (!res.headersSent) {
      return res.status(200).json(metadata);
    }
  } catch (error: any) {
    console.error("Error:", error.message || error);
    return res.status(400).json({ error: error.message || "Bad Request" });
  }
});

// Function to check registration validation
async function checkDRepRegistration(req: Request) {
  try {
    const platformWallet: ShelleyWallet = await generateWallet();

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
      return ERR.AlreadyRegistered(drepName);
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
      return ERR.InvalidField();
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
            if (bech32 === getTreasuryAddress()) {
              if (
                (typeof output[1] == "number" ||
                  typeof output[1] == "bigint") &&
                output[1] >= 1000000
              )
                return output;
            }
            return null;
          }
        })
      )
    ).filter(Boolean);
    if (!platformOutputs.length) {
      return ERR.TreasuryNotPaid(getTreasuryAddress());
    }

    //validate metadata
    try {
      const metadata = txCbor[3].value.get(0).get(721);
      if (metadata.size != 1) {
        return ERR.SingleMetadata();
      }
      const metadataObj = Object.fromEntries(metadata);
      const metadataPolicyInfo = Object.keys(metadataObj)[0];
      if (metadataPolicyInfo != policy) {
        return ERR.InvalidPolicyInMetadata(policy, metadataPolicyInfo);
      }
      const metadataAssetMap = metadata.get(metadataPolicyInfo);
      const metadataAssetInfo = Object.keys(
        Object.fromEntries(metadataAssetMap)
      )[0];
      const metadataAssetName = metadataAssetMap
        .get(metadataAssetInfo)
        .get("name");
      const validMetadataAssetName = Buffer.from(drepName, "hex").toString(
        "utf-8"
      );
      const dRepId = metadataAssetMap.get(metadataAssetInfo).get("drepId");
      if (
        !dRepId ||
        (dRepId.length != 56 && dRepId.length != 58) ||
        dRepId.slice(0, 4) != "drep"
      ) {
        return ERR.InvalidDrepId();
      }
      if (validMetadataAssetName != metadataAssetName) {
        return ERR.InvalidMetadataAssetName(
          validMetadataAssetName,
          metadataAssetName
        );
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
    const existingVkey = txCbor[1].get(0);
    const combinedWitness = new Set([
      ...(existingVkey || []),
      ...signatureBuffer,
    ]);
    txCbor[1].set(0, combinedWitness);
    const finalTx = cborBackend.encode(txCbor).toString("hex");
    await submitWithKuber(finalTx);
    const txHash = {
      txHash: Buffer.from(
        blake.blake2b(
          Uint8Array.from(cborBackend.encode(txCbor[0])),
          undefined,
          32
        )
      ).toString("hex"),
    };
    console.log(txHash);
    return txHash;
  } catch (error) {
    console.error("Error during Minting:", error);
    throw error;
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
