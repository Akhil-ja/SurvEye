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

// Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const AdminHome = () => {
  const dispatch = useDispatch();
  const {
    data,
    transactions = [],
    isLoading,
  } = useSelector((state) => state.admin);

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
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);

    const monthlysurveys = {};
    filteredData.surveys?.forEach((survey) => {
      const month = new Date(survey.created_at).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlysurveys[month] = (monthlysurveys[month] || 0) + 1;
    });

    const monthlysurveysPieChartData = Object.entries(monthlysurveys)
      .map(([name, count]) => ({ name, value: count }))
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
      .map(([name, count]) => ({ name, value: count }))
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
              Total Profit (SOL)
            </h2>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Amount (SOL)
            </h2>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">Monthly Profits</h2>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={monthlyProfits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">Surveys by Category</h2>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={400}>
              <Pie
                data={categoriesPieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">Monthly Surveys</h2>
          </CardHeader>
          <CardContent>
            <BarChart
              width={400}
              height={300}
              data={monthlysurveysPieChartData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">Monthly Responses</h2>
          </CardHeader>
          <CardContent>
            <BarChart
              width={400}
              height={300}
              data={monthlyResponsesPieChartData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
