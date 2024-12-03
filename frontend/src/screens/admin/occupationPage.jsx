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
  getOccupations,
  toggleOccupationStatus,
  createOccupation,
  updateOccupation,
} from "@/slices/adminSlice";
import { toast } from "react-toastify";

const OccupationPage = () => {
  const dispatch = useDispatch();
  const { occupations, isLoading, error } = useSelector((state) => state.admin);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    dispatch(getOccupations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddEdit = (occupation = null) => {
    if (occupation) {
      setEditingOccupation(occupation);
      setFormData({
        name: occupation.name,
        description: occupation.description,
        status: occupation.status,
      });
    } else {
      setEditingOccupation(null);
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

    const isDuplicate = occupations.some(
      (occupation) =>
        occupation.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!editingOccupation || occupation._id !== editingOccupation._id)
    );

    if (isDuplicate) {
      toast.error("Occupation with this name already exists!");
      return;
    }

    const updatedFormData = {
      ...formData,
      name: trimmedName,
      description: trimmedDescription,
    };

    if (editingOccupation) {
      dispatch(
        updateOccupation({
          occupationId: editingOccupation._id,
          data: updatedFormData,
        })
      ).then((result) => {
        if (!result.error) {
          setIsDialogOpen(false);
          toast.success("Occupation updated successfully!");
          dispatch(getOccupations());
        }
      });
    } else {
      dispatch(createOccupation(updatedFormData)).then((result) => {
        if (!result.error) {
          setIsDialogOpen(false);
          toast.success("Occupation created successfully!");
          dispatch(getOccupations());
        }
      });
    }
  };

  const handleToggleStatus = (occupationId) => {
    dispatch(toggleOccupationStatus(occupationId)).then((result) => {
      if (!result.error) {
        toast.success("Occupation status updated successfully!");
        dispatch(getOccupations());
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading occupations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Occupation Management</h1>
        <Button
          onClick={() => handleAddEdit()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Occupation
        </Button>
      </div>

      {!occupations || occupations.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No occupations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occupations.map((occupation) => (
            <Card key={occupation._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{occupation.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {occupation.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddEdit(occupation)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={occupation.status}
                    onCheckedChange={() => handleToggleStatus(occupation._id)}
                  />
                  <span className="text-sm text-gray-500">
                    {occupation.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    occupation.status
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {occupation.status ? "Active" : "Inactive"}
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
              {editingOccupation ? "Edit Occupation" : "Add New Occupation"}
            </DialogTitle>
            <DialogDescription>
              {editingOccupation
                ? "Edit the occupation details below"
                : "Fill in the details for the new occupation"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Occupation Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter occupation name"
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
                  placeholder="Enter occupation description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingOccupation ? "Update Occupation" : "Add Occupation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OccupationPage;
