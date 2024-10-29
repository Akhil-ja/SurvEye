import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const surveys = [
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "InsightQuest Consumer Feedback August 2021",
    description: "The InsightQuest Consumer Feedback survey i...",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "InsightQuest Consumer Feedback August 2021",
    description: "The InsightQuest Consumer Feedback survey i...",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
  {
    title: "Top 5 SaaS Businesses – August 2021",
    description: "Description",
  },
];

const ITEMS_PER_PAGE = 6;

const ActiveSurveys = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentSurveys = surveys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(surveys.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Handle previous page click
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page click
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Active Surveys</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by :</span>
              <Select defaultValue="cost">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select defaultValue="recent">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Posted Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Posted Time</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSurveys.map((survey, index) => (
            <Card key={index} className="bg-pink-50">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {survey.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {survey.description}
                </p>
                <div className="flex justify-end">
                  <button className="px-4 py-1 bg-red-200 text-red-600 rounded-full text-sm hover:bg-red-400 transition-colors">
                    Attend
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    className={`cursor-pointer ${
                      currentPage === 1 ? "opacity-50" : ""
                    }`}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      className={`cursor-pointer ${
                        pageNum === currentPage ? "bg-red-100" : ""
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    className={`cursor-pointer ${
                      currentPage === totalPages ? "opacity-50" : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSurveys;
