import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage } from "@/slices/creatorSlice";
import { getSurveys, toggleSurveyStatus } from "@/slices/adminSlice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

const SurveyPage = () => {
  const dispatch = useDispatch();
  const { surveys, isLoading, error } = useSelector((state) => state.admin);

  const [formattedSurveys, setFormattedSurveys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [surveysPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    dispatch(getSurveys());
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (surveys && surveys.length > 0) {
      const newFormattedSurveys = surveys.map((survey) => ({
        id: survey._id,
        name: survey.surveyName,
        creatorName: survey.creatorName,
        startDate: new Date(survey.duration.startDate).toLocaleDateString(),
        endDate: new Date(survey.duration.endDate).toLocaleDateString(),
        status: survey.status,
        amount: survey.price,
        impressions: survey.totalResponses,
        remaining: survey.sampleSize - survey.totalResponses,
      }));
      setFormattedSurveys(newFormattedSurveys);
    }
  }, [surveys]);

  useEffect(() => {
    if (formattedSurveys.length > 0) {
      const sortedSurveys = [...formattedSurveys].sort((a, b) => {
        if (sortBy === "cost") {
          return sortOrder === "highest"
            ? b.amount - a.amount
            : a.amount - b.amount;
        } else if (sortBy === "date") {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        }
        return 0;
      });
      setFormattedSurveys(sortedSurveys);
    }
  }, [sortBy, sortOrder]);

  const handleToggleStatus = async (surveyId, currentStatus) => {
    try {
      const result = await dispatch(toggleSurveyStatus(surveyId));

      if (toggleSurveyStatus.fulfilled.match(result)) {
        toast.success(
          `Survey ${
            currentStatus === "active" ? "deactivated" : "activated"
          } successfully`
        );
      } else {
        toast.error(result.payload || "Failed to toggle survey status");
      }
    } catch (error) {
      toast.error("Failed to toggle survey status");
      console.log(error);
    }
  };

  const indexOfLastSurvey = currentPage * surveysPerPage;
  const indexOfFirstSurvey = indexOfLastSurvey - surveysPerPage;
  const currentSurveys = formattedSurveys.slice(
    indexOfFirstSurvey,
    indexOfLastSurvey
  );
  const totalPages = Math.ceil(formattedSurveys.length / surveysPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-gray-100">
      <Card>
        <CardHeader>
          <CardTitle>Survey List</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue
                  placeholder={sortBy === "cost" ? "Highest" : "Newest"}
                />
              </SelectTrigger>
              <SelectContent>
                {sortBy === "cost" ? (
                  <>
                    <SelectItem value="highest">Highest</SelectItem>
                    <SelectItem value="lowest">Lowest</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Link to={"/creator/survey"}>
              <Button variant="primary" className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Survey</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading surveys...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : formattedSurveys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active surveys found.{" "}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Creator Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Toggle</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.creatorName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.startDate}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.endDate}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.amount}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          survey.status === "active"
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {survey.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={survey.status === "active"}
                        onCheckedChange={() =>
                          handleToggleStatus(survey.id, survey.status)
                        }
                        className="ml-4"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.impressions}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/creator/surveyinfo?surveyId=${survey.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {survey.remaining}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-center items-center w-full">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index}
                  variant={index + 1 === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SurveyPage;
