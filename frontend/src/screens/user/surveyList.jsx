import { useEffect, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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

const ActiveSurveys = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const surveys = useSelector(selectSurveys);
  const pagination = useSelector(selectSurveyPagination);
  const loading = useSelector(selectSurveyLoading);
  const error = useSelector(selectSurveyError);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);
  const [mergedSurveys, setMergedSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const activeSurveys = await dispatch(
        getSurvey({
          page: pagination.currentPage,
          limit: 6,
          sort: sortBy,
          order: sortOrder,
        })
      ).unwrap();

      const attendedSurveys = await dispatch(
        getSurvey({
          page: pagination.currentPage,
          limit: 6,
          sort: sortBy,
          order: sortOrder,
          attended: true,
        })
      ).unwrap();

      const attendedIds = new Set(
        attendedSurveys.data.surveys.map((survey) => survey._id)
      );

      const updatedSurveys = activeSurveys.data.surveys.map((survey) => ({
        ...survey,
        userHasAttended: attendedIds.has(survey._id),
      }));

      setMergedSurveys(updatedSurveys);
    };

    fetchSurveys();
  }, [dispatch, pagination.currentPage, sortBy, sortOrder]);

  const handlePageChange = (page) => {
    dispatch(getSurvey({ page, sort: sortBy, order: sortOrder }));
  };

  const handleSortChange = (value) => {
    dispatch(setSortBy(value));

    dispatch(
      setSortOrder(
        value === "name"
          ? "asc"
          : value === "date"
            ? "desc"
            : value === "responses"
              ? "desc"
              : "desc"
      )
    );
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

  const sortingConfig = {
    name: {
      options: [
        { value: "asc", label: "A-Z" },
        { value: "desc", label: "Z-A" },
      ],
    },
    date: {
      options: [
        { value: "desc", label: "Newest First" },
        { value: "asc", label: "Oldest First" },
      ],
    },
    responses: {
      options: [
        { value: "desc", label: "Most Responses" },
        { value: "asc", label: "Least Responses" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Active Surveys</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="responses">Responses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select
              value={sortOrder}
              onValueChange={(value) => dispatch(setSortOrder(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                {sortingConfig[sortBy]?.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mergedSurveys.map((survey) => (
            <Card key={survey._id} className="bg-pink-50">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {survey.surveyName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{survey.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Created by: {survey.creatorName}</p>
                    <p>Category: {survey.category}</p>
                    <p>Sample Size: {survey.sampleSize}</p>
                    <p>
                      Age Range:{" "}
                      {survey.targetAgeRange.isAllAges
                        ? "All Ages"
                        : `${survey.targetAgeRange.minAge} - ${survey.targetAgeRange.maxAge}`}
                    </p>
                    <p>
                      Duration: {formatDate(survey.duration.startDate)} -{" "}
                      {formatDate(survey.duration.endDate)}
                    </p>
                    <p>Total Responses: {survey.totalResponses}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-1 bg-red-200 text-red-600 rounded-full text-sm hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!survey.isPublished || survey.userHasAttended}
                      onClick={() =>
                        survey.isPublished &&
                        !survey.userHasAttended &&
                        navigate(`/user/attendsurvey?surveyId=${survey._id}`)
                      }
                    >
                      {survey.userHasAttended
                        ? "Attended"
                        : survey.isPublished
                          ? "Attend"
                          : "Coming Soon"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage > 1) {
                      handlePageChange(pagination.currentPage - 1);
                    }
                  }}
                  className={
                    pagination.currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
              {[...Array(pagination.totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(index + 1);
                    }}
                    isActive={pagination.currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.currentPage < pagination.totalPages) {
                      handlePageChange(pagination.currentPage + 1);
                    }
                  }}
                  className={
                    pagination.currentPage >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default ActiveSurveys;
