import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/login";
import Layout from "./components/layout";
import Dashboard from "./components/dashboard";
import TaskList from "./components/TaskList";
import Register from "./components/register";
import TaskForm from "./components/taskform";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/taskList" element={<TaskList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/taskform" element={<TaskForm />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
