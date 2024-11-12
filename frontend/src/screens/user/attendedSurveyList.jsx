import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  getSurvey,
  selectSurveys,
  selectSurveyPagination,
  selectSurveyLoading,
  selectSurveyError,
  setSortBy,
  setSortOrder,
  selectSortBy,
  selectSortOrder,
} from "../../slices/userSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ActiveSurveysTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const surveys = useSelector(selectSurveys);
  const pagination = useSelector(selectSurveyPagination);
  const loading = useSelector(selectSurveyLoading);
  const error = useSelector(selectSurveyError);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);

  useEffect(() => {
    dispatch(
      getSurvey({
        page: 1,
        sort: "date",
        order: "desc",
        attended: true,
      })
    );
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(
      getSurvey({ page, sort: sortBy, order: sortOrder, attended: true })
    );
  };

  const handleSortChange = (value) => {
    dispatch(setSortBy(value));
  };

  const handleOrderChange = (value) => {
    dispatch(setSortOrder(value));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (loading) {
    return <div className="text-center p-8">Loading surveys...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Active Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="responses">Responses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={sortOrder} onValueChange={handleOrderChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b font-medium text-left">
                      Survey
                    </th>
                    <th className="p-4 border-b font-medium text-left">
                      Creator
                    </th>
                    <th className="p-4 border-b font-medium text-right">
                      Sample Size
                    </th>
                    <th className="p-4 border-b font-medium text-right">
                      Total Responses
                    </th>
                    <th className="p-4 border-b font-medium text-center">
                      Age Range
                    </th>
                    <th className="p-4 border-b font-medium text-center">
                      Duration
                    </th>
                    <th className="p-4 border-b font-medium text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {surveys?.map((survey) => (
                    <tr
                      key={survey._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 border-b">{survey.surveyName}</td>
                      <td className="p-4 border-b">{survey.creatorName}</td>
                      <td className="p-4 border-b text-right">
                        {survey.sampleSize.toLocaleString()}
                      </td>
                      <td className="p-4 border-b text-right">
                        {survey.totalResponses.toLocaleString()}
                      </td>
                      <td className="p-4 border-b text-center">
                        {survey.targetAgeRange.isAllAges
                          ? "All Ages"
                          : `${survey.targetAgeRange.minAge} - ${survey.targetAgeRange.maxAge}`}
                      </td>
                      <td className="p-4 border-b text-center">
                        {formatDate(survey.duration.startDate)} -{" "}
                        {formatDate(survey.duration.endDate)}
                      </td>
                      <td className="p-4 border-b text-center">
                        <Button
                          variant="ghost"
                          disabled={!survey.isPublished}
                          onClick={() =>
                            survey.isPublished &&
                            navigate(
                              `/user/attendsurvey?surveyId=${survey._id}`
                            )
                          }
                        >
                          {survey.isPublished ? "Attend" : "Coming Soon"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className={`cursor-pointer ${
                      pagination.currentPage === 1 ? "opacity-50" : ""
                    }`}
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      className={`cursor-pointer ${
                        pageNum === pagination.currentPage ? "bg-red-100" : ""
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className={`cursor-pointer ${
                      pagination.currentPage === pagination.totalPages
                        ? "opacity-50"
                        : ""
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

export default ActiveSurveysTable;
