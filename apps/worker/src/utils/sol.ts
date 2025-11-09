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
const connection = new Connection("https://api.mainnet-beta.solana.com");

export async function sendSol(
  credentials: { privateKey: string },
  to: string,
  amount: string
) {
  const keypair = Keypair.fromSecretKey(base58.decode(credentials.privateKey));
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
    })
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
}
