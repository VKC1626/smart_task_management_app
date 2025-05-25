import React, { useState } from "react";
import { Table, Button, Badge, Form, Spinner } from "react-bootstrap";

const priorityColorMap = {
  low: "secondary",
  medium: "primary",
  high: "danger",
};

const TaskList = ({
  tasks = [],
  onUpdate = () => {},
  handleDelete = (id) => {},
  handleEdit = (task) => {},
}) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    dueDate: "",
    priority: "Medium",
    status: "pending",
  });
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Handle sorting logic
  const sortedTasks = React.useMemo(() => {
    if (!sortConfig.key) return tasks;

    const sorted = [...tasks].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // For date comparison, convert to Date
      if (sortConfig.key === "dueDate" || sortConfig.key === "due_date") {
        aValue = aValue ? new Date(aValue) : new Date(8640000000000000);
        bValue = bValue ? new Date(bValue) : new Date(8640000000000000);
      } else {
        // For string comparison, lowercase for consistency
        aValue = aValue ? aValue.toString().toLowerCase() : "";
        bValue = bValue ? bValue.toString().toLowerCase() : "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tasks, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setEditFormData({
      title: task.title || "",
      category: task.category || "",
      dueDate: task.due_date?.slice(0, 10) || task.dueDate?.slice(0, 10) || "",
      priority: task.priority || "Medium",
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

  const handleSaveClick = async () => {
    if (!editFormData.title.trim()) {
      alert("Title cannot be empty");
      return;
    }

    const updatedData = { ...editFormData };

    // Normalize priority for backend
    updatedData.priority = updatedData.priority
      ? updatedData.priority.toLowerCase()
      : "medium";

    if (updatedData.dueDate) {
      const isoDate = new Date(updatedData.dueDate);
      if (isNaN(isoDate.getTime())) {
        alert("Invalid due date");
        return;
      }
      updatedData.dueDate = isoDate.toISOString();
    }

    setLoadingTaskId(editTaskId);
    try {
      await onUpdate(editTaskId, updatedData);
    } finally {
      setLoadingTaskId(null);
      setEditTaskId(null);
    }
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setLoadingTaskId(task.id);
    try {
      await onUpdate(task.id, { status: newStatus });
    } finally {
      setLoadingTaskId(null);
    }
  };

  if (!tasks || tasks.length === 0) {
    return <p className="text-muted text-center mt-4">No tasks found.</p>;
  }
  return (
    <Table striped bordered hover responsive className="mt-3 task-table">
      <thead>
        <tr>
          <th
            style={{ cursor: "pointer" }}
            onClick={() => requestSort("title")}
            aria-label="Sort by Title">
            Title{" "}
            {sortConfig.key === "title"
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
          </th>
          <th
            style={{ cursor: "pointer" }}
            onClick={() => requestSort("category")}
            aria-label="Sort by Category">
            Category{" "}
            {sortConfig.key === "category"
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
          </th>
          <th
            style={{ cursor: "pointer" }}
            onClick={() => requestSort("status")}
            aria-label="Sort by Status">
            Status{" "}
            {sortConfig.key === "status"
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
          </th>
          <th
            style={{ cursor: "pointer" }}
            onClick={() => requestSort("due_date")}
            aria-label="Sort by Due Date">
            Due Date{" "}
            {sortConfig.key === "due_date"
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
          </th>
          <th
            style={{ cursor: "pointer" }}
            onClick={() => requestSort("priority")}
            aria-label="Sort by Priority">
            Priority{" "}
            {sortConfig.key === "priority"
              ? sortConfig.direction === "asc"
                ? "▲"
                : "▼"
              : ""}
          </th>
          <th style={{ width: "160px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedTasks.map((task) => {
          const isOverdue =
            task.due_date &&
            new Date(task.due_date) < new Date() &&
            task.status !== "completed";
          return (
            <tr
              key={task.id}
              className={isOverdue ? "table-danger" : ""}
              aria-label={`Task: ${task.title}`}>
              {editTaskId === task.id ? (
                <>
                  <td>
                    <Form.Control
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleInputChange}
                      placeholder="Task Title"
                      aria-label="Edit Task Title"
                      autoFocus
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      name="category"
                      value={editFormData.category}
                      onChange={handleInputChange}
                      placeholder="Category"
                      aria-label="Edit Task Category"
                    />
                  </td>
                  <td>
                    <Form.Select
                      name="status"
                      value={editFormData.status}
                      onChange={handleInputChange}
                      aria-label="Edit Task Status">
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      type="date"
                      name="dueDate"
                      value={editFormData.dueDate}
                      onChange={handleInputChange}
                      aria-label="Edit Task Due Date"
                    />
                  </td>
                  <td>
                    <Form.Select
                      name="priority"
                      value={editFormData.priority}
                      onChange={handleInputChange}
                      aria-label="Edit Task Priority">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={handleSaveClick}
                      disabled={loadingTaskId === task.id}
                      aria-label="Save Task">
                      {loadingTaskId === task.id ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-1"
                          />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelClick}
                      aria-label="Cancel Editing Task">
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
                      title="Click to toggle status"
                      aria-label={`Status: ${task.status}. Click to toggle.`}>
                      {loadingTaskId === task.id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        task.status
                      )}
                    </Badge>
                  </td>
                  <td>
                    {task.due_date?.slice(0, 10) ||
                      task.dueDate?.slice(0, 10) ||
                      "-"}
                  </td>

                  <td>
                    <Badge
                      bg={
                        priorityColorMap[task.priority.toLowerCase()] ||
                        "primary"
                      }>
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(task)}
                      aria-label={`Edit task ${task.title}`}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete task ${task.title}`}>
                      Delete
                    </Button>
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TaskList;
