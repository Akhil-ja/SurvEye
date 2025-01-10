import { useState, useEffect, React } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchSurveyDetails,
  submitSurveyResponses,
  selectCurrentSurvey,
  selectCurrentSurveyLoading,
  selectCurrentSurveyError,
  selectSubmissionStatus,
  resetSubmissionStatus,
  clearMessage,
} from "../../slices/userSlice";

const LOCAL_STORAGE_KEY_PREFIX = "survey_progress_";

const AttendSurvey = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const surveyId = searchParams.get("surveyId");
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${surveyId}`;

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(`${storageKey}_page`);
    return saved ? parseInt(saved) : 1;
  });

  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`${storageKey}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  const [lastUpdated] = useState(() => {
    const saved = sessionStorage.getItem(`${storageKey}_lastUpdated`);
    return saved ? new Date(saved) : new Date();
  });

  const survey = useSelector(selectCurrentSurvey);
  const isLoading = useSelector(selectCurrentSurveyLoading);
  const error = useSelector(selectCurrentSurveyError);
  const submissionStatus = useSelector(selectSubmissionStatus);

  useEffect(() => {
    sessionStorage.setItem(`${storageKey}_answers`, JSON.stringify(answers));
    sessionStorage.setItem(`${storageKey}_page`, currentPage.toString());
    sessionStorage.setItem(
      `${storageKey}_lastUpdated`,
      new Date().toISOString()
    );
  }, [answers, currentPage, storageKey]);

  useEffect(() => {
    if (survey?.data?.survey) {
      const defaultAnswers = {};
      survey.data.survey.questions.forEach((q) => {
        defaultAnswers[q._id] = "";
      });
      setAnswers((prev) => ({ ...defaultAnswers, ...prev }));
    }
  }, [survey]);

  useEffect(() => {
    return () => {
      dispatch(resetSubmissionStatus());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyDetails(surveyId));
      dispatch(clearMessage());
    }
    return () => {
      dispatch(resetSubmissionStatus());
      dispatch(clearMessage());
    };
  }, [dispatch, surveyId]);

  useEffect(() => {
    if (submissionStatus === "succeeded") {
      clearsessionStorage();
      toast.success("Survey submitted successfully!");
      navigate("/user/survey");
      dispatch(resetSubmissionStatus());
      dispatch(clearMessage());
    }
  }, [submissionStatus, navigate, dispatch]);

  const clearsessionStorage = () => {
    sessionStorage.removeItem(`${storageKey}_answers`);
    sessionStorage.removeItem(`${storageKey}_page`);
    sessionStorage.removeItem(`${storageKey}_lastUpdated`);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    const formattedResponses = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer: Array.isArray(answer)
          ? answer.map((a) => a.toString())
          : answer.toString(),
      })
    );

    dispatch(
      submitSurveyResponses({
        surveyId,
        responses: formattedResponses,
      })
    );
  };

  useEffect(() => {
    if (error) {
      toast.error(`${error}`);
      dispatch(clearMessage());
    }
  }, [error, dispatch]);

  // const ResumeBanner = () => {
  //   if (Object.keys(answers).length > 0) {
  //     return (
  //       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
  //         <div className="flex justify-between items-center">
  //           <div>
  //             <p className="text-sm text-blue-700">
  //               You have an ongoing survey session
  //             </p>
  //             <p className="text-xs text-blue-600">
  //               Last updated: {new Date(lastUpdated).toLocaleString()}
  //             </p>
  //           </div>
  //           <Button
  //             variant="outline"
  //             size="sm"
  //             onClick={clearsessionStorage}
  //             className="text-blue-700 hover:text-blue-800"
  //           >
  //             Clear Progress
  //           </Button>
  //         </div>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderQuestion = (question) => {
    switch (question.questionType) {
      case "single_choice":
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option._id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  checked={answers[question._id] === option.value}
                  onChange={() => handleAnswer(question._id, option.value)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm">{option.text}</span>
              </div>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={answers[question._id]?.includes(option.value)}
                  onChange={(e) => {
                    const currentAnswers = answers[question._id] || [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option.value]
                      : currentAnswers.filter((a) => a !== option.value);
                    handleAnswer(question._id, newAnswers);
                  }}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm">{option.text}</span>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <Input
            value={answers[question._id] || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder="Enter your answer"
            className="mt-2"
          />
        );

      case "rating":
        return (
          <div className="flex space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={answers[question._id] === num ? "default" : "outline"}
                size="sm"
                onClick={() => handleAnswer(question._id, num)}
                className={`${
                  answers[question._id] === num
                    ? "bg-red-600 hover:bg-red-700"
                    : "hover:bg-gray-100"
                } min-w-[40px]`}
              >
                {num}
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-lg">Loading survey...</p>
      </div>
    );
  }

  if (!survey?.data?.survey) {
    return null;
  }

  const surveyData = survey.data.survey;
  const currentQuestions = surveyData.questions.filter(
    (q) => q.pageNumber === currentPage
  );
  const totalPages = Math.max(...surveyData.questions.map((q) => q.pageNumber));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* <ResumeBanner /> */}

        {/* Survey Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {surveyData.surveyName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(surveyData.duration.startDate)} -{" "}
                    {formatDate(surveyData.duration.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Target Age Range</p>
                  <p className="text-sm text-gray-500">
                    {surveyData.targetAgeRange.isAllAges
                      ? "All Ages"
                      : `${surveyData.targetAgeRange.minAge} - ${surveyData.targetAgeRange.maxAge} years`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Sample Size</p>
                  <p className="text-sm text-gray-500">
                    {surveyData.totalResponses} of {surveyData.sampleSize}{" "}
                    responses
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {surveyData.description}
            </p>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-sm min-h-[400px] relative">
          <div className="p-6 pb-24">
            {currentQuestions.map((question) => (
              <Card key={question._id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium">{question.questionText}</h3>
                    {question.required && (
                      <span className="text-xs text-red-500">*Required</span>
                    )}
                  </div>
                  {renderQuestion(question)}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>

            {currentPage === totalPages ? (
              <Button
                onClick={handleSubmit}
                disabled={submissionStatus === "submitting"}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submissionStatus === "submitting"
                  ? "Submitting..."
                  : "Submit Survey"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendSurvey;
