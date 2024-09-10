import axios from "axios";
require("dotenv").config();

const blockfrostSancho = "https://cardano-sanchonet.blockfrost.io";
const projectId = process.env.BLOCKFROST_SANCHO;
const apiClient = axios.create({
  baseURL: blockfrostSancho,
  headers: {
    project_id: projectId,
  },
});

export async function fetchAssetData(assetId: string) {
  try {
    const response = await apiClient.get(`api/v0/assets/${assetId}`);
    return response.status;
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
