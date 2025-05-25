import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import TaskList from "./TaskList";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setdata] = useState([
    {
      name: "",
      id: "",
      priority: "",
      discription: "",
    },
  ]);

  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null); // ✅ track task to edit
  const [showForm, setShowForm] = useState(false); // for toggling form

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedLast7Days: [],
    categories: [],
  });

  const token = localStorage.getItem("token");

  const handleEditClick = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    debugger;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      setError("Failed to delete task. Please try again.");
    }
  };
  const onUpdate = async (taskId, updatedData) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...updatedData,
        due_date: updatedData.dueDate
          ? new Date(updatedData.dueDate).toISOString()
          : null,
        priority: updatedData.priority
          ? updatedData.priority.toLowerCase()
          : "medium",
      };
      delete payload.dueDate;

      Object.keys(payload).forEach(
        (key) =>
          (payload[key] === null || payload[key] === undefined) &&
          delete payload[key]
      );

      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to update task");
      }

      const updatedTask = await response.json();

      const normalizePriority = (priority) => {
        if (!priority || typeof priority !== "string") return "Medium";
        const lower = priority.toLowerCase();
        return ["low", "medium", "high"].includes(lower)
          ? lower.charAt(0).toUpperCase() + lower.slice(1)
          : "Medium";
      };

      const normalizedTask = {
        ...updatedTask,
        dueDate: updatedTask.dueDate || updatedData.dueDate || null,
        priority: normalizePriority(updatedTask.priority),
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          String(task.id) === String(normalizedTask.id) ? normalizedTask : task
        )
      );

      setShowForm(false);
      setEditTask(null);
      return normalizedTask;
    } catch (error) {
      alert(`Error updating task: ${error.message}`);
      return null;
    }
  };

  const handleCreateTask = () => {
    navigate("/taskform");
  };

  // fetchTasks wrapped with useCallback to stabilize the function reference
  const fetchTasks = useCallback(async () => {
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedTasks = response.data.tasks || [];
      setTasks(fetchedTasks);
      setStats(calculateStats(fetchedTasks));
      setError("");
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError("Failed to fetch tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const calculateStats = (taskList) => {
    const todayDateStr = new Date().toISOString().split("T")[0];
    const todayTasks = taskList.filter((t) => {
      if (!t.dueDate) return false;
      const taskDueDate = new Date(t.dueDate).toISOString().split("T")[0];
      return taskDueDate === todayDateStr && t.status !== "completed";
    }).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 3), // Replace with real data if needed
      };
    }).reverse();

    const categoryMap = {};
    for (const task of taskList) {
      const cat = task.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    return {
      todayTasks,
      completedLast7Days: last7Days,
      categories: Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
      })),
    };
  };

  const exportToPDF = (tasks) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Task Management Report", 105, 15, { align: "center" });

    doc.setFont("helvetica", "medium");
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 25, {
      align: "center",
    });

    const headers = [
      ["Title", "Description", "Category", "Due Date", "Status", "Priority"],
    ];
    const body = tasks.map((task) => [
      task.title,
      task.description,
      task.category,
      task.dueDate,
      task.status,
      task.priority,
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, 200, 285, { align: "right" });
    }

    doc.save(`tasks_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      tasks.map((task) => ({
        Title: task.title,
        Description: task.description,
        Category: task.category,
        "Due Date": task.dueDate,
        Status: task.status,
        Priority: task.priority,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Task Dashboard</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Tasks Due Today</Card.Title>
              <h3 className="text-primary">{stats.todayTasks}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Completion Rate (Last 7 Days)</Card.Title>
              <div style={{ height: "200px" }}>
                <Bar
                  data={{
                    labels: stats.completedLast7Days.map((item) => item.date),
                    datasets: [
                      {
                        label: "Completed Tasks",
                        data: stats.completedLast7Days.map(
                          (item) => item.count
                        ),
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Task Categories</Card.Title>
              <div style={{ height: "200px" }}>
                <Pie
                  data={{
                    labels: stats.categories.map((item) => item.category),
                    datasets: [
                      {
                        data: stats.categories.map((item) => item.count),
                        backgroundColor: [
                          "#FF6384",
                          "#36A2EB",
                          "#FFCE56",
                          "#4BC0C0",
                          "#9966FF",
                        ],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Your Tasks</Card.Title>
                <button className="btn btn-primary" onClick={handleCreateTask}>
                  Create Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center my-4">
                  <p className="text-muted mb-3">
                    No tasks found for this user.
                  </p>
                  <button
                    className="btn btn-success"
                    onClick={handleCreateTask}>
                    Create Your First Task
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-end mb-3">
                    <CSVLink
                      data={tasks}
                      filename="tasks.csv"
                      className="btn btn-outline-secondary me-2">
                      Export CSV
                    </CSVLink>
                    <button
                      onClick={exportToExcel}
                      className="btn btn-outline-secondary me-2"
                      disabled={tasks.length === 0}>
                      Export Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(tasks)}
                      className="btn btn-outline-secondary"
                      disabled={tasks.length === 0}>
                      Export PDF
                    </button>
                  </div>
                  <TaskList
                    tasks={tasks}
                    handleDelete={handleDelete}
                    handleEdit={handleEditClick}
                    editTask={editTask}
                    showForm={showForm}
                    setShowForm={setShowForm}
                    onUpdate={onUpdate}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
