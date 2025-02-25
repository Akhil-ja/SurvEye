import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { getTransactions, updateAdminPercentCut } from "@/slices/adminSlice";

const WalletTransactionHistory = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditPercentCutDialogOpen, setEditPercentCutDialogOpen] =
    useState(false);
  const [newAdminPercentCut, setNewAdminPercentCut] = useState("");

  // Select transactions and admin percent cut from Redux store
  const { transactions } = useSelector((state) => state.admin);
  const currentAdminPercentCut = useSelector(
    (state) => state.admin.adminPercentCut?.percentage
  );

  // Define the number of transactions per page
  const transactionsPerPage = 5;

  // Calculate the total number of pages
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Slice the transactions array to display the current page's transactions
  const currentTransactions = transactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);

  const handleUpdateAdminPercentCut = async () => {
    try {
      const percentCutValue = parseFloat(newAdminPercentCut);

      if (
        isNaN(percentCutValue) ||
        percentCutValue < 1 ||
        percentCutValue > 100
      ) {
        toast.error("Please enter a valid percentage between 1 and 100");
        return;
      }

      await dispatch(updateAdminPercentCut(percentCutValue)).unwrap();

      toast.success("Admin percent cut updated successfully");
      setEditPercentCutDialogOpen(false);
      setNewAdminPercentCut("");
    } catch (error) {
      toast.error(error.message || "Failed to update admin percent cut");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Admin Percent Cut</h3>
              <p className="text-gray-600">
                Current percentage: {currentAdminPercentCut || 0}%
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setEditPercentCutDialogOpen(true)}
            >
              Edit Percent Cut
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex justify-between border-b pb-3 last:border-b-0"
                >
                  <div>
                    <div className="font-medium capitalize">
                      {transaction.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Sender: {transaction.sender.slice(0, 6)}...
                      {transaction.sender.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Recipient: {transaction.recipient.slice(0, 6)}...
                      {transaction.recipient.slice(-4)}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "payout"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.type === "payout" ? "-" : "+"}
                    {transaction.amount.toFixed(2)} SOL
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No transactions found
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Admin Percent Cut Dialog */}
      <Dialog
        open={isEditPercentCutDialogOpen}
        onOpenChange={(open) => setEditPercentCutDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Percent Cut</DialogTitle>
            <DialogDescription>
              Enter the new percentage for admin commission
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Input
              type="number"
              placeholder="Enter new percent cut (0-100)"
              value={newAdminPercentCut}
              onChange={(e) => setNewAdminPercentCut(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditPercentCutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAdminPercentCut}>
              Update Percent Cut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTransactionHistory;
