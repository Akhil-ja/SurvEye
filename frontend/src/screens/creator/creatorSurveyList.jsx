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
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSurveys } from "@/slices/creatorSlice";

const CreatorHome = () => {
  const dispatch = useDispatch();
  const { surveys, isLoading, error } = useSelector((state) => state.creator);
  const [formattedSurveys, setFormattedSurveys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [surveysPerPage] = useState(10);

  useEffect(() => {
    dispatch(getAllSurveys());
  }, [dispatch]);

  useEffect(() => {
    if (surveys && surveys.data && surveys.data.length > 0) {
      const newFormattedSurveys = surveys.data.map((survey) => ({
        id: survey._id,
        name: survey.surveyName,
        creatorName: survey.creatorName,
        startDate: new Date(survey.duration.startDate).toLocaleDateString(),
        endDate: new Date(survey.duration.endDate).toLocaleDateString(),
        status: survey.isPublished ? "active" : "draft",
        amount: survey.amount,
        impressions: survey.impressions,
        remaining: survey.remaining,
      }));
      setFormattedSurveys(newFormattedSurveys);
    }
  }, [surveys]);

  if (isLoading) return <div>Loading surveys...</div>;
  if (error) return <div>Error fetching surveys: {error.message}</div>;

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
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Survey List</h1>
        <div className="flex items-center space-x-2">
          <span>Sort by:</span>
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Posted Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Link to={"/creator/survey"}>
            <Button>Create Survey</Button>
          </Link>
        </div>
      </div>

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
            <TableHead>Impressions</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSurveys.length > 0 ? (
            currentSurveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.creatorName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.startDate}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.endDate}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.amount}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        survey.status === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {survey.status}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.impressions}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/creator/surveyinfo?surveyId=${survey.id}`}>
                    {survey.remaining}
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No surveys found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center items-center mt-4">
        <div className="flex space-x-1 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
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
    </div>
  );
};

export default CreatorHome;
