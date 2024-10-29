import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getSurvey } from "@/slices/creatorSlice";

const theme = {
  primary: "hsl(24.6, 95%, 43.1%)",
  primaryLight: "hsl(24.6, 95%, 53.1%)",
  backgroundColor: "hsl(37, 100%, 95%)",
};

function SurveyDetails() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="primary" size={80} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mt-4">
        <Alert severity="error" className="max-w-md w-full">
          Error: {error.message}
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div
      className="max-w-10xl mx-auto my-8 p-8 bg-[#fcf5f0] shadow-lg rounded-2xl border border-[#e0e0e0]"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <Typography
        variant="h4"
        align="center"
        className="text-[#333] mb-8 font-bold"
      >
        Survey Details
      </Typography>

      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <Card
          className="border border-[#007bff] shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl"
          style={{ borderColor: theme.primary }}
        >
          <CardContent>
            <Typography variant="h6" className="text-[#333]">
              <span className="font-semibold" style={{ color: theme.primary }}>
                Survey Name:
              </span>{" "}
              {data.data.surveyName}
            </Typography>
            <Typography variant="h6" className="text-[#333]">
              <span className="font-semibold" style={{ color: theme.primary }}>
                Category:
              </span>{" "}
              {data.data.category}
            </Typography>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 mt-6">
        <Typography
          variant="h5"
          className="text-[#333] font-semibold"
          style={{ color: theme.primary }}
        >
          Questions
        </Typography>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.data.questions.map((question, index) => (
            <Card
              key={index}
              className="border border-[#e0e0e0] shadow-md p-4 rounded-2xl hover:bg-[#f5f5f5] transition-colors duration-200"
              style={{
                borderColor: theme.primaryLight,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  className="text-[#333] font-semibold"
                  style={{ color: theme.primary }}
                >
                  Question {index + 1}: {question.questionText}
                </Typography>
                <Typography color="#666" className="mt-1">
                  <span className="font-medium">Type:</span>{" "}
                  {question.questionType}
                </Typography>
                <Typography color="#666">
                  <span className="font-medium">Required:</span>{" "}
                  {question.required ? "Yes" : "No"}
                </Typography>
                <Typography color="#666">
                  <span className="font-medium">Page Number:</span>{" "}
                  {question.pageNumber}
                </Typography>
                <Typography
                  variant="subtitle1"
                  className="mt-4 text-[#333] font-semibold"
                  style={{ color: theme.primary }}
                >
                  Options:
                </Typography>
                <ul className="list-disc pl-6 space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <li key={optionIndex} className="text-[#666]">
                      {option.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Typography
          variant="h5"
          className="text-[#333] font-semibold"
          style={{ color: theme.primary }}
        >
          Survey Status
        </Typography>
        <Card
          className="mt-4 border border-[#007bff] shadow-md p-4 rounded-2xl"
          style={{ borderColor: theme.primary }}
        >
          <CardContent>
            <Typography color="#666" className="mt-1">
              <span className="font-medium">Status:</span> {data.data.status}
            </Typography>
            <Typography color="#666">
              <span className="font-medium">Published:</span>{" "}
              {data.data.isPublished ? "Yes" : "No"}
            </Typography>
            <Typography color="#666">
              <span className="font-medium">Created:</span>{" "}
              {new Date(data.data.created_at).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SurveyDetails;