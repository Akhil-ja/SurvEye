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

const CreatorHome = () => {
  const surveys = [
    {
      name: "Jeanette McCoy",
      startDate: "September 5, 2023",
      endDate: "September 9, 2023",
      amount: "$11.70",
      status: "ongoing",
      impressions: "500",
      remaining: "500",
    },
    {
      name: "Jeanette McCoy",
      startDate: "August 2, 2023",
      endDate: "August 2, 2023",
      amount: "$5.22",
      status: "ongoing",
      impressions: "1000",
      remaining: "1000",
    },
    {
      name: "Cody Fisher",
      startDate: "September 24, 2017",
      endDate: "September 24, 2017",
      amount: "$11.70",
      status: "expired",
      impressions: "500",
      remaining: "500",
    },
    // Add more survey data as needed
  ];

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
          <Button>Create Survey</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Survey Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Impressions</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>{survey.name}</TableCell>
              <TableCell>{survey.startDate}</TableCell>
              <TableCell>{survey.endDate}</TableCell>
              <TableCell>{survey.amount}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    survey.status === "ongoing"
                      ? "bg-green-200 text-green-800"
                      : survey.status === "expired"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {survey.status}
                </span>
              </TableCell>
              <TableCell>{survey.impressions}</TableCell>
              <TableCell>{survey.remaining}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center items-center mt-4">
        <div className="flex space-x-1 text-sm">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? "default" : "outline"}
              size="sm"
            >
              {page}
            </Button>
          ))}
          <span className="px-2 py-2">...</span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatorHome;
