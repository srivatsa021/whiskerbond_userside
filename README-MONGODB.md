# WhiskerBond MongoDB Integration - Enhanced

This application dynamically displays services from MongoDB collections, where each collection represents a service category and the documents within each collection are the actual services.

## Architecture Overview

### Collections Structure
- **Ignored Collections**: `busers` and `services` are completely excluded
- **Service Categories**: All other collections represent service categories (e.g., `trainers`, `grooming`, `veterinary`)
- **Services**: Documents within each collection are individual services

### Backend Implementation

#### Express.js Server (Port 5001)
- **MongoDB Atlas Connection**: Connects to the WhiskerBond database
- **Dynamic Collection Fetching**: Automatically discovers and processes all valid collections
- **Service Mapping**: Transforms MongoDB documents into standardized service objects

### API Endpoints

#### GET /api/services
Returns all services organized by categories.

**Response Structure:**
```json
{
  "allServices": [
    {
      "id": "1",
      "name": "Professional Dog Training",
      "category": "Trainers",
      "description": "Expert training services for all dog breeds",
      "location": "WhiskerBond Services",
      "rating": 5,
      "price": "$75/hour",
      "image": "https://...",
      "featured": false,
      "petTypes": ["Dog"],
      "collectionName": "trainers",
      "originalData": { /* Original MongoDB document */ }
    }
  ],
  "categories": {
    "trainers": {
      "categoryName": "Trainers",
      "services": [ /* Array of trainer services */ ],
      "count": 5
    },
    "grooming": {
      "categoryName": "Grooming", 
      "services": [ /* Array of grooming services */ ],
      "count": 8
    }
  },
  "totalServices": 25,
  "totalCategories": 4
}
```

#### GET /api/services/:category
Returns services from a specific category.

**Example**: `/api/services/trainers`

**Response Structure:**
```json
{
  "category": "Trainers",
  "services": [ /* Array of trainer services */ ],
  "count": 5
}
```

#### GET /api/health
Health check endpoint.

### Frontend Implementation

#### Services Section Features
1. **All Services View**: Shows all services from all collections
2. **Category Filtering**: Filter services by specific categories
3. **Dynamic Categories**: Categories are generated from actual database collections
4. **Service Count Display**: Shows number of services in each category
5. **Pet Type Filtering**: Filter services based on active pet selection

#### Service Display
- **Service Cards**: Responsive cards showing service details
- **Price Display**: Shows pricing if available in the database
- **Rating System**: Visual star ratings
- **Category Tags**: Service category identification
- **Pet Type Tags**: Applicable pet types for each service

### Database Document Structure

The system expects MongoDB documents to have the following optional fields:

```javascript
{
  name: "Service Name",           // or title, serviceName
  description: "Service details", // or details
  location: "Service Location",   // or address
  rating: 5,                     // 1-5 stars
  price: "$50",                  // or cost (string or number)
  image: "https://...",          // or imageUrl
  featured: true,                // boolean
  petTypes: ["Dog", "Cat"],      // or pets array
  // ... any other custom fields
}
```

### Environment Configuration

```env
MONGODB_URI=mongodb+srv://whiskerBond:wh1sk3rB0nd@whiskerbond.s8edfrz.mongodb.net/whiskerBond?retryWrites=true&w=majority&appName=whiskerBond
PORT=5001
```

### Running the Application

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Start only frontend (port 5173)
npm run dev:frontend

# Start only backend (port 5001)
npm run server
```

### Key Features

1. **Automatic Discovery**: New collections are automatically detected and displayed
2. **Ignored Collections**: `busers` and `services` collections are excluded
3. **Flexible Data Structure**: Handles various document field names gracefully
4. **Error Handling**: Graceful handling of missing collections or connection issues
5. **Category Management**: Dynamic category creation from collection names
6. **Service Filtering**: Multiple filtering options (category, pet type, featured)
7. **Responsive Design**: Optimized for all screen sizes
8. **Real-time Updates**: Changes in database are reflected immediately

### Data Flow

1. **Backend**: Connects to MongoDB Atlas
2. **Collection Discovery**: Lists all collections, excludes `busers` and `services`
3. **Document Fetching**: Retrieves all documents from valid collections
4. **Data Transformation**: Converts documents to standardized service format
5. **API Response**: Structures data for frontend consumption
6. **Frontend Rendering**: Displays services with category filtering

### Example Collections

- **trainers**: Dog trainers, behavior specialists
- **grooming**: Grooming salons, mobile groomers
- **veterinary**: Vet clinics, emergency services
- **walking**: Dog walkers, pet sitters
- **boarding**: Pet hotels, boarding facilities

Each collection can contain any number of service documents, and new collections will automatically appear as new service categories on the website.
