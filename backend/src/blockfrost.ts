import axios from "axios";
import * as ERR from "./errors";
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

type DRepMetadata = {
  dRep: Record<any, any> | null;
  token: Record<any, any> | null;
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

export async function fetchDrepMetadata(dRepId: string) {
  try {
    const drepMetadataBlockfrost: any = await apiClient.get(
      `/api/v0/governance/dreps/${dRepId}/metadata`
    );
    return drepMetadataBlockfrost.data;
  } catch (error: any) {
    console.error(
      `Error fetching DRep Metadata for ID ${dRepId} from Blockfrost: ${error.message}`
    );
    return null;
  }
}

export async function findDrepMetadata(dRep: Drep) {
  try {
    if (!POLICY) {
      throw new Error("Missing environment variable: POLICY");
    }

    const policy = POLICY;
    const response = await apiClient.get(`/api/v0/assets/policy/${policy}`);
    const policyInfo = response.data;

    // Extract asset data from the policy
    const assets = policyInfo.map((policy: BlockfrostPolicy) => policy.asset);

    // Fetch metadata for all assets and filter out nulls
    const assetMetadata = (
      await Promise.all(
        assets.map(async (asset: string) => {
          const assetInfo: any = await fetchAssetData(asset);
          return assetInfo.data.onchain_metadata || null;
        })
      )
    ).filter(Boolean); // Remove null/undefined metadata
    // Initialize the dRepMetadata object
    const drepMetadata: DRepMetadata = { dRep: null, token: null };
    // Fetch DRep metadata if `id` exists
    if ("id" in dRep) {
      drepMetadata.dRep = await fetchDrepMetadata(dRep.id);
    }
    // Process filtered metadata
    for (const md of assetMetadata) {
      if ("id" in dRep && md.drepId === dRep.id) {
        drepMetadata.token = md;
        break;
      } else if ("name" in dRep && md.name === dRep.name) {
        drepMetadata.token = md;
        break;
      }
    }
    return drepMetadata;
  } catch (error: any) {
    console.error("Error fetching DRep metadata:", error);
    throw new Error(`Error fetching DRep metadata: ${error.message}`);
  }
}
