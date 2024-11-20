import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCategories,
  toggleCategoryStatus,
  createCategory,
  updateCategory,
} from "@/slices/adminSlice";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.admin);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    dispatch(getCategories(false));
  }, [dispatch]);

  const handleAddEdit = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        status: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName || !trimmedDescription) {
      toast.error("All fields are required and cannot be empty!");
      return;
    }

    const isDuplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!editingCategory || category._id !== editingCategory._id)
    );

    if (isDuplicate) {
      toast.error("Category with this name already exists!");
      return;
    }

    const updatedFormData = {
      ...formData,
      name: trimmedName,
      description: trimmedDescription,
    };

    if (editingCategory) {
      dispatch(
        updateCategory({
          categoryId: editingCategory._id,
          data: updatedFormData,
        })
      );
    } else {
      dispatch(createCategory(updatedFormData));
    }

    setIsDialogOpen(false);
  };

  const handleToggleStatus = (categoryId) => {
    dispatch(toggleCategoryStatus(categoryId));
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button
          onClick={() => handleAddEdit()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={category.status}
                    onCheckedChange={() => handleToggleStatus(category._id)}
                  />
                  <span className="text-sm text-gray-500">
                    {category.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    category.status
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {category.status ? "Active" : "Inactive"}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Edit the category details below"
                : "Fill in the details for the new category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter category description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
