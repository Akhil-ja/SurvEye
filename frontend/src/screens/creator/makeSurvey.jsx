/* eslint-disable react/react-in-jsx-scope */
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSurvey, submitSurvey } from "@/slices/creatorSlice";
import { useNavigate } from "react-router-dom";
import SurveyPriceCalculator from "@/components/surveyPriceCalculator";
import { calculateSurveyPrice } from "@/utils/calculatePrice";
import PaymentModal from "@/components/paymentModal";
import { clearMessage } from "@/slices/creatorSlice";

const SurveyBuilder = () => {
  const [pages, setPages] = useState([{ questions: [] }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surveyId = searchParams.get("surveyId");

  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.creator);

  let price = null;

  if (data && !loading && !error) {
    price = calculateSurveyPrice(
      pages,
      data.data.sampleSize,
      Math.ceil(
        (new Date(data.data.duration.endDate) -
          new Date(data.data.duration.startDate)) /
          (1000 * 60 * 60 * 24)
      )
    ).totalPrice;
  }

  if (loading) {
    <p>Loading...</p>;
  }

  useEffect(() => {
    if (surveyId) {
      dispatch(getSurvey({ surveyId }))
        .unwrap()
        .catch((error) => console.error("Error fetching survey:", error));
    }

    const savedPages = localStorage.getItem(`surveyProgress-${surveyId}`);
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        console.error("Error loading saved survey:", e);
      }
    }
    dispatch(clearMessage());
  }, [dispatch, surveyId]);

  useEffect(() => {
    localStorage.setItem(`surveyProgress-${surveyId}`, JSON.stringify(pages));
  }, [pages, currentPage, surveyId]);

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

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      question: "",
      options: type === "mcq" || type === "checkbox" ? [""] : [],
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
      options.push("");
      setPages(updatedPages);
    } else {
      toast.error("Maximum of 5 options allowed!");
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

  const removeOption = (questionIndex, optionIndex) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].questions[questionIndex].options.splice(
      optionIndex,
      1
    );
    setPages(updatedPages);
  };

  const removeQuestion = () => {
    const updatedPages = [...pages];
    updatedPages[currentPage].questions = [];
    setPages(updatedPages);
  };

  const deletePage = (pageIndex) => {
    if (pages.length === 1) {
      toast.warn("Cannot Delete the last page.");
      return;
    }

    if (pages[pageIndex].questions.length > 0) {
      setPageToDelete(pageIndex);
      setShowDeleteDialog(true);
    } else {
      confirmDeletePage(pageIndex);
    }
  };

  const confirmDeletePage = (pageIndex) => {
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    setPages(updatedPages);
    setCurrentPage(Math.min(currentPage, updatedPages.length - 1));
    setShowDeleteDialog(false);
    toast.success("Page deleted successfully");
  };

  const addPage = () => {
    if (
      pages[currentPage].questions.length === 0 ||
      pages[currentPage].questions[0].question.trim() === ""
    ) {
      toast.error(
        "Please add a question to the current page before adding a new page!"
      );
      return;
    }

    setPages([...pages, { questions: [] }]);
    setCurrentPage(pages.length);
  };

  const isValid = pages.every((page) => {
    if (page.questions.length === 0) return false;

    return page.questions.every((question) => {
      const trimmedQuestion = question.question.trim();
      if (trimmedQuestion === "") return false;

      if (question.type === "mcq" || question.type === "checkbox") {
        return question.options.every((option) => option.trim() !== "");
      }

      return true;
    });
  });

  const handleSave = () => {
    if (!isValid) {
      toast.error(
        "Please fill in all questions and options before submitting!"
      );
      return;
    }

    localStorage.removeItem(`surveyProgress-${surveyId}`);
    dispatch(
      submitSurvey({
        surveyData: surveyData,
        actionType: "draft",
        price: price,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Survey Saved succesfully");
        localStorage.removeItem(`surveyProgress-${surveyId}`);
        navigate(`/creator/surveylist`);
      })
      .catch((error) => {
        console.error("Error saving survey:", error);
      });
  };

  const handleSubmit = () => {
    if (!isValid) {
      toast.error(
        "Please fill in all questions and options before submitting!"
      );
      return;
    }

    setPaymentModalVisible(true);
  };

  const completeSurveySubmission = () => {
    localStorage.removeItem(`surveyProgress-${surveyId}`);
    dispatch(
      submitSurvey({
        surveyData: surveyData,
        actionType: "active",
        price: price,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Survey submitted");
        localStorage.removeItem(`surveyProgress-${surveyId}`);

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
            <Button variant="" className="" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>

        {data?.data && (
          <>
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold">{data.data.surveyName}</h2>
              <p className="text-sm text-gray-600">
                {" "}
                {data.data.categories
                  .map((category) => category.name)
                  .join(", ")}
              </p>
            </div>
            <SurveyPriceCalculator pages={pages} surveyData={data.data} />
          </>
        )}

        {showReview ? (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Review Your Survey</h2>
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    Page {pageIndex + 1}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => deletePage(pageIndex)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Page
                  </Button>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Page</DialogTitle>
            <DialogDescription>
              This page contains questions. Are you sure you want to delete this
              page and all its contents?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeletePage(pageToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {paymentModalVisible && (
        <PaymentModal
          price={price}
          onPaymentSuccess={completeSurveySubmission}
          onCancel={() => setPaymentModalVisible(false)}
        />
      )}
    </div>
  );
};

export default SurveyBuilder;
