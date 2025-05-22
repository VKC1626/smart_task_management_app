import React, { useState } from "react";
import { Table, Button, Badge, Form } from "react-bootstrap";

const TaskList = ({ tasks = [], onUpdate = () => {}, onDelete = () => {} }) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    due_date: "",
    priority: "Normal",
    status: "pending",
  });

  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setEditFormData({
      title: task.title || "",
      category: task.category || "",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      priority: task.priority || "Normal",
      status: task.status || "pending",
    });
  };

  const handleCancelClick = () => {
    setEditTaskId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    if (!editFormData.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    onUpdate(editTaskId, { ...editFormData });
    setEditTaskId(null);
  };

  const handleStatusToggle = (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    onUpdate(task.id, { status: newStatus });
  };

  if (!tasks || tasks.length === 0) {
    return <p className="text-muted text-center mt-4">No tasks found.</p>;
  }

  return (
    <Table striped bordered hover responsive className="mt-3 task-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Due Date</th>
          <th>Priority</th>
          <th style={{ width: "160px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            {editTaskId === task.id ? (
              <>
                <td>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleInputChange}
                    placeholder="Task Title"
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    placeholder="Category"
                  />
                </td>
                <td>
                  <Form.Select
                    name="status"
                    value={editFormData.status}
                    onChange={handleInputChange}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    type="date"
                    name="due_date"
                    value={editFormData.due_date}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <Form.Select
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleInputChange}>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={handleSaveClick}>
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelClick}>
                    Cancel
                  </Button>
                </td>
              </>
            ) : (
              <>
                <td>{task.title}</td>
                <td>{task.category || "Uncategorized"}</td>
                <td>
                  <Badge
                    bg={task.status === "completed" ? "success" : "warning"}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleStatusToggle(task)}
                    title="Click to toggle status">
                    {task.status}
                  </Badge>
                </td>
                <td>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>{task.priority || "Normal"}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(task)}>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(task.id)}>
                    Delete
                  </Button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TaskList;
