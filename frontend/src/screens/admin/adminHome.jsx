import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "react-toastify";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CanvasJSReact from "@canvasjs/react-charts";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  CalendarIcon,
} from "lucide-react";
import { getTransactions, getData } from "@/slices/adminSlice";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";

const { CanvasJSChart } = CanvasJSReact;

const AdminHome = () => {
  const dispatch = useDispatch();
  const {
    data,
    transactions = [],
    isLoading,
  } = useSelector((state) => state.admin);

  console.log(data);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getData());
  }, [dispatch]);

  const handleFilterApply = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  }, [transactions, startDate, endDate]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      surveys: data.surveys?.filter((survey) => {
        const surveyDate = new Date(survey.created_at);
        return (
          (!startDate || surveyDate >= startDate) &&
          (!endDate || surveyDate <= endDate)
        );
      }),
      surveyResponses: data.surveyResponses?.filter((response) => {
        const responseDate = new Date(response.completedAt);
        return (
          (!startDate || responseDate >= startDate) &&
          (!endDate || responseDate <= endDate)
        );
      }),
    };
  }, [data, startDate, endDate]);

  const {
    monthlyProfits,
    totalAmount,
    totalProfit,
    categoriesPieChartData,
    monthlysurveysPieChartData,
    monthlyResponsesPieChartData,
  } = useMemo(() => {
    if (!filteredData || !filteredTransactions) {
      return {
        monthlyProfits: [],
        totalAmount: 0,
        totalProfit: 0,
        categoriesPieChartData: [],
        monthlysurveysPieChartData: [],
        monthlyResponsesPieChartData: [],
      };
    }

    const profitByMonth = {};
    let totalCreditAmount = 0;

    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "credit") {
        const date = new Date(transaction.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

        const profit = transaction.amount * 0.15;

        profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + profit;
        totalCreditAmount += transaction.amount;
      }
    });

    const monthlyProfitsData = Object.entries(profitByMonth)
      .map(([month, value]) => ({
        name: month,
        value: parseFloat(value.toFixed(2)),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });

    const totalProfit = Object.values(profitByMonth).reduce(
      (sum, profit) => sum + profit,
      0
    );

    const categoriesCount = {};
    filteredData.surveys?.forEach((survey) => {
      survey.categories.forEach((category) => {
        if (category && category.name) {
          categoriesCount[category.name] =
            (categoriesCount[category.name] || 0) + 1;
        }
      });
    });

    const categoriesPieChartData = Object.entries(categoriesCount)
      .map(([name, count]) => ({ name, y: count }))
      .sort((a, b) => b.y - a.y);

    const monthlysurveys = {};
    filteredData.surveys?.forEach((survey) => {
      const month = new Date(survey.created_at).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlysurveys[month] = (monthlysurveys[month] || 0) + 1;
    });

    const monthlysurveysPieChartData = Object.entries(monthlysurveys)
      .map(([name, count]) => ({ name, y: count }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });

    const monthlyResponses = {};
    filteredData.surveyResponses?.forEach((response) => {
      const month = new Date(response.completedAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyResponses[month] = (monthlyResponses[month] || 0) + 1;
    });

    const monthlyResponsesPieChartData = Object.entries(monthlyResponses)
      .map(([name, count]) => ({ name, y: count }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });

    return {
      monthlyProfits: monthlyProfitsData,
      totalAmount: totalCreditAmount,
      totalProfit: totalProfit,
      categoriesPieChartData,
      monthlysurveysPieChartData,
      monthlyResponsesPieChartData,
    };
  }, [filteredData, filteredTransactions]);

  const monthlyProfitsOptions =
    monthlyProfits.length > 0
      ? {
          animationEnabled: true,
          title: { text: "Monthly Profits" },
          axisX: { title: "Month" },
          axisY: { title: "Profit (SOL)", includeZero: false },
          data: [
            {
              type: "line",
              dataPoints: monthlyProfits.map((item, index) => ({
                x: index + 1,
                y: item.value,
                label: item.name,
              })),
            },
          ],
        }
      : null;

  const categoriesPieChartOptions = {
    animationEnabled: true,
    title: { text: "Surveys by Category" },
    data: [
      {
        type: "pie",
        showInLegend: true,
        legendText: "{name}",
        dataPoints: categoriesPieChartData,
      },
    ],
  };

  const monthlySurveysBarChartOptions = {
    animationEnabled: true,
    title: { text: "Surveys per Month" },
    axisX: {
      title: "Month",
      interval: 1,
      labelAngle: -45,
    },
    axisY: {
      title: "Number of Surveys",
      includeZero: true,
    },
    data: [
      {
        type: "column",
        dataPoints: monthlysurveysPieChartData.map((item, index) => ({
          label: item.name,
          y: item.y,
        })),
      },
    ],
  };

  const monthlyResponsesBarChartOptions = {
    animationEnabled: true,
    title: { text: "Survey Responses per Month" },
    axisX: {
      title: "Month",
      interval: 1,
      labelAngle: -45,
    },
    axisY: {
      title: "Number of Responses",
      includeZero: true,
    },
    data: [
      {
        type: "column",
        dataPoints: monthlyResponsesPieChartData.map((item, index) => ({
          label: item.name,
          y: item.y,
        })),
      },
    ],
  };

  const DateRangePicker = ({ onFilterApply }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleStartDateSelect = (selectedDate) => {
      if (isAfter(selectedDate, new Date())) {
        toast.error("Start date cannot be in the future");
        return;
      }

      if (endDate && isAfter(selectedDate, endDate)) {
        toast.error("Start date must be before end date");
        return;
      }

      setStartDate(selectedDate);
    };

    const handleEndDateSelect = (selectedDate) => {
      if (isAfter(selectedDate, new Date())) {
        toast.error("End date cannot be in the future");
        return;
      }

      if (startDate && isBefore(selectedDate, startDate)) {
        toast.error("End date must be after start date");
        return;
      }

      setEndDate(selectedDate);
    };

    const clearDates = () => {
      setStartDate(null);
      setEndDate(null);
      onFilterApply(null, null);
      toast.info("Date filters cleared");
    };

    const applyFilter = () => {
      if (!startDate || !endDate) {
        toast.error("Please select a start and end date");
        return;
      }

      onFilterApply(startDate, endDate);
      toast.success("Filters applied successfully");
    };

    return (
      <div className="flex space-x-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateSelect}
              initialFocus
              disabled={(date) => isAfter(date, new Date())}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateSelect}
              initialFocus
              disabled={(date) => {
                return (
                  isAfter(date, new Date()) ||
                  (startDate && isBefore(date, startOfDay(startDate)))
                );
              }}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" onClick={clearDates}>
          Clear Filters
        </Button>

        <Button
          variant="default"
          onClick={applyFilter}
          disabled={!startDate && !endDate}
        >
          Apply Filter
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {isLoading && (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      )}
      {!isLoading &&
        (!filteredData ||
          (filteredData.surveys && filteredData.surveys.length === 0)) && (
          <p>No data available for the selected date range.</p>
        )}

      <div className="grid grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Users
            </h2>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredData?.users?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Surveys
            </h2>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredData?.surveys?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Amount
            </h2>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SOL {totalAmount.toFixed(3)}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Profit
            </h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">SOL {totalProfit.toFixed(3)}</p>
          </CardContent>
        </Card>
      </div>
      <DateRangePicker onFilterApply={handleFilterApply} />

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        {monthlyProfits.length > 0 && (
          <Card className="col-span-12">
            <CardHeader>
              <h2 className="text-lg font-semibold">Monthly Profits</h2>
            </CardHeader>
            <CardContent className="h-110">
              <CanvasJSChart options={monthlyProfitsOptions} />
            </CardContent>
          </Card>
        )}

        {categoriesPieChartData.length > 0 && (
          <Card className="col-span-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Surveys by Category</h2>
            </CardHeader>
            <CardContent className="h-110">
              <CanvasJSChart options={categoriesPieChartOptions} />
            </CardContent>
          </Card>
        )}

        {monthlysurveysPieChartData.length > 0 && (
          <Card className="col-span-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Surveys per Month</h2>
            </CardHeader>
            <CardContent className="h-110">
              <CanvasJSChart options={monthlySurveysBarChartOptions} />
            </CardContent>
          </Card>
        )}

        {monthlyResponsesPieChartData.length > 0 && (
          <Card className="col-span-12">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Survey Responses per Month
              </h2>
            </CardHeader>
            <CardContent className="h-110">
              <CanvasJSChart options={monthlyResponsesBarChartOptions} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
