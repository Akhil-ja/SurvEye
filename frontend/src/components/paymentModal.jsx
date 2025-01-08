import React, { useCallback, useState, useEffect } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "./ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { postWalletTransactions } from "@/slices/sharedSlice";

export const PaymentModal = ({ price, onPaymentSuccess, onCancel }) => {
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [isWalletDetected, setIsWalletDetected] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const dispatch = useDispatch();

  useEffect(() => {
    const checkWalletExtension = () => {
      const hasPhantom = window?.solana?.isPhantom;
      const hasSolflare = window?.solflare;
      setIsWalletDetected(!!hasPhantom || !!hasSolflare);
    };

    checkWalletExtension();
  }, []);

  const handleWalletInstall = () => {
    const phantomWalletUrl = "https://phantom.app/";
    window.open(phantomWalletUrl, "_blank");
  };

  const pay = useCallback(async () => {
    if (!isWalletDetected) {
      toast.error("Please install a Solana wallet extension first");
      return;
    }

    try {
      if (!publicKey) throw new WalletNotConnectedError();

      setPaymentStatus("processing");

      const lamports = Math.round(price * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: "HT6VetsLmWHs5qy6RgyoSAEPrHYhvFoso5arEGETTEMo",
          lamports: lamports,
        })
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      setPaymentStatus("success");
      toast.success("Payment successful!");
      const transactionDetails = {
        amount: price,
        type: "credit",
        status: "completed",
        sender: publicKey,
        recipient: "HT6VetsLmWHs5qy6RgyoSAEPrHYhvFoso5arEGETTEMo",
        signature: signature,
      };
      dispatch(postWalletTransactions(transactionDetails));

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      toast.error("Payment failed. Please try again.");
    }
  }, [
    publicKey,
    sendTransaction,
    connection,
    price,
    onPaymentSuccess,
    isWalletDetected,
  ]);

  useEffect(() => {
    setIsWalletReady(connected && publicKey);
  }, [connected, publicKey]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

        {!isWalletDetected ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">
              No Solana wallet extension detected
            </p>
            <Button onClick={handleWalletInstall} className="w-full">
              Install Phantom Wallet
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              You need a Solana wallet extension to make payments. Click above
              to install Phantom Wallet.
            </p>
          </div>
        ) : (
          <div>
            <WalletMultiButton />

            {publicKey && (
              <>
                <p className="mt-4 text-green-600">
                  Amount to be paid: {price} SOL
                </p>

                {isWalletReady && paymentStatus === "idle" && (
                  <Button onClick={pay} className="w-full mt-4">
                    Confirm Payment
                  </Button>
                )}

                {!isWalletReady && (
                  <p className="mt-4 text-red-500">
                    Wallet not fully connected. Please try reconnecting.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {paymentStatus === "processing" && (
          <div className="text-center mt-4">
            <p>Processing payment...</p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="mt-4">
            <p className="text-red-500">Payment failed. Please try again.</p>
            <Button
              onClick={() => setPaymentStatus("idle")}
              className="w-full mt-4"
            >
              Retry Payment
            </Button>
          </div>
        )}

        <Button variant="ghost" onClick={onCancel} className="w-full mt-2">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
