# API Documentation

## Home API Endpoints

### Base URL

```
http://localhost:5000/api/home
```

### Endpoints

#### 1. Get All News (Paginated)

```
GET /news?page=1&limit=10
```

**Query Parameters:**

- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": 1,
        "title": "News Title",
        "content": "Full content...",
        "image_url": "http://localhost:5000/uploads/news/filename.jpg",
        "content_preview": "Truncated content...",
        "author_name": "Admin Name",
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 2. Get All Blogs (Paginated)

```
GET /blogs?page=1&limit=10
```

Same structure as news endpoint.

#### 3. Get News by ID

```
GET /news/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "News Title",
    "content": "Full content...",
    "image_url": "http://localhost:5000/uploads/news/filename.jpg",
    "author_name": "Admin Name",
    "created_at": "2025-01-01T12:00:00.000Z"
  }
}
```

#### 4. Get Blog by ID

```
GET /blogs/:id
```

Same structure as news by ID endpoint.

#### 5. Get Latest News

```
GET /latest-news?limit=5
```

**Query Parameters:**

- `limit` (optional): Number of items (default: 5, min: 1, max: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "News Title",
      "image_url": "http://localhost:5000/uploads/news/filename.jpg",
      "content_preview": "Truncated content...",
      "author_name": "Admin Name",
      "created_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

#### 6. Get Latest Blogs

```
GET /latest-blogs?limit=5
```

Same structure as latest news endpoint.

#### 7. Get Homepage Data

```
GET /homepage
```

**Response:**

```json
{
  "success": true,
  "data": {
    "latest_news": [
      {
        "id": 1,
        "title": "News Title",
        "image_url": "http://localhost:5000/uploads/news/filename.jpg",
        "content_preview": "Truncated content...",
        "author_name": "Admin Name",
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "latest_blogs": [
      {
        "id": 1,
        "title": "Blog Title",
        "image_url": "http://localhost:5000/uploads/blogs/filename.jpg",
        "content_preview": "Truncated content...",
        "author_name": "Admin Name",
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 50."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "News not found"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Features

### Image Handling

- Simple image upload with multer
- Direct image URLs for different content types
- Support for news, blogs, and avatar images

### Content Management

- Content preview generation with configurable length
- Pagination support for large datasets
- Author information with user joins
- Timestamp formatting

### Validation

- Input validation using Joi schemas
- Parameter sanitization and type conversion
- Error handling with descriptive messages

### Performance

- Efficient database queries with proper indexing
- Simple static file serving with multer
- Pagination to prevent large data transfers
