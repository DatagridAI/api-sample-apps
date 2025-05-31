import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
// We'll use memory storage for simplicity, but for larger files, disk storage is recommended
const storage = multer.memoryStorage();
const upload = multer({ storage });

const DATAGRID_API_KEY = process.env.DATAGRID_API_KEY;
const DATAGRID_API_URL = "https://api.datagrid.com/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.stack);
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Something broke on the server!', details: err.message });
});

app.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  if (!DATAGRID_API_KEY) {
    return res.status(500).json({ error: "DATAGRID_API_KEY not configured" });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;

  try {
    // It's good practice to pass errors to next() in async route handlers
    // However, for this specific structure where we want to control the response directly,
    // we'll continue to use return res.status().json()
    // If we called next(error) here, it would be caught by the global error handler above.

    const formData = new FormData();
    formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    const headers = {
      ...formData.getHeaders(),
      "Authorization": `Bearer ${DATAGRID_API_KEY}`,
    };

    const response = await axios.post(`${DATAGRID_API_URL}/files`, formData, { headers });
    return res.status(response.status).json(response.data);

  } catch (error: any) {
    console.error('Error uploading to Datagrid API:', error.response ? error.response.data : error.message);
    if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json({
            error: "Error forwarding to Datagrid API",
            details: error.response.data
        });
    }
    return res.status(500).json({ error: 'Failed to upload file to Datagrid API' });
  }
});

app.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  if (!DATAGRID_API_KEY) {
    return res.status(500).json({ error: "DATAGRID_API_KEY not configured" });
  }

  const query = req.query.query as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is missing' });
  }

  try {
    const headers = {
      "Authorization": `Bearer ${DATAGRID_API_KEY}`,
    };

    const response = await axios.get(`${DATAGRID_API_URL}/search`, {
        headers,
        params: { query }
    });
    return res.status(response.status).json(response.data);

  } catch (error: any) {
    console.error('Error searching with Datagrid API:', error.response ? error.response.data : error.message);
     if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json({
            error: "Error forwarding to Datagrid API",
            details: error.response.data
        });
    }
    return res.status(500).json({ error: 'Failed to search with Datagrid API' });
  }
});

app.listen(port, () => {
  console.log(`TypeScript backend server is running on http://localhost:${port}`);
});
