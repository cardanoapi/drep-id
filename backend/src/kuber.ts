import axios from "axios";
require("dotenv").config();

const kuberSancho = "https://sanchonet.kuber.cardanoapi.io";
const apiKey = process.env.KUBER_API_KEY;
const apiClient = axios.create({
  baseURL: kuberSancho,
  headers: {
    "api-key": apiKey,
    "content-type": "application/json",
  },
});

export async function submitWithKuber(tx: string) {
  try {
    const txData = JSON.stringify({
      tx: {
        description: "",
        type: "Tx ConwayEra",
        cborHex: tx,
      },
    });
    const response = await apiClient.post(`/api/v1/tx/submit`, txData);
    return response.data.cborHex;
  } catch (error: any) {
    const errorMessage = `${error.response.data.type} : ${error.response.data.message}`;
    throw new Error(errorMessage);
  }
}
