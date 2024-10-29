import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchSurveyDetails,
  submitSurveyResponses,
  selectCurrentSurvey,
  selectCurrentSurveyLoading,
  selectCurrentSurveyError,
  selectSubmissionStatus,
  resetSubmissionStatus,
} from "../../slices/userSlice";

const AttendSurvey = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const surveyId = searchParams.get("surveyId");
  const survey = useSelector(selectCurrentSurvey);
  const isLoading = useSelector(selectCurrentSurveyLoading);
  const error = useSelector(selectCurrentSurveyError);
  const submissionStatus = useSelector(selectSubmissionStatus);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyDetails(surveyId));
    }

    return () => {
      dispatch(resetSubmissionStatus());
    };
  }, [dispatch, surveyId]);

  useEffect(() => {
    if (submissionStatus === "succeeded") {
      alert("Survey submitted successfully!");
      navigate("/user/surveys");
    }
  }, [submissionStatus, navigate]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    dispatch(
      submitSurveyResponses({
        surveyId,
        responses: answers,
      })
    );
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "mcq":
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswer(question.id, option)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = answers[question.id] || [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a) => a !== option);
                    handleAnswer(question.id, newAnswers);
                  }}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <Input
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
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
                variant={answers[question.id] === num ? "default" : "outline"}
                size="sm"
                onClick={() => handleAnswer(question.id, num)}
                className={answers[question.id] === num ? "bg-red-600" : ""}
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{survey.surveyName}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {survey.pages.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm min-h-[600px] relative">
          <div className="p-6">
            {survey.pages[currentPage]?.questions.map((question, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">{question.question}</h3>
                  {renderQuestion(question)}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentPage === survey.pages.length - 1 ? (
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
                  setCurrentPage((prev) =>
                    Math.min(survey.pages.length - 1, prev + 1)
                  )
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
