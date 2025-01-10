import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDispatch, useSelector } from "react-redux";
import { getWalletTransactions } from "@/slices/sharedSlice";

const TransactionView = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const transactions = useSelector(
    (state) => state.shared.wallet.transactions.data || []
  );

  const loading = useSelector(
    (state) => state.shared.wallet.transactions.loading
  );

  const error = useSelector((state) => state.shared.wallet.transactions.error);

  useEffect(() => {
    dispatch(getWalletTransactions());
  }, [dispatch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">Loading transactions...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Failed to load transactions: {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

            {transactions.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No transactions found
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {currentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b pb-2 last:border-b-0 hover:bg-gray-50 p-2 rounded"
                    >
                      <div className="flex-grow">
                        <div className="font-medium">
                          {transaction.type === "payout" ? "Payout" : "Sent"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                      <div
                        className={`font-semibold text-right ${
                          transaction.type === "credit"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "-" : "+"}
                        {transaction.amount} SOL
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            currentPage > 1 && handlePageChange(currentPage - 1)
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            isActive={currentPage === index + 1}
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < totalPages &&
                            handlePageChange(currentPage + 1)
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionView;
