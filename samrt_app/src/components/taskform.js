import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TaskForm = ({ initialData = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");

  const navigate = useNavigate();

  // Populate fields if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");

      // Accept dueDate or due_date
      const rawDueDate = initialData.dueDate || initialData.due_date;
      setDueDate(rawDueDate ? rawDueDate.split("T")[0] : "");

      setCategory(initialData.category || "");
      setStatus(initialData.status || "pending");
      setPriority(initialData.priority || "medium");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Missing token. Please login again.");
      return;
    }

    const taskData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
      category,
      status,
      priority,
    };

    try {
      if (initialData && initialData.id) {
        // Editing existing task
        const response = await axios.put(
          `http://localhost:5000/api/tasks/${initialData.id}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Task updated:", response.data);
        alert("Task updated successfully!");
      } else {
        // Creating new task
        const response = await axios.post(
          "http://localhost:5000/api/tasks",
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Task created:", response.data);
        alert("Task created successfully!");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving task:", error.response?.data || error);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="task-form-container">
      <h2 className="task-form-title">
        {initialData ? "Edit Task" : "Create Task"}
      </h2>

      <Form.Group className="task-form-group">
        <Form.Label className="m-label">Title</Form.Label>
        <Form.Control
          type="text"
          className="task-form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          required
        />
      </Form.Group>

      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          className="task-form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </Form.Group>

      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Category</Form.Label>
        <Form.Control
          type="text"
          className="task-form-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category"
        />
      </Form.Group>

      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Due Date</Form.Label>
        <Form.Control
          type="date"
          className="task-form-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Status</Form.Label>
        <Form.Select
          className="task-form-input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Priority</Form.Label>
        <Form.Select
          className="task-form-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Form.Select>
      </Form.Group>

      <div className="task-form-button-container">
        <Button type="submit" className="task-form-button">
          {initialData ? "Update Task" : "Save Task"}
        </Button>
      </div>
    </Form>
  );
};

export default TaskForm;
