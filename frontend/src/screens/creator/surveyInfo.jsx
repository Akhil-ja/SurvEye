/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { BarChart } from "lucide-react";
import { clearMessage, getSurvey, publishSurvey } from "@/slices/creatorSlice";
import PaymentModal from "@/components/paymentModal";

const theme = {
  primary: "hsl(24.6, 95%, 43.1%)",
  primaryLight: "hsl(24.6, 95%, 53.1%)",
  backgroundColor: "hsl(37, 100%, 95%)",
};

function SurveyDetails() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const { data, loading, error } = useSelector((state) => state.creator);

  useEffect(() => {
    if (surveyId) {
      dispatch(getSurvey({ surveyId }))
        .unwrap()
        .catch((error) => console.error("Error fetching survey:", error));
    }
    dispatch(clearMessage());
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

  const handleSubmit = () => {
    setPaymentModalVisible(true);
  };

  const handlePublishSurvey = () => {
    if (surveyId) {
      dispatch(publishSurvey(surveyId))
        .unwrap()
        .then(() => {
          console.log("Survey published successfully");
          dispatch(getSurvey({ surveyId }))
            .unwrap()
            .then(() => console.log("Survey refreshed"))
            .catch((error) => console.error("Error refreshing survey:", error));
        })
        .catch((error) =>
          console.error("Error publishing survey:", error.message)
        );
    }
    setPaymentModalVisible(false);
  };

  const handleViewAnalytics = () => {
    navigate(`/creator/analytics/${surveyId}`);
  };

  return (
    <div
      className="max-w-10xl mx-auto my-8 p-8 bg-[#fcf5f0] shadow-lg rounded-2xl border border-[#e0e0e0]"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="text-[#333] font-bold">
          Survey Details
        </Typography>
        {data.data.isPublished && (
          <Button
            variant="contained"
            startIcon={<BarChart />}
            onClick={handleViewAnalytics}
            style={{
              backgroundColor: theme.primary,
              marginLeft: "1rem",
            }}
          >
            View Analytics
          </Button>
        )}
      </div>

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
                Categories:
              </span>{" "}
              {data.data.categories.map((category) => category.name).join(", ")}
            </Typography>
            <Typography variant="h6" className="text-[#333]">
              <span className="font-semibold" style={{ color: theme.primary }}>
                Price:
              </span>{" "}
              {data.data.price} SOL
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
            {data.data.status === "draft" && (
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "16px", backgroundColor: theme.primary }}
                onClick={handleSubmit}
              >
                Publish Survey
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      {paymentModalVisible && (
        <PaymentModal
          price={data.data.price}
          onPaymentSuccess={handlePublishSurvey}
          onCancel={() => setPaymentModalVisible(false)}
        />
      )}
    </div>
  );
}

export default SurveyDetails;
