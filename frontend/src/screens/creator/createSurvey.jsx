import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { getOccupations, getCategories } from "@/slices/adminSlice";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { clearMessage, createSurvey } from "../../slices/creatorSlice";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const CreateSurvey = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = React.useState([]);
  const [occupations, setOccupations] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState({
    categories: true,
    occupations: true,
  });

  const [formData, setFormData] = React.useState({
    surveyName: "",
    description: "",
    categories: [],
    occupations: [],
    creatorName: "",
    sampleSize: "",
  });

  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [isAllAges, setIsAllAges] = React.useState(false);
  const [isAllOccupations, setIsAllOccupations] = React.useState(false);
  const [minAge, setMinAge] = React.useState("");
  const [maxAge, setMaxAge] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResult, occupationsResult] = await Promise.all([
          dispatch(getCategories(true)).unwrap(),
          dispatch(getOccupations(true)).unwrap(),
        ]);

        setCategories(categoriesResult.categories);
        setOccupations(occupationsResult.occupations);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch required data");
      } finally {
        setIsLoading({
          categories: false,
          occupations: false,
        });
      }
    };

    fetchData();
    dispatch(clearMessage());
  }, [dispatch]);

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const occupationOptions = occupations.map((occ) => ({
    value: occ._id,
    label: occ.name,
  }));

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value.trimStart(),
    });
  };

  const handleCategoryChange = (selectedOptions) => {
    setFormData({
      ...formData,
      categories: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    });
  };

  const handleOccupationChange = (selectedOptions) => {
    setFormData({
      ...formData,
      occupations: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.surveyName.trim() || !formData.creatorName.trim()) {
      toast.error("Survey Name and Creator's Name are required.");
      return;
    }

    if (!isAllAges) {
      if (!minAge.trim() || !maxAge.trim()) {
        toast.error("Please enter both minimum and maximum age.");
        return;
      }
      if (minAge <= 0 || maxAge <= 0) {
        toast.error("Age cannot be zero or negative.");
        return;
      }
      if (parseInt(minAge) < 18) {
        toast.error("Minimum age must be at least 18.");
        return;
      }
      if (parseInt(maxAge) > 100) {
        toast.error("Maximum age must be at most 100.");
        return;
      }
      if (parseInt(minAge) > parseInt(maxAge)) {
        toast.error("Minimum age cannot be greater than maximum age.");
        return;
      }
    }

    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    if (!startDate || !endDate) {
      toast.error("Both start date and end date must be selected.");
      return;
    }

    if (format(startDate, "yyyy-MM-dd") < formattedToday) {
      toast.error("Start date cannot be in the past.");
      return;
    }

    if (format(endDate, "yyyy-MM-dd") < formattedToday) {
      toast.error("End date cannot be in the past.");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be later than the end date.");
      return;
    }

    if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
      toast.error("Start date and end date cannot be the same.");
      return;
    }

    if (formData.categories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }

    if (!isAllOccupations && formData.occupations.length === 0) {
      toast.error(
        "Please select at least one occupation or check 'All Occupations'."
      );
      return;
    }

    if (!formData.sampleSize.trim()) {
      toast.error("Sample size must be filled.");
      return;
    }

    if (parseInt(formData.sampleSize) <= 0) {
      toast.error("Sample size must be greater than zero.");
      return;
    }

    const surveyData = {
      ...formData,
      duration: {
        startDate,
        endDate,
      },
      targetAgeRange: {
        isAllAges,
        minAge: isAllAges ? null : minAge,
        maxAge: isAllAges ? null : maxAge,
      },
      occupations: formData.occupations,
      isAllOccupations: isAllOccupations,
    };

    try {
      const result = await dispatch(createSurvey(surveyData)).unwrap();
      navigate(`/creator/surveycreate?surveyId=${result.survey._id}`);
    } catch (error) {
      console.error("Failed to create survey:", error);
      toast.error("An error occurred while creating the survey.");
    }
  };

  if (isLoading.categories || isLoading.occupations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="surveyName">Survey Name</Label>
                <Input
                  id="surveyName"
                  placeholder="Enter survey name"
                  value={formData.surveyName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter survey description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value.trimStart(),
                    })
                  }
                  className="h-24"
                />
              </div>

              <div>
                <Label htmlFor="categories">Categories</Label>
                <Select
                  id="categories"
                  isMulti
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                  className="mt-1"
                  placeholder="Select categories..."
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="allOccupations"
                    checked={isAllOccupations}
                    onCheckedChange={(checked) => setIsAllOccupations(checked)}
                  />
                  <Label htmlFor="allOccupations">All Occupations</Label>
                </div>
                {!isAllOccupations && (
                  <Select
                    id="occupations"
                    isMulti
                    options={occupationOptions}
                    onChange={handleOccupationChange}
                    placeholder="Select occupations..."
                  />
                )}
              </div>

              <div>
                <Label htmlFor="creatorName">Creator&apos;s Name</Label>
                <Input
                  id="creatorName"
                  placeholder="Enter creator's name"
                  value={formData.creatorName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="sampleSize">Sample Size</Label>
                <Input
                  id="sampleSize"
                  type="number"
                  placeholder="Enter sample size"
                  value={formData.sampleSize}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allAges"
                  checked={isAllAges}
                  onCheckedChange={(checked) => setIsAllAges(checked)}
                />
                <Label htmlFor="allAges">All Ages</Label>
              </div>

              {!isAllAges && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Age</Label>
                    <Input
                      type="number"
                      placeholder="Min age"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value.trimStart())}
                      className="mt-1"
                      id="minAge"
                    />
                  </div>
                  <div>
                    <Label>Max Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      placeholder="Max age"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value.trimStart())}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, "PPP")
                          : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Create Survey
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSurvey;
