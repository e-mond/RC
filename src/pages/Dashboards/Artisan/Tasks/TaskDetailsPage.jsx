// src/pages/Dashboards/Artisan/Tasks/TaskDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTask, updateTaskStatus, uploadTaskPhotos } from "@/services/artisanService";
import { ArrowLeft, Clock, CheckCircle, XCircle, MapPin, DollarSign, Camera, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/landlord/ImageUploader";

/**
 * TaskDetailsPage - Full task details with status updates
 */
export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getTask(id);
        if (mounted) {
          setTask(res.task || res.data || res);
          setPhotos(res.task?.photos || res.data?.photos || []);
        }
      } catch (err) {
        console.error("getTask:", err);
        if (mounted) setError(err.message || "Failed to load task");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to mark this task as ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const result = await updateTaskStatus(id, newStatus);
      setTask((prev) => ({ ...prev, ...result.task, status: newStatus }));
    } catch (err) {
      console.error("updateTaskStatus:", err);
      alert(err.message || "Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (photos.length === 0) return;

    setUploadingPhotos(true);
    try {
      const filePhotos = photos.filter((p) => p instanceof File);
      if (filePhotos.length > 0) {
        await uploadTaskPhotos(id, filePhotos);
        alert("Photos uploaded successfully");
      }
    } catch (err) {
      console.error("uploadTaskPhotos:", err);
      alert(err.message || "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Task not found"}
        </div>
        <Button onClick={() => navigate("/artisan/tasks")} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
    in_progress: { color: "bg-blue-100 text-blue-700", icon: AlertCircle, label: "In Progress" },
    completed: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
  };

  const status = task.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/artisan/tasks")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}>
          <StatusIcon size={18} />
          {config.label}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-[#0f1724] mb-2">{task.title}</h1>
        <p className="text-gray-600 flex items-center gap-2 mb-6">
          <MapPin size={16} />
          {task.address || "Address not specified"}
        </p>

        {/* Task Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <p className="font-semibold capitalize">{task.priority || "medium"}</p>
          </div>
          {task.estimatedHours && (
            <div>
              <p className="text-sm text-gray-600">Estimated Time</p>
              <p className="font-semibold">{task.estimatedHours} hours</p>
            </div>
          )}
          {task.dueDate && (
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-semibold">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          )}
          {task.payment && (
            <div>
              <p className="text-sm text-gray-600">Payment</p>
              <p className="font-semibold text-[#0b6e4f]">₵{task.payment.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{task.description}</p>
          </div>
        )}

        {/* Property Info */}
        {task.propertyTitle && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Property</h3>
            <p className="text-gray-700">{task.propertyTitle}</p>
            {task.propertyId && (
              <p className="text-sm text-gray-500 mt-1">ID: {task.propertyId}</p>
            )}
          </div>
        )}

        {/* Status Actions */}
        <div className="mb-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            {status !== "in_progress" && (
              <Button
                onClick={() => handleStatusUpdate("in_progress")}
                disabled={updating}
                className="flex items-center gap-2"
              >
                <AlertCircle size={18} />
                Start Task
              </Button>
            )}
            {status !== "completed" && (
              <Button
                onClick={() => handleStatusUpdate("completed")}
                disabled={updating}
                variant="primary"
                className="flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="mb-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera size={20} />
            Completion Photos
          </h3>
          <ImageUploader
            value={photos}
            onChange={setPhotos}
            multiple
            maxFiles={10}
          />
          {photos.length > 0 && (
            <Button
              onClick={handlePhotoUpload}
              disabled={uploadingPhotos}
              className="mt-4 flex items-center gap-2"
            >
              {uploadingPhotos ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera size={18} />
                  Upload Photos
                </>
              )}
            </Button>
          )}
        </div>

        {/* Task Timeline */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="space-y-3">
            {task.assignedDate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-600">
                  Assigned: {new Date(task.assignedDate).toLocaleString()}
                </span>
              </div>
            )}
            {task.startedDate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-600">
                  Started: {new Date(task.startedDate).toLocaleString()}
                </span>
              </div>
            )}
            {task.completedDate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">
                  Completed: {new Date(task.completedDate).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

