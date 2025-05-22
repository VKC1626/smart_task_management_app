import axios from "axios";
import React, { useState, useEffect } from "react";
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

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedLast7Days: [],
    categories: [],
  });

  const handleCreateTask = () => {
    navigate("/taskform");
  };

  useEffect(() => {
    const sampleTasks = [
      {
        id: 1,
        title: "Design login page",
        description: "Create UI for login screen using React",
        category: "UI/UX",
        action: "In Review",
        priority: "high",
        status: "in progress",
        dueDate: "2025-05-25",
      },
      {
        id: 2,
        title: "Setup backend authentication",
        description: "Implement JWT login and registration APIs",
        category: "Backend",
        action: "To Do",
        priority: "medium",
        status: "pending",
        dueDate: "2025-05-27",
      },
      {
        id: 3,
        title: "Integrate task CRUD",
        description: "Add create/edit/delete task functionality",
        category: "Feature",
        action: "In Progress",
        priority: "medium",
        status: "in progress",
        dueDate: "2025-05-26",
      },
      {
        id: 4,
        title: "Fix dashboard chart bug",
        description: "Resolve chart rendering issue on Safari",
        category: "Bugfix",
        action: "To Do",
        priority: "low",
        status: "pending",
        dueDate: "2025-05-28",
      },
      {
        id: 5,
        title: "Deploy to AWS",
        description: "Deploy backend and frontend using EC2 and S3",
        category: "DevOps",
        action: "Planned",
        priority: "high",
        status: "pending",
        dueDate: "2025-05-30",
      },
    ];
    setTasks(sampleTasks);
    calculateStats(sampleTasks);
    setLoading(false);
  }, []);

  const calculateStats = (taskList) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = taskList.filter(
      (t) => t.dueDate === today && t.status !== "completed"
    ).length;

    // Dummy 7-day stats
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 3), // Random completed count
      };
    }).reverse();

    // Category breakdown
    const categoryMap = {};
    for (const task of taskList) {
      const cat = task.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    setStats({
      todayTasks,
      completedLast7Days: last7Days,
      categories: Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
      })),
    });
  };

  const exportToPDF = (tasks) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Task Management Report", 105, 15, { align: "center" });

    doc.setFont("helvetica", "normal");
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
              <button
                className="btn btn-primary mb-3"
                onClick={handleCreateTask}>
                Create Task
              </button>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Your Tasks</Card.Title>
                <div>
                  <CSVLink
                    data={tasks}
                    filename="tasks.csv"
                    className="btn btn-outline-secondary me-2">
                    Export CSV
                  </CSVLink>
                  <button
                    onClick={exportToExcel}
                    className="btn btn-outline-secondary me-2">
                    Export Excel
                  </button>
                  <button
                    onClick={() => exportToPDF(tasks)}
                    className="btn btn-outline-secondary">
                    Export PDF
                  </button>
                </div>
              </div>

              <TaskList tasks={tasks} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
