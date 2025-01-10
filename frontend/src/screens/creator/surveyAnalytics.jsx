import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, Target, AlertCircle, Clock } from "lucide-react";
import { getAnalytics } from "@/slices/creatorSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SurveyAnalytics = () => {
  const { surveyId } = useParams();
  const dispatch = useDispatch();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        await dispatch(getAnalytics({ surveyId }));
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching analytics");
      }
    };

    if (surveyId) {
      fetchAnalytics();
    }
  }, [surveyId, dispatch]);

  const isLoading = useSelector((state) => state.creator.isLoading);
  const analyticsData = useSelector((state) => state.creator.analyticsData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Clock className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-5 w-5 text-gray-500" />
        <AlertDescription>No analytics data available</AlertDescription>
      </Alert>
    );
  }

  const {
    surveyName,
    description,
    totalResponses,
    sampleSize,
    responseTimeline,
    questionsAnalytics,
  } = analyticsData;

  return (
    <div className="p-6 space-y-6">
      {/* Survey Overview */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-800">{surveyName}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Total Responses</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalResponses}</div>
            <p className="text-sm text-gray-500">of {sampleSize} target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle>Completion Rate</CardTitle>
            <Target className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {((totalResponses / sampleSize) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Timeline */}
      {responseTimeline?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Response Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Analytics */}
      <div className="space-y-6">
        {questionsAnalytics.map((question, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{question.questionText}</CardTitle>
              <p className="text-sm text-gray-500">
                Type: {question.questionType}
              </p>
            </CardHeader>
            <CardContent>
              {(question.questionType === "multiple_choice" ||
                question.questionType === "single_choice") &&
              question.analytics.options.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={question.analytics.options}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="optionText" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : question.questionType === "rating" ? (
                <div className="flex items-center">
                  <p className="text-gray-500 text-lg">
                    Average Rating:{" "}
                    <span className="text-blue-500 font-bold text-xl">
                      {question.analytics.averageRating}
                    </span>
                  </p>
                </div>
              ) : question.questionType === "text" ? (
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    Word Count Analysis
                  </h3>
                  {question.analytics?.topWords?.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {question.analytics.topWords.map((word, i) => (
                        <li key={i} className="text-gray-700">
                          <span className="font-bold text-blue-500">
                            {word.word}
                          </span>
                          : {word.count}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No significant words found
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Text responses cannot be visualized
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveyAnalytics;
