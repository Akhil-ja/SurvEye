/* eslint-disable react/react-in-jsx-scope */
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSurvey, submitSurvey } from "@/slices/creatorSlice";
import { useNavigate } from "react-router-dom";

const SurveyBuilder = () => {
  const [pages, setPages] = useState([{ questions: [] }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surveyId = searchParams.get("surveyId");
  console.log(surveyId);

  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.creator);

  useEffect(() => {
    if (surveyId) {
      dispatch(getSurvey({ surveyId }))
        .unwrap()
        .then((result) => console.log("Survey data:", result))
        .catch((error) => console.error("Error fetching survey:", error));
    }
  }, [dispatch, surveyId]);

  useEffect(() => {
    const savedPages = sessionStorage.getItem("surveyProgress");
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        console.error("Error loading saved survey:", e);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("surveyProgress", JSON.stringify(pages));
  }, [pages, currentPage]);

  const surveyData = {
    surveyId: surveyId,
    pages: pages,
  };

  const questionTypes = [
    { id: "mcq", label: "Multiple Choice", icon: "⭕" },
    { id: "checkbox", label: "Checkbox List", icon: "☑️" },
    { id: "text", label: "Text Input", icon: "📝" },
    { id: "rating", label: "Rating Scale", icon: "⭐" },
  ];

  const validateFields = (question) => {
    if (!question.text) {
      toast.error("Question text cannot be empty");
      return false;
    }
    if (question.options.length === 0) {
      toast.error("Options cannot be empty");
      return false;
    }
    if (question.options.some((option) => option.text.trim() === "")) {
      toast.error("Option fields cannot be empty");
      return false;
    }
    if (question.options.length > 5) {
      toast.error("A maximum of 5 options is allowed for each question");
      return false;
    }
    return true;
  };

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      question: "",
      options: type === "mcq" || type === "checkbox" ? ["", ""] : [],
    };

    const updatedPages = [...pages];

    if (
      updatedPages[currentPage].questions.length === 0 ||
      updatedPages[currentPage].questions[0].question !== ""
    ) {
      updatedPages[currentPage].questions = [newQuestion];
      setPages(updatedPages);
      setShowQuestionTypes(false);
    } else {
      toast.error(
        "Please fill in the existing question before adding a new one!"
      );
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedPages = [...pages];

    if (field === "question" && value.trim() === "") {
      toast.error("Question cannot be empty!");
      return;
    }

    updatedPages[currentPage].questions[questionIndex][field] = value;
    setPages(updatedPages);
  };

  const addOption = (questionIndex) => {
    const updatedPages = [...pages];
    const options = updatedPages[currentPage].questions[questionIndex].options;

    const emptyOptionIndex = options.findIndex(
      (option) => option.trim() === ""
    );
    if (emptyOptionIndex !== -1) {
      toast.error(`Option ${emptyOptionIndex + 1} cannot be empty!`);
      return;
    }

    if (options.length < 5) {
      options.push(`Option ${options.length + 1}`);
      setPages(updatedPages);
    } else {
      toast.error("Maximum of 5 options allowed!");
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].questions[questionIndex].options.splice(
      optionIndex,
      1
    );
    setPages(updatedPages);
  };

  const removeQuestion = (questionIndex) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].questions = [];
    setPages(updatedPages);
  };

  const addPage = () => {
    setPages([...pages, { questions: [] }]);
    setCurrentPage(pages.length);
  };

  const handleSubmit = () => {
    const isValid = pages.every(
      (page) =>
        page.questions.length > 0 &&
        page.questions.every((question) => question.question.trim() !== "")
    );

    if (!isValid) {
      toast.error("Please fill in all questions before submitting!");
      return;
    }

    toast.success("Survey submitted");
    sessionStorage.removeItem("surveyProgress");
    dispatch(submitSurvey(surveyData))
      .unwrap()
      .then((result) => {
        console.log("Survey submitted successfully:", result);
        sessionStorage.removeItem("surveyProgress");
        navigate(`/creator/surveyinfo?surveyId=${surveyId}`);
      })
      .catch((error) => {
        console.error("Error submitting survey:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Survey</h1>
          <h2 className="text-2xl font-bold"></h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {pages.length}
            </span>
            <Button
              variant="outline"
              className="text-red-600"
              onClick={handleSubmit}
            >
              Finish
            </Button>
          </div>
        </div>

        {data?.data && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold">{data.data.surveyName}</h2>
            <p className="text-sm text-gray-600">{data.data.category}</p>
          </div>
        )}

        {showReview ? (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Review Your Survey</h2>
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Page {pageIndex + 1}
                </h3>
                {page.questions.map((question, qIndex) => (
                  <Card key={qIndex} className="mb-4">
                    <CardContent className="p-4">
                      <p className="font-medium mb-2">
                        {question.question || "Untitled Question"}
                      </p>
                      <div className="ml-4">
                        {(question.type === "mcq" ||
                          question.type === "checkbox") && (
                          <div className="space-y-1">
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center space-x-2"
                              >
                                {question.type === "mcq" ? (
                                  <input type="radio" disabled />
                                ) : (
                                  <input type="checkbox" disabled />
                                )}
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === "text" && (
                          <Input
                            disabled
                            placeholder="Text answer will appear here"
                          />
                        )}
                        {question.type === "rating" && (
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Button
                                key={num}
                                variant="outline"
                                size="sm"
                                disabled
                              >
                                {num}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(pageIndex);
                    setShowReview(false);
                  }}
                  className="mt-2"
                >
                  Edit Page {pageIndex + 1}
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setShowReview(false)}
              className="mt-4"
            >
              Back to Editor
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm min-h-[600px] relative">
            <div className="p-6">
              {pages[currentPage].questions.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Dialog
                    open={showQuestionTypes}
                    onOpenChange={setShowQuestionTypes}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-32 h-32 bg-transparent hover:bg-gray-100 flex flex-col items-center justify-center"
                        onClick={() => setShowQuestionTypes(true)}
                      >
                        <Plus className="h-12 w-12 mb-2 text-gray-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose Question Type</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {questionTypes.map((type) => (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center"
                            onClick={() => addQuestion(type.id)}
                          >
                            <span className="text-2xl mb-2">{type.icon}</span>
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                pages[currentPage].questions.map((question, qIndex) => (
                  <Card key={qIndex} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Input
                          placeholder="Enter your question"
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, "question", e.target.value)
                          }
                          className="flex-1 mr-2"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {(question.type === "mcq" ||
                        question.type === "checkbox") && (
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center space-x-2"
                            >
                              {question.type === "mcq" ? (
                                <input type="radio" disabled className="mr-2" />
                              ) : (
                                <input
                                  type="checkbox"
                                  disabled
                                  className="mr-2"
                                />
                              )}
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const updatedPages = [...pages];
                                  updatedPages[currentPage].questions[
                                    qIndex
                                  ].options[oIndex] = e.target.value;
                                  setPages(updatedPages);
                                }}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(qIndex, oIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(qIndex)}
                            className="mt-2"
                          >
                            Add Option
                          </Button>
                        </div>
                      )}

                      {question.type === "rating" && (
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <Button
                              key={num}
                              variant="outline"
                              size="sm"
                              disabled
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      )}

                      {question.type === "text" && (
                        <Input
                          disabled
                          placeholder="Text answer will appear here"
                          className="bg-gray-50"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={() => setShowReview(true)}>
                Review Survey
              </Button>
              <Button variant="outline" onClick={addPage}>
                Add Page
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
                }
                disabled={currentPage === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyBuilder;
