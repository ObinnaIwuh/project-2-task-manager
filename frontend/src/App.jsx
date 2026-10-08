import { useEffect, useState } from "react";
import "./App.css";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./services/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Add task
  const addTask = async (event) => {
    event.preventDefault();

    if (!newTask.trim()) {
      return;
    }

    try {
      const task = await createTask(newTask);

      setTasks((currentTasks) => [task, ...currentTasks]);
      setNewTask("");
      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to create task.");
    }
  };

  // Toggle task
  const toggleTask = async (task) => {
    try {
      const updatedTask = await updateTask(task.id, {
        completed: !task.completed,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask
        )
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to update task.");
    }
  };

  // Delete task
  const removeTask = async (id) => {
    try {
      await deleteTask(id);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to delete task.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Task Manager — DevOps Project 2</h1>
          <p>Manage your tasks efficiently.</p>
        </div>
      </header>

      <main className="container">
        <section className="task-form-section">
          <h2>Add a New Task</h2>

          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
            />

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <span>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p className="empty-message">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-message">
              No tasks yet. Add your first task above.
            </p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />

                    <span>{task.title}</span>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => removeTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;