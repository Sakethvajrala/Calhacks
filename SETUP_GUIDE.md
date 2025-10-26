# Real(i)ty.AI Setup Guide

This guide will help you set up the complete Real(i)ty.AI property inspection system with database integration and Anthropic image analysis.

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database
- Anthropic API key

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database settings (already configured in settings.py)
# DB_NAME=cal_hacks
# DB_USER=postgres
# DB_PASSWORD=hello
# DB_HOST=localhost
# DB_PORT=5432
```

### 3. Database Setup

Make sure your PostgreSQL database is running and contains the `properties` and `issues` tables as defined in your models.

### 4. Run Django Server

```bash
cd backend
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/properties/` - Get all properties
- `GET /api/properties/{property_id}/` - Get detailed property information with issues
- `POST /api/analyze-image/` - Analyze property image using Anthropic API

### Example API Usage

#### Get All Properties
```bash
curl http://localhost:8000/api/properties/
```

#### Get Property Details
```bash
curl http://localhost:8000/api/properties/{property_id}/
```

#### Analyze Property Image
```bash
curl -X POST http://localhost:8000/api/analyze-image/ \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "your-property-id",
    "image_url": "https://example.com/property-image.jpg"
  }'
```

## Testing Anthropic Integration

To test the Anthropic image analysis integration:

```bash
cd backend
python test_anthropic.py
```

Make sure to set your `ANTHROPIC_API_KEY` environment variable first.

## Database Schema

### Properties Table
- `id` (UUID, Primary Key)
- `address` (CharField)
- `city` (CharField)
- `state` (CharField)
- `zip_code` (CharField)
- `grade` (CharField)
- `estimated_price` (DecimalField)
- `image_url` (TextField)
- `tour_date` (DateField)
- `total_issues` (IntegerField)
- `critical_issues` (IntegerField)
- `high_issues` (IntegerField)
- `moderate_issues` (IntegerField)
- `estimated_repair_cost` (DecimalField)
- `created_at` (DateTimeField)
- `updated_at` (DateTimeField)

### Issues Table
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key)
- `title` (CharField)
- `description` (TextField)
- `priority` (CharField) - 'Critical', 'High', 'Moderate', 'Low'
- `category` (CharField) - 'Structural', 'Exterior', 'Safety', etc.
- `concern_level` (IntegerField) - 1-10 scale
- `estimated_cost_low` (DecimalField)
- `estimated_cost_high` (DecimalField)
- `image_url` (TextField)
- `detected_date` (DateField)
- `created_at` (DateTimeField)

## Features

### 1. Property Dashboard
- Displays all properties from database
- Shows property grades, issue counts, and pricing
- Real-time data from PostgreSQL

### 2. Property Detail View
- Detailed property information
- Complete list of issues with images
- Filtering by issue priority
- PDF report generation

### 3. Anthropic Image Analysis
- Automatic property image analysis
- Issue detection and categorization
- Priority assessment and cost estimation
- Database integration for storing results

### 4. Real-time Updates
- Frontend automatically fetches latest data
- Issues are updated when new analysis is performed
- Property statistics are recalculated

## Demo Data

For the demo, focus on the property at "567 Sunset Boulevard" (San Jose, CA 95125) which should have:
- Grade: A-
- 3 Issues (0 Critical)
- List Price: $1,425,000
- Our Estimate: $1,422,000

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure:
1. `django-cors-headers` is installed
2. CORS middleware is properly configured in settings.py
3. Frontend URL is added to `CORS_ALLOWED_ORIGINS`

### Database Connection Issues
Verify your PostgreSQL connection settings in `settings.py`:
- Database name: `cal_hacks`
- User: `postgres`
- Password: `hello`
- Host: `localhost`
- Port: `5432`

### Anthropic API Issues
1. Verify your API key is set correctly
2. Check your Anthropic account has sufficient credits
3. Ensure the image URL is publicly accessible

## Next Steps

1. **Add Sample Data**: Insert sample properties and issues into your database
2. **Test Image Analysis**: Use the test script to verify Anthropic integration
3. **Customize Frontend**: Modify the UI to match your design requirements
4. **Add Authentication**: Implement user authentication if needed
5. **Deploy**: Set up production deployment with proper security settings

## Support

For issues or questions:
1. Check the Django logs for backend errors
2. Check browser console for frontend errors
3. Verify database connectivity
4. Test API endpoints individually
