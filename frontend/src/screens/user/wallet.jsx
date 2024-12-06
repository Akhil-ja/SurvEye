import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, CopyIcon } from "lucide-react";
import { IoWallet } from "react-icons/io5";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { processPayout } from "@/slices/userSlice";
import {
  getWallet,
  createWallet,
  addExistingWallet,
  getWalletTransactions,
} from "@/slices/sharedSlice";

const WalletView = () => {
  const dispatch = useDispatch();
  const {
    data: wallet,
    loading: isLoading,
    error,
  } = useSelector((state) => state.shared.wallet);

  const transactions = useSelector(
    (state) => state.shared.wallet.transactions.data
  );

  const [isAddWalletDialogOpen, setAddWalletDialogOpen] = useState(false);
  const [isCreateWalletDialogOpen, setCreateWalletDialogOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const [isPayoutDialogOpen, setPayoutDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getWallet());
  }, [dispatch]);

  useEffect(() => {
    if (wallet) {
      dispatch(getWalletTransactions());
    }
  }, [dispatch, wallet]);

  const handleCopyAddress = () => {
    if (wallet?.publicAddress) {
      navigator.clipboard.writeText(wallet.publicAddress);
      toast.info("Wallet address copied!");
    }
  };

  const handlePayout = async () => {
    try {
      await dispatch(processPayout()).unwrap();

      toast.success("Payout processed successfully");
      setPayoutDialogOpen(false);

      dispatch(getWallet());
      dispatch(getWalletTransactions());
    } catch (error) {
      toast.error(error || "Failed to process payout");
    }
  };

  const handleAddWallet = async () => {
    try {
      await dispatch(
        addExistingWallet({
          publicAddress: walletAddress,
          privateKey,
        })
      ).unwrap();

      toast.success("Wallet added successfully");
      setAddWalletDialogOpen(false);
      setWalletAddress("");
      setPrivateKey("");

      dispatch(getWallet());
    } catch (err) {
      toast.error(err || "Failed to add wallet");
    }
  };

  const handleCreateWallet = async () => {
    try {
      await dispatch(createWallet()).unwrap();
      toast.success("New wallet created successfully");
      setCreateWalletDialogOpen(false);
      dispatch(getWallet());
    } catch (err) {
      toast.error("Failed to create wallet");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading wallet data...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Failed to load wallet: {error}
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">No Wallet Found</h2>
          <p className="text-gray-600 mt-2">
            You don&apos;t have a wallet yet. Please create or add an existing
            wallet.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setAddWalletDialogOpen(true)}
          >
            <span>Add Existing Wallet</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setCreateWalletDialogOpen(true)}
          >
            <span>Create New Wallet</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Wallet Dialog */}
        <Dialog
          open={isAddWalletDialogOpen}
          onOpenChange={(open) => setAddWalletDialogOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Existing Wallet</DialogTitle>
              <DialogDescription>
                Enter your existing wallet details
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Wallet Address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />

              <Button onClick={handleAddWallet} className="w-full mt-2">
                Add Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Wallet Dialog */}
        <Dialog
          open={isCreateWalletDialogOpen}
          onOpenChange={(open) => setCreateWalletDialogOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Create a new wallet for your account
              </DialogDescription>
            </DialogHeader>

            <Button onClick={handleCreateWallet} className="w-full mt-4">
              Create Wallet
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Wallet Balance and Address Card */}
      <Card className="border border-green-200">
        <CardContent className="p-0">
          <div className="flex justify-between items-center p-4 bg-green-50">
            <div>
              <span className="text-lg font-semibold text-green-800">
                Wallet Balance
              </span>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {wallet.payout} SOL
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {wallet.publicAddress}
              </span>
              <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                <CopyIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setPayoutDialogOpen(true)}
                disabled={!wallet.payout || parseFloat(wallet.payout) === 0}
              >
                <IoWallet className="h-4 w-4 mr-2" />
                Payout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Confirmation Dialog */}
      <Dialog
        open={isPayoutDialogOpen}
        onOpenChange={(open) => setPayoutDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payout</DialogTitle>
            <DialogDescription>
              Are you sure you want to process the entire wallet balance of{" "}
              {wallet.payout} SOL?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayout}>Confirm Payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium">
                        {transaction.type === "send" ? "Sent" : "Received"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        transaction.type === "send"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.type === "send" ? "-" : "+"}
                      {transaction.amount} USD
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletView;
