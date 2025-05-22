import React, { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// In production, this should come from localStorage or Context
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0Nzg5MDA1OCwiZXhwIjoxNzQ4NDk0ODU4fQ.kVgISk1X4IpQzOD0zNw9kVPickyjLw6oTf0KIupIJxc";

// Decode token payload
const getUserIdFromToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const { userId } = JSON.parse(jsonPayload);
    return userId;
  } catch (err) {
    console.error("Error decoding token", err);
    return null;
  }
};

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getUserIdFromToken(token);
    if (!userId) {
      alert("Invalid or missing user ID in token.");
      return;
    }

    const taskData = {
      title,
      description,
      dueDate,
      category,
      status,
      priority,
      userId, // ✅ Include valid userId
    };

    try {
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
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="task-form-container">
      <h2 className="task-form-title">Create Task</h2>
      {/* ... rest of the form remains unchanged ... */}
      <Form.Group className="task-form-group">
        <Form.Label className="task-form-label">Title</Form.Label>
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
          Save Task
        </Button>
      </div>
    </Form>
  );
};

export default TaskForm;
