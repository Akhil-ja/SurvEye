import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOccupations, getCategories } from "@/slices/adminSlice";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { createSurvey } from "../../slices/creatorSlice";
import { useNavigate } from "react-router-dom";

const CreateSurvey = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = React.useState([]);
  const [occupations, setOccupations] = React.useState([]);

  const [formData, setFormData] = React.useState({
    surveyName: "",
    description: "",
    category: "",
    occupation: "",
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
    const fetchCategories = async () => {
      try {
        const result = await dispatch(getCategories(true)).unwrap();
        setCategories(result.categories);
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };

    const fetchOccupations = async () => {
      try {
        const result = await dispatch(getOccupations(true)).unwrap();
        setOccupations(result.occupations);
      } catch (error) {
        toast.error("Failed to fetch occupations");
      }
    };

    fetchCategories();
    fetchOccupations();
  }, [dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value.trimStart(),
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

    if (startDate && endDate) {
      if (startDate > endDate) {
        toast.error("Start date cannot be later than the end date.");
        return;
      }
      if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
        toast.error("Start date and end date cannot be the same.");
        return;
      }
    } else {
      toast.error("Both start date and end date must be selected.");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please select a category.");
      return;
    }

    if (!isAllOccupations && !formData.occupation) {
      toast.error("Please select an occupation or check 'All Occupations'.");
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
      occupation: isAllOccupations ? null : formData.occupation,
      duration: {
        startDate,
        endDate,
      },
      targetAgeRange: {
        isAllAges,
        minAge: isAllAges ? null : minAge,
        maxAge: isAllAges ? null : maxAge,
      },
    };

    try {
      const result = await dispatch(createSurvey(surveyData)).unwrap();
      console.log("Survey created successfully with ID:", result.survey._id);
      navigate(`/creator/surveycreate?surveyId=${result.survey._id}`);
    } catch (error) {
      console.error("Failed to create survey:", error);
      toast.error("An error occurred while creating the survey.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Survey Name */}
              <div>
                <Label htmlFor="surveyName">Survey Name</Label>
                <Input
                  id="surveyName"
                  placeholder="Enter survey name"
                  value={formData.surveyName}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
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

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Occupation */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="allOccupations"
                    checked={isAllOccupations}
                    onCheckedChange={(checked) => {
                      setIsAllOccupations(checked);
                      if (checked) {
                        setFormData((prev) => ({ ...prev, occupation: "" }));
                      }
                    }}
                  />
                  <Label htmlFor="allOccupations">All Occupations</Label>
                </div>

                {!isAllOccupations && (
                  <Select
                    value={formData.occupation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, occupation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupations.map((occupation) => (
                        <SelectItem key={occupation._id} value={occupation._id}>
                          {occupation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Creator's Name */}
              <div>
                <Label htmlFor="creatorName">Creator&apos;s Name</Label>
                <Input
                  id="creatorName"
                  placeholder="Enter creator's name"
                  value={formData.creatorName}
                  onChange={handleChange}
                />
              </div>

              {/* Sample Size */}
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

              {/* Age Range */}
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

              {/* Duration */}
              <div>
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  {/* Start Date */}
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

                  {/* End Date */}
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
