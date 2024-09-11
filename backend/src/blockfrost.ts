import axios from "axios";
import * as ERR from "./errors";
import { DRep } from "@emurgo/cardano-serialization-lib-nodejs";
import { Drep } from "./server";

require("dotenv").config();

const POLICY = process.env.POLICY;
const blockfrostSancho = "https://cardano-sanchonet.blockfrost.io";
const projectId = process.env.BLOCKFROST_SANCHO;
const apiClient = axios.create({
  baseURL: blockfrostSancho,
  headers: {
    project_id: projectId,
  },
});

type BlockfrostPolicy = {
  asset: string;
  quantity: string;
};

export async function fetchAssetData(assetId: string) {
  try {
    const response = await apiClient.get(`api/v0/assets/${assetId}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return true;
    } else {
      console.error("Error fetching data:", error.message);
      throw error;
    }
  }
}

export async function fetchUTxOData(address: string) {
  try {
    const response = await apiClient.get(`api/v0/addresses/${address}/utxos`);
    const utxoInfo = response.data;
    const parsedUTxOs = utxoInfo.map(
      (utxo: any) => `${utxo.tx_hash}#${utxo.tx_index}`
    );
    return parsedUTxOs;
  } catch (error: any) {}
}

export async function findDrepMetadata(dRep: Drep) {
  try {
    if (POLICY) {
      let policy = POLICY;
      const response = await apiClient.get(`api/v0/assets/policy/${policy}`);
      const policyInfo = response.data;
      const assets = policyInfo.map((policy: BlockfrostPolicy) => policy.asset);

      const assetMetadata = await Promise.all(
        assets.map(async (asset: string) => {
          const assetInfo: any = await fetchAssetData(asset);
          if (assetInfo.data.onchain_metadata) {
            return assetInfo.data.onchain_metadata;
          }
          return null;
        })
      );
      const filteredMetadata = assetMetadata.filter(Boolean);
      const drepMetadata: any[] = [];
      filteredMetadata.forEach((md) => {
        if ("id" in dRep) {
          if (md.drepId == dRep.id) {
            drepMetadata.push(md);
          }
        }
        if ("name" in dRep) {
          if (md.name == dRep.name) {
            drepMetadata.push(md);
          }
        }
      });
      return drepMetadata;
    } else {
      ERR.MissingEnvVariable("POLICY");
    }
  } catch (error) {
    console.error("Error fetching policy data:", error);
    throw error;
  }
}
