require("dotenv").config();


const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      message: "Task Manager API is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// Get one task
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error);

    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title)
       VALUES ($1)
       RETURNING *`,
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         completed = COALESCE($2, completed),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title?.trim(), completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});