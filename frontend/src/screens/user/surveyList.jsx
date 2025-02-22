import { useEffect, useState, useCallback, React } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getSurvey,
  selectSurveyPagination,
  selectSurveyLoading,
  selectSurveyError,
  setSortBy,
  setSortOrder,
  selectSortBy,
  selectSortOrder,
  clearMessage,
  fetchUserProfile,
} from "../../slices/userSlice";

const ActiveSurveys = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pagination = useSelector(selectSurveyPagination);
  const loading = useSelector(selectSurveyLoading);
  const error = useSelector(selectSurveyError);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);

  const [mergedSurveys, setMergedSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [profileState, setProfileState] = useState({
    isComplete: false,
    isLoading: true,
    hasOccupation: false,
    hasAge: false,
    hasWallet: false,
  });

  const fetchSurveys = useCallback(async () => {
    try {
      const [activeSurveysResponse, attendedSurveysResponse] =
        await Promise.all([
          dispatch(
            getSurvey({
              page: pagination.currentPage,
              limit: 6,
              sort: sortBy,
              order: sortOrder,
            })
          ).unwrap(),
          dispatch(
            getSurvey({
              page: pagination.currentPage,
              limit: 6,
              sort: sortBy,
              order: sortOrder,
              attended: true,
            })
          ).unwrap(),
        ]);

      const attendedIds = new Set(
        attendedSurveysResponse.data.surveys.map((survey) => survey._id)
      );

      const updatedSurveys = activeSurveysResponse.data.surveys.map(
        (survey) => ({
          ...survey,
          userHasAttended: attendedIds.has(survey._id),
        })
      );

      setMergedSurveys(updatedSurveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  }, [dispatch, pagination.currentPage, sortBy, sortOrder]);

  // Initial profile check and survey fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        const result = await dispatch(fetchUserProfile()).unwrap();

        const hasOcc = !!result.user.occupation;
        const age = !!result.user.age;
        const wallet = !!result.user.wallet;
        const isComplete = hasOcc && age && wallet;

        setProfileState({
          isComplete,
          isLoading: false,
          hasOccupation: hasOcc,
          hasAge: age,
          hasWallet: wallet,
        });

        if (isComplete) {
          await fetchSurveys();
          dispatch(clearMessage());
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setProfileState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeData();
  }, [dispatch, fetchSurveys]);

  // Handle search and filtering with debounce
  useEffect(() => {
    const filtered = mergedSurveys.filter((survey) =>
      survey.surveyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSurveys(filtered);
  }, [mergedSurveys, searchTerm]);

  const handlePageChange = useCallback(
    (page) => {
      dispatch(getSurvey({ page, sort: sortBy, order: sortOrder }));
    },
    [dispatch, sortBy, sortOrder]
  );

  const handleSortChange = useCallback(
    (value) => {
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
    },
    [dispatch]
  );

  const formatDate = useCallback((dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  }, []);

  if (profileState.isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!profileState.isComplete) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-3xl mx-auto">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 font-semibold">
              Profile Incomplete
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              Please complete your profile before viewing surveys. Make sure to
              add:
              <ul className="list-disc ml-6 mt-2">
                {!profileState.hasOccupation && <li>Your occupation</li>}
                {!profileState.hasAge && <li>Your date of birth</li>}
                {!profileState.hasWallet && <li>Connect your solana wallet</li>}
              </ul>
              <button
                onClick={() => navigate("/user/profile")}
                className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
              >
                Complete Profile
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
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

  if (loading) {
    return <div className="text-center p-8">Loading surveys...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Active Surveys</h1>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search surveys..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        {filteredSurveys.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No surveys found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <Card key={survey._id} className="bg-pink-50">
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    {survey.surveyName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {survey.description}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created by: {survey.creatorName}</p>
                      <p>
                        Category:{" "}
                        {survey.categories
                          .map((category) => category.name)
                          .join(", ")}
                      </p>
                      <p>Sample Size: {survey.sampleSize}</p>
                      <p>
                        Age Range:{" "}
                        {survey.targetAgeRange?.isAllAges
                          ? "All Ages"
                          : `${survey.targetAgeRange?.minAge || "N/A"} - ${survey.targetAgeRange?.maxAge || "N/A"}`}
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
        )}

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
