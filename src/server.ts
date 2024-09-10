const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const PORT = process.env.SOCKET_PORT || 3000;
import { ShelleyWallet } from "libcardano";
import { setup } from "libcardano/lib/cardano/crypto";
import { fetchAssetData, fetchUTxOData } from "./blockfrost";
import { getPolicy } from "./policyId";
import * as ERR from "./errors";
async function generateWallet() {
  await setup();
  const wallet = await ShelleyWallet.generate();
  return wallet;
}

// Middleware for CORS
app.use(
  cors({
    origin: "*",
  })
);

// Route to submit transaction
app.post("/api/submit/tx", express.json(), async (req: any, res: any) => {
  try {
    await checkMint(req.body); // Ensure `checkMint` is awaited if it becomes asynchronous
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error:", error);
    res.status(400).send({ error: error.message || "Bad Request" });
  }
});

// Function to check mint validity
async function checkMint(req: any) {
  const platformWallet = await generateWallet();
  const platformAddress =
    // platformWallet.addressBech32(0);
    "addr_test1qq5kwcc5c8q3vhe5x6vfmmwh0mgjtqemw3ayd46a0tke6w0vxagpfl0ukvhqjrs24an3esu663pzgq7dqqggj3eq6neq4wv8z3";

  // validate proper mint amount
  const mint = req.mint;
  if (!mint || mint.length !== 1) {
    ERR.InvalidMintData();
    return;
  }

  const validMint = mint[0];
  const amount = validMint.amount;
  if (
    !amount ||
    Object.keys(amount).length !== 1 ||
    Object.values(amount)[0] !== 1 ||
    !validMint.script.keyHash ||
    !validMint.script.type ||
    validMint.script.type !== "sig"
  ) {
    ERR.InvalidMintData();
    return;
  }

  // validate unique mint
  const drepName = Object.keys(amount)[0];
  const policy =
    getPolicy(validMint.script.keyHash) +
    Buffer.from(drepName, "utf8").toString("hex");
  const assetData = await fetchAssetData(policy);
  if (assetData == 200) {
    ERR.AlreadyRegistered(drepName);
    return;
  }

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

  // validate other fields
  const allowedFields = [
    "inputs",
    "mint",
    "outputs",
    "selections",
    "signatures",
    "collaterals",
    "fee",
  ];
  const reqFields = Object.keys(req);
  const isValid = reqFields.every((field) => allowedFields.includes(field));
  if (!isValid) {
    ERR.InvalidField(reqFields, allowedFields);
  }

  // validate platform paid
  if (!req.outputs) ERR.MissingOutput();
  const hasValidPlatformFee = req.outputs.some((output: any) => {
    if (output.address === platformAddress) {
      if (output.value.lovelace > 0) {
        return true;
        return true;
      } else {
        ERR.PlatformNotPaid(platformAddress);
      }
    }
    return false;
  });
  if (!hasValidPlatformFee) {
    ERR.PlatformNotPaid(platformAddress);
  }

  // sign the transaction

  console.log("ALL GOOD");
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
