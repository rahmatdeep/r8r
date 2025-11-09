import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
  Connection,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import {
  updateErrorDB,
  validateCredentials,
  validateSolanaMetadata,
} from "./validate";
import { JsonObject } from "@repo/db";
import { parse } from "./parser";
const connection = new Connection("https://api.mainnet-beta.solana.com");

async function sendSol(
  credentials: { apiKey: string },
  to: string,
  amount: string
) {
  const keypair = Keypair.fromSecretKey(base58.decode(credentials.apiKey));
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
    })
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
}

export async function processSol(
  credentials: any,
  currentAction: any,
  workflowRunMetadata: any,
  workflowRunId: string
) {
  const apiKey = validateCredentials(credentials, "solana");
  if (!apiKey) {
    await updateErrorDB(
      workflowRunId,
      "No private key credentials found for the user"
    );
    return;
  }

  const metadataResult = validateSolanaMetadata(
    currentAction.metadata as JsonObject
  );
  if (!metadataResult.valid) {
    await updateErrorDB(
      workflowRunId,
      `Solana Action metadata missing required fields: ${metadataResult.missingFields.join(", ")}`
    );
    return;
  }
  const amount = parse(metadataResult.value.amount, workflowRunMetadata);
  const to = parse(metadataResult.value.to, workflowRunMetadata);

  try {
    const solanaResponse = await sendSol({ apiKey }, to, amount);

    console.log(`Solana sent successfully to: ${to}`);
  } catch (error) {
    console.error("Failed to send sol:", error);
    await updateErrorDB(workflowRunId, `Failed to send sol: ${error}`);
  }
}
