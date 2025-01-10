import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSurveys, clearMessage } from "@/slices/creatorSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  AlertCircle,
  Users,
  Calendar,
  Target,
  Banknote,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsePieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CreatorHome = () => {
  const dispatch = useDispatch();
  const { surveys, isLoading, error } = useSelector((state) => state.creator);

  useEffect(() => {
    dispatch(getAllSurveys());
    clearMessage();
  }, [dispatch]);

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

  if (!surveys?.data?.length) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-5 w-5 text-gray-500" />
        <AlertDescription>No surveys found</AlertDescription>
      </Alert>
    );
  }

  // Calculate summary statistics
  const totalSurveys = surveys.data.length;
  const totalResponses = surveys.data.reduce(
    (sum, survey) => sum + survey.totalResponses,
    0
  );
  const totalSampleSize = surveys.data.reduce(
    (sum, survey) => sum + survey.sampleSize,
    0
  );
  const averagePrice =
    surveys.data.reduce((sum, survey) => sum + survey.price, 0) / totalSurveys;

  const categoryData = surveys.data.reduce((acc, survey) => {
    survey.categories.forEach((category) => {
      acc[category.name] = (acc[category.name] || 0) + 1;
    });
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const surveyCreationAndResponses = surveys.data.map((survey) => ({
    date: new Date(survey.created_at).toLocaleDateString(),
    responses: survey.totalResponses,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">Summary of your survey performance</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Surveys
                </p>
                <p className="text-2xl font-bold">{totalSurveys}</p>
              </div>
              <PieChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Responses
                </p>
                <p className="text-2xl font-bold">{totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Response Rate
                </p>
                <p className="text-2xl font-bold">
                  {((totalResponses / totalSampleSize) * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold">
                  SOL {averagePrice.toFixed(3)}
                </p>
              </div>
              <Banknote className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsePieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Response Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={surveyCreationAndResponses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="responses"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Surveys Grid */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">Your Surveys</h2>
        <p className="text-gray-600">Manage and monitor your active surveys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.data.map((survey) => (
          <Card key={survey._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{survey.surveyName}</span>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {survey.status}
                </span>
              </CardTitle>
              <p className="text-sm text-gray-600 truncate">
                {survey.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Responses</span>
                  </div>
                  <span className="font-semibold">
                    {survey.totalResponses} / {survey.sampleSize}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(survey.duration.startDate).toLocaleDateString()} -
                    {new Date(survey.duration.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-gray-600">Categories:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {survey.categories.map((category) => (
                      <span
                        key={category._id}
                        className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>

                {!survey.targetAgeRange.isAllAges && (
                  <div className="text-sm text-gray-600">
                    Age Range: {survey.targetAgeRange.minAge} -{" "}
                    {survey.targetAgeRange.maxAge}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreatorHome;
