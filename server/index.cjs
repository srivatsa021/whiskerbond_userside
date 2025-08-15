const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'whiskerbond-secret-key';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whiskerBond:wh1sk3rB0nd@whiskerbond.s8edfrz.mongodb.net/whiskerBond?retryWrites=true&w=majority&appName=whiskerBond';
const DB_NAME = 'whiskerBond';

let db;
let mongoClient;

// Connect to MongoDB with retry logic
async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log
    
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    });
    
    await mongoClient.connect();
    console.log('Connected to MongoDB Atlas successfully');
    
    db = mongoClient.db(DB_NAME);
    
    // Test the connection
    await db.admin().ping();
    console.log('MongoDB ping successful');
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Error details:', error.message);
    db = null;
    mongoClient = null;
  }
}

// Initial connection
connectToMongoDB();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { name, email, password, phone, alternatePhone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await db.collection('petowners').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone,
      alternatePhone: alternatePhone || null,
      address,
      createdAt: new Date().toISOString(),
      avatar: null
    };

    const result = await db.collection('petowners').insertOne(newUser);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: result.insertedId,
      name,
      email,
      phone,
      alternatePhone,
      address,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.collection('petowners').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      address: user.address,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const user = await db.collection('petowners').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      address: user.address,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Get User's Pets
app.get('/api/pets', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const pets = await db.collection('allpets').find({
      petOwnerId: new ObjectId(req.user.userId)
    }).toArray();

    res.json({ pets });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Add New Pet
app.post('/api/pets', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { name, age, type, breed, behavior, allergies } = req.body;

    if (!name || !age || !type || !breed || !allergies) {
      return res.status(400).json({ error: 'Missing required pet information' });
    }

    const newPet = {
      name,
      age: parseInt(age),
      type,
      breed,
      behavior: behavior || '',
      allergies,
      medicalDocuments: [],
      petOwnerId: new ObjectId(req.user.userId),
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('allpets').insertOne(newPet);

    res.status(201).json({
      message: 'Pet added successfully',
      pet: { ...newPet, id: result.insertedId }
    });
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Failed to add pet' });
  }
});

// Update Pet
app.put('/api/pets/:petId', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { petId } = req.params;
    const { name, age, type, breed, behavior, allergies } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(age && { age: parseInt(age) }),
      ...(type && { type }),
      ...(breed && { breed }),
      ...(behavior !== undefined && { behavior }),
      ...(allergies && { allergies }),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('allpets').updateOne(
      { 
        _id: new ObjectId(petId),
        petOwnerId: new ObjectId(req.user.userId)
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet updated successfully' });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

// Delete Pet
app.delete('/api/pets/:petId', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { petId } = req.params;

    const result = await db.collection('allpets').deleteOne({
      _id: new ObjectId(petId),
      petOwnerId: new ObjectId(req.user.userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

// Upload Medical Document
app.post('/api/pets/:petId/documents', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { petId } = req.params;
    const documentUrl = `/uploads/${req.file.filename}`;

    const result = await db.collection('allpets').updateOne(
      { 
        _id: new ObjectId(petId),
        petOwnerId: new ObjectId(req.user.userId)
      },
      { 
        $push: { medicalDocuments: documentUrl },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ 
      message: 'Document uploaded successfully',
      documentUrl 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Helper function to get specialized service details based on service type
async function getSpecializedServiceDetails(collectionName, serviceData, docData, db) {
  const baseDetails = {
    duration: serviceData.duration || null,
    availability: docData.availability || null,
    requirements: serviceData.requirements || null,
    appointmentRequired: serviceData.appointmentRequired || false,
    isEmergency: serviceData.isEmergency || false,
    emergency24Hrs: docData.emergency24Hrs || false
  };

  const collectionType = collectionName.toLowerCase();

  switch (collectionType) {
    case 'trainers':
      return {
        ...baseDetails,
        specialization: serviceData.specialization || docData.specialization || 'General Training',
        trainingMethods: serviceData.trainingMethods || docData.trainingMethods || ['Positive Reinforcement'],
        experienceYears: serviceData.experienceYears || docData.experienceYears || 'Not specified',
        certifications: serviceData.certifications || docData.certifications || [],
        groupSessions: serviceData.groupSessions || docData.groupSessions || false,
        privateSessions: serviceData.privateSessions || docData.privateSessions || true,
        homeVisits: serviceData.homeVisits || docData.homeVisits || false,
        trainingPrograms: serviceData.trainingPrograms || docData.trainingPrograms || ['Basic Obedience'],
        ageGroups: serviceData.ageGroups || docData.ageGroups || ['Puppy', 'Adult', 'Senior']
      };

    case 'walkers':
      return {
        ...baseDetails,
        walkingAreas: serviceData.walkingAreas || docData.walkingAreas || ['Local Parks'],
        walkDuration: serviceData.walkDuration || docData.walkDuration || '30 minutes',
        groupWalks: serviceData.groupWalks || docData.groupWalks || false,
        soloWalks: serviceData.soloWalks || docData.soloWalks || true,
        pickupDropoff: serviceData.pickupDropoff || docData.pickupDropoff || true,
        weekendAvailability: serviceData.weekendAvailability || docData.weekendAvailability || false,
        emergencyWalks: serviceData.emergencyWalks || docData.emergencyWalks || false,
        maxPetsPerWalk: serviceData.maxPetsPerWalk || docData.maxPetsPerWalk || 1,
        weatherPolicy: serviceData.weatherPolicy || docData.weatherPolicy || 'All weather conditions'
      };

    case 'ngos':
      // For NGOs, fetch adoption data
      const adoptionData = await getAdoptionData(docData, db);
      return {
        ...baseDetails,
        adoptionServices: true,
        availableForAdoption: adoptionData.availableAnimals || [],
        adoptionProcess: serviceData.adoptionProcess || docData.adoptionProcess || [
          'Application Review',
          'Meet & Greet',
          'Home Visit',
          'Adoption Finalization'
        ],
        adoptionFee: serviceData.adoptionFee || docData.adoptionFee || 'Varies by animal',
        volunteerOpportunities: serviceData.volunteerOpportunities || docData.volunteerOpportunities || ['Animal Care', 'Events'],
        donationInfo: serviceData.donationInfo || docData.donationInfo || 'Donations welcome',
        rescueTypes: serviceData.rescueTypes || docData.rescueTypes || ['Cats', 'Dogs'],
        spayNeuterRequired: serviceData.spayNeuterRequired !== false,
        followUpSupport: serviceData.followUpSupport !== false
      };

    case 'vets':
    case 'veterinary':
      return {
        ...baseDetails,
        emergencyServices: serviceData.emergencyServices || docData.emergencyServices || false,
        surgicalServices: serviceData.surgicalServices || docData.surgicalServices || false,
        diagnosticServices: serviceData.diagnosticServices || docData.diagnosticServices || true,
        vaccinationServices: serviceData.vaccinationServices || docData.vaccinationServices || true,
        dentalServices: serviceData.dentalServices || docData.dentalServices || false,
        specialties: serviceData.specialties || docData.specialties || ['General Practice'],
        labServices: serviceData.labServices || docData.labServices || false,
        xrayServices: serviceData.xrayServices || docData.xrayServices || false
      };

    case 'boardings':
    case 'boarding':
      return {
        ...baseDetails,
        accommodationType: serviceData.accommodationType || docData.accommodationType || 'Standard',
        playTime: serviceData.playTime || docData.playTime || 'Daily',
        mealPlans: serviceData.mealPlans || docData.mealPlans || 'Provided',
        medicationSupport: serviceData.medicationSupport || docData.medicationSupport || false,
        groomingServices: serviceData.groomingServices || docData.groomingServices || false,
        pickupDropoff: serviceData.pickupDropoff || docData.pickupDropoff || true,
        outdoorAccess: serviceData.outdoorAccess || docData.outdoorAccess || true,
        cameraAccess: serviceData.cameraAccess || docData.cameraAccess || false
      };

    default:
      return baseDetails;
  }
}

// Helper function to get adoption data for NGOs
async function getAdoptionData(docData, db) {
  try {
    // Look for adoption-related data in the document
    if (docData.adoptions && Array.isArray(docData.adoptions)) {
      return {
        availableAnimals: docData.adoptions.filter(animal =>
          animal.status === 'available' || !animal.status
        )
      };
    }

    // Look for animals array in the document
    if (docData.animals && Array.isArray(docData.animals)) {
      return {
        availableAnimals: docData.animals.filter(animal =>
          animal.adoptionStatus === 'available' || !animal.adoptionStatus
        )
      };
    }

    // Look for pets array in the document
    if (docData.pets && Array.isArray(docData.pets)) {
      return {
        availableAnimals: docData.pets.filter(pet =>
          pet.available !== false
        )
      };
    }

    return { availableAnimals: [] };
  } catch (error) {
    console.error('Error fetching adoption data:', error);
    return { availableAnimals: [] };
  }
}

// API endpoint to get all services organized by categories
app.get('/api/services', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const categorizedServices = {};
    const allServices = [];
    let serviceId = 1;

    // Debug: List all collections (removed for cleaner logs)

    // Handle Trainers - fetch from trainers collection with busers provider info
    try {
      const trainersCollection = db.collection('trainers');
      const trainerDocs = await trainersCollection.find({}).toArray();
      const trainerServices = [];

      for (const trainerDoc of trainerDocs) {
        let providerInfo = {
          businessName: 'WhiskerBond Training Services',
          contactEmail: 'info@whiskerbond.com',
          contactPhone: '+1-555-WHISKER',
          businessAddress: 'Training Center',
          businessDescription: 'Professional pet training provider'
        };

        // Fetch provider details from busers collection
        // Check for providerId first, then userId for backwards compatibility
        const providerObjId = trainerDoc.providerId || trainerDoc.userId;
        if (providerObjId) {
          try {
            const provider = await db.collection('busers').findOne({
              _id: new ObjectId(providerObjId)
            });

            if (provider) {
              providerInfo = {
                id: provider._id.toString(),
                businessName: provider.businessName || provider.name || 'Unknown Business',
                contactEmail: provider.email || 'contact@business.com',
                contactPhone: provider.contactNo || provider.phone || 'Not provided',
                businessAddress: provider.address || 'Address not provided',
                businessDescription: provider.businessType || 'Professional training provider',
                businessType: provider.businessType || 'trainer',
                name: provider.name || 'Trainer',
                rating: provider.rating || null,
                totalReviews: provider.totalReviews || 0
              };
            }
          } catch (providerError) {
            console.error(`Error fetching trainer provider ${providerObjId}:`, providerError);
          }
        }

        // Process training plans
        if (trainerDoc.trainingPlans && Array.isArray(trainerDoc.trainingPlans)) {
          for (const plan of trainerDoc.trainingPlans) {
            const service = {
              id: (serviceId++).toString(),
              name: plan.serviceName || 'Training Service',
              category: 'Training',
              description: plan.description || 'Professional pet training service',
              location: providerInfo.businessAddress,
              rating: plan.rating || Math.floor(Math.random() * 2) + 4,
              price: plan.price ? (typeof plan.price === 'object' ? plan.price.$numberInt : plan.price) : undefined,
              image: plan.image || getDefaultServiceImage('trainers'),
              featured: plan.featured || false,
              petTypes: plan.petTypes || ['Dog', 'Cat'],
              collectionName: 'trainers',
              provider: providerInfo,
              serviceDetails: {
                duration: plan.duration || null,
                description: plan.description || null,
                serviceName: plan.serviceName || null,
                specialization: 'Pet Training',
                trainingType: plan.serviceName || 'Training Program',
                // Additional trainer-specific details
                experienceYears: providerInfo.experienceYears || 'Not specified',
                certifications: providerInfo.certifications || [],
                homeVisits: true,
                privateSessions: true
              },
              originalData: { ...trainerDoc, currentPlan: plan }
            };

            trainerServices.push(service);
            allServices.push(service);
          }
        } else {
          console.log('No trainingPlans found in trainer document:', trainerDoc._id);
        }
      }

      if (trainerServices.length > 0) {
        categorizedServices['trainers'] = {
          categoryName: 'Trainers',
          services: trainerServices,
          count: trainerServices.length
        };
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }

    // Handle Walkers - fetch directly from busers collection
    try {
      const busersCollection = db.collection('busers');
      const walkerProviders = await busersCollection.find({
        businessType: 'walker'
      }).toArray();
      const walkerServices = [];

      for (const provider of walkerProviders) {
        const service = {
          id: (serviceId++).toString(),
          name: `Walking Service by ${provider.businessName || provider.name}`,
          category: 'Pet Walking',
          description: `Professional pet walking services by ${provider.businessName || provider.name}`,
          location: provider.address || 'Service area varies',
          rating: provider.rating || Math.floor(Math.random() * 2) + 4,
          price: provider.price || undefined,
          image: getDefaultServiceImage('walkers'),
          featured: provider.featured || false,
          petTypes: ['Dog', 'Cat'],
          collectionName: 'walkers',
          provider: {
            businessName: provider.businessName || provider.name || 'Walker Service',
            contactEmail: provider.email || 'contact@walker.com',
            contactPhone: provider.contactNo || 'Not provided',
            businessAddress: provider.address || 'Address not provided',
            businessDescription: 'Professional pet walking service',
            businessType: provider.businessType || 'walker',
            name: provider.name || 'Walker'
          },
          serviceDetails: {
            walkingService: true,
            providerName: provider.name,
            contactNumber: provider.contactNo,
            serviceArea: provider.address
          },
          originalData: provider
        };

        walkerServices.push(service);
        allServices.push(service);
      }

      if (walkerServices.length > 0) {
        categorizedServices['walkers'] = {
          categoryName: 'Walkers',
          services: walkerServices,
          count: walkerServices.length
        };
      }
    } catch (error) {
      console.error('Error fetching walkers:', error);
    }

    // Handle Boardings - fetch directly from busers collection
    try {
      const busersCollection = db.collection('busers');
      const boardingProviders = await busersCollection.find({
        businessType: 'boarding'
      }).toArray();
      const boardingServices = [];

      for (const provider of boardingProviders) {
        const service = {
          id: (serviceId++).toString(),
          name: `Boarding Service by ${provider.businessName || provider.name}`,
          category: 'Pet Boarding',
          description: `Professional pet boarding services by ${provider.businessName || provider.name}`,
          location: provider.address || 'Facility location varies',
          rating: provider.rating || Math.floor(Math.random() * 2) + 4,
          price: provider.price || undefined,
          image: getDefaultServiceImage('boarding'),
          featured: provider.featured || false,
          petTypes: ['Dog', 'Cat'],
          collectionName: 'boardings',
          provider: {
            businessName: provider.businessName || provider.name || 'Boarding Service',
            contactEmail: provider.email || 'contact@boarding.com',
            contactPhone: provider.contactNo || 'Not provided',
            businessAddress: provider.address || 'Address not provided',
            businessDescription: 'Professional pet boarding service',
            businessType: provider.businessType || 'boarding',
            name: provider.name || 'Boarding Provider'
          },
          serviceDetails: {
            boardingService: true,
            providerName: provider.name,
            contactNumber: provider.contactNo,
            facilityAddress: provider.address
          },
          originalData: provider
        };

        boardingServices.push(service);
        allServices.push(service);
      }

      if (boardingServices.length > 0) {
        categorizedServices['boardings'] = {
          categoryName: 'Boardings',
          services: boardingServices,
          count: boardingServices.length
        };
      }
    } catch (error) {
      console.error('Error fetching boardings:', error);
    }

    // Handle NGOs - fetch from ngos collection with adoption information
    try {
      console.log('Processing NGOs...');
      const ngosCollection = db.collection('ngos');
      const ngoDocs = await ngosCollection.find({}).toArray();
      console.log(`Found ${ngoDocs.length} NGO documents`);
      const ngoServices = [];

      for (const ngoDoc of ngoDocs) {
        let providerInfo = {
          businessName: 'WhiskerBond NGO Services',
          contactEmail: 'info@whiskerbond.com',
          contactPhone: '+1-555-WHISKER',
          businessAddress: 'NGO Center',
          businessDescription: 'Professional pet rescue organization'
        };

        // Fetch provider details from busers collection
        if (ngoDoc.userId) {
          try {
            const provider = await db.collection('busers').findOne({
              _id: new ObjectId(ngoDoc.userId)
            });

            if (provider) {
              providerInfo = {
                businessName: provider.businessName || provider.name || 'Unknown NGO',
                contactEmail: provider.email || 'contact@ngo.com',
                contactPhone: provider.contactNo || provider.phone || 'Not provided',
                businessAddress: provider.address || 'Address not provided',
                businessDescription: provider.businessType || 'Professional rescue organization',
                businessType: provider.businessType || 'ngo',
                name: provider.name || 'NGO',
                rating: provider.rating || null,
                totalReviews: provider.totalReviews || 0
              };
            }
          } catch (providerError) {
            console.error(`Error fetching NGO provider ${ngoDoc.userId}:`, providerError);
          }
        }

        // Process services array for NGOs
        if (ngoDoc.services && Array.isArray(ngoDoc.services)) {
          for (const service of ngoDoc.services) {
            const ngoService = {
              id: (serviceId++).toString(),
              name: service.serviceName || service.name || `${providerInfo.businessName} Service`,
              category: 'NGO Services',
              description: service.description || 'Professional pet rescue and adoption services',
              location: providerInfo.businessAddress,
              rating: service.rating || ngoDoc.rating || Math.floor(Math.random() * 2) + 4,
              price: service.price ? (typeof service.price === 'object' ? service.price.$numberInt : service.price) : 'Free/Donation',
              image: service.image || ngoDoc.image || getDefaultServiceImage('ngos'),
              featured: service.featured || ngoDoc.featured || false,
              petTypes: service.petTypes || ngoDoc.petTypes || ['Dog', 'Cat'],
              collectionName: 'ngos',
              provider: providerInfo,
              serviceDetails: {
                duration: service.duration || null,
                description: service.description || null,
                serviceName: service.serviceName || service.name || null,
                adoptionServices: true,
                availableForAdoption: await getAdoptionData(ngoDoc, db),
                adoptionProcess: service.adoptionProcess || ngoDoc.adoptionProcess || [
                  'Application Review',
                  'Meet & Greet',
                  'Home Visit',
                  'Adoption Finalization'
                ],
                adoptionFee: service.adoptionFee || ngoDoc.adoptionFee || 'Varies by animal',
                volunteerOpportunities: service.volunteerOpportunities || ngoDoc.volunteerOpportunities || ['Animal Care', 'Events'],
                donationInfo: service.donationInfo || ngoDoc.donationInfo || 'Donations welcome',
                rescueTypes: service.rescueTypes || ngoDoc.rescueTypes || ['Cats', 'Dogs'],
                spayNeuterRequired: service.spayNeuterRequired !== false,
                followUpSupport: service.followUpSupport !== false
              },
              originalData: { ...ngoDoc, currentService: service }
            };

            ngoServices.push(ngoService);
            allServices.push(ngoService);
          }
        } else {
          // If no services array, create a general NGO service with adoption info
          const ngoService = {
            id: (serviceId++).toString(),
            name: `${providerInfo.businessName} - Adoption Services`,
            category: 'NGO Services',
            description: `Pet rescue and adoption services by ${providerInfo.businessName}`,
            location: providerInfo.businessAddress,
            rating: ngoDoc.rating || Math.floor(Math.random() * 2) + 4,
            price: 'Free/Donation',
            image: ngoDoc.image || getDefaultServiceImage('ngos'),
            featured: ngoDoc.featured || false,
            petTypes: ngoDoc.petTypes || ['Dog', 'Cat'],
            collectionName: 'ngos',
            provider: providerInfo,
            serviceDetails: {
              adoptionServices: true,
              availableForAdoption: await getAdoptionData(ngoDoc, db),
              adoptionProcess: ngoDoc.adoptionProcess || [
                'Application Review',
                'Meet & Greet',
                'Home Visit',
                'Adoption Finalization'
              ],
              adoptionFee: ngoDoc.adoptionFee || 'Varies by animal',
              volunteerOpportunities: ngoDoc.volunteerOpportunities || ['Animal Care', 'Events'],
              donationInfo: ngoDoc.donationInfo || 'Donations welcome',
              rescueTypes: ngoDoc.rescueTypes || ['Cats', 'Dogs'],
              spayNeuterRequired: ngoDoc.spayNeuterRequired !== false,
              followUpSupport: ngoDoc.followUpSupport !== false
            },
            originalData: ngoDoc
          };

          ngoServices.push(ngoService);
          allServices.push(ngoService);
        }
      }

      if (ngoServices.length > 0) {
        categorizedServices['ngos'] = {
          categoryName: 'NGOs',
          services: ngoServices,
          count: ngoServices.length
        };
        console.log(`Added ${ngoServices.length} NGO services to categorizedServices`);
      } else {
        console.log('No NGO services found to add');
      }
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    }

    // Handle other collections (vets, etc.) - existing logic
    const ignoredCollections = ['busers', 'services', 'petowners', 'allpets', 'trainers', 'ngos'];
    const collections = await db.listCollections().toArray();
    const validCollectionNames = collections
      .map(collection => collection.name)
      .filter(name =>
        !name.startsWith('system.') &&
        !ignoredCollections.includes(name.toLowerCase()) &&
        name.toLowerCase() !== 'walkers' &&
        name.toLowerCase() !== 'boardings'
      );

    for (const collectionName of validCollectionNames) {
      try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        const categoryServices = [];

        for (const doc of documents) {
          let providerInfo = {
            businessName: 'WhiskerBond Services',
            contactEmail: 'info@whiskerbond.com',
            contactPhone: '+1-555-WHISKER',
            businessAddress: 'Digital Services Platform',
            businessDescription: 'Professional pet service provider'
          };

          if (doc.userId) {
            try {
              const provider = await db.collection('busers').findOne({
                _id: new ObjectId(doc.userId)
              });

              if (provider) {
                providerInfo = {
                  id: provider._id.toString(),
                  businessName: provider.businessName || provider.name || 'Unknown Business',
                  contactEmail: provider.email || 'contact@business.com',
                  contactPhone: provider.contactNo || provider.phone || 'Not provided',
                  businessAddress: provider.address || 'Address not provided',
                  businessDescription: provider.businessType || 'Professional service provider',
                  businessType: provider.businessType || null,
                  rating: provider.rating || null,
                  totalReviews: provider.totalReviews || 0
                };
              }
            } catch (providerError) {
              console.error(`Error fetching provider for document ${doc._id}:`, providerError);
            }
          }

          if (doc.services && Array.isArray(doc.services)) {
            for (const individualService of doc.services) {
              const service = {
                id: (serviceId++).toString(),
                name: individualService.serviceName || individualService.name || `${providerInfo.businessName} Service`,
                category: individualService.category || formatCollectionName(collectionName),
                description: individualService.description || `${collectionName} service provided by ${providerInfo.businessName}`,
                location: providerInfo.businessAddress,
                rating: individualService.rating || doc.rating || Math.floor(Math.random() * 2) + 4,
                price: individualService.price ? (typeof individualService.price === 'object' ? individualService.price.$numberInt : individualService.price) : undefined,
                image: individualService.image || doc.image || getDefaultServiceImage(collectionName),
                featured: individualService.featured || doc.featured || false,
                petTypes: individualService.petTypes || doc.petTypes || ['Dog', 'Cat'],
                collectionName: collectionName,
                provider: providerInfo,
                serviceDetails: await getSpecializedServiceDetails(collectionName, individualService, doc, db),
                originalData: { ...doc, currentService: individualService }
              };

              categoryServices.push(service);
              allServices.push(service);
            }
          }
        }

        if (categoryServices.length > 0) {
          categorizedServices[collectionName] = {
            categoryName: formatCollectionName(collectionName),
            services: categoryServices,
            count: categoryServices.length
          };
        }
      } catch (collectionError) {
        console.error(`Error fetching from collection ${collectionName}:`, collectionError);
      }
    }

    const response = {
      allServices: allServices,
      categories: categorizedServices,
      totalServices: allServices.length,
      totalCategories: Object.keys(categorizedServices).length
    };

    console.log('Final response categories:', Object.keys(categorizedServices));
    console.log('Total services per category:', Object.fromEntries(
      Object.entries(categorizedServices).map(([key, cat]) => [key, cat.count])
    ));

    res.json(response);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// API endpoint to get services from a specific category
app.get('/api/services/:category', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { category } = req.params;
    const ignoredCollections = ['busers', 'services', 'petowners', 'allpets'];

    // Check if the category exists and is not ignored
    if (ignoredCollections.includes(category.toLowerCase())) {
      return res.status(404).json({ error: 'Category not found or not available' });
    }

    // Get all collections to verify the category exists
    const collections = await db.listCollections().toArray();
    const validCollectionNames = collections
      .map(collection => collection.name)
      .filter(name => 
        !name.startsWith('system.') && 
        !ignoredCollections.includes(name.toLowerCase())
      );

    if (!validCollectionNames.includes(category)) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch services from the specific category
    const collection = db.collection(category);
    const documents = await collection.find({}).toArray();
    
    const services = documents.map((doc, index) => ({
      id: (index + 1).toString(),
      name: doc.name || doc.title || doc.serviceName || `Service ${doc._id}`,
      category: formatCollectionName(category),
      description: doc.description || doc.details || `Service from ${category} category`,
      location: doc.location || doc.address || 'WhiskerBond Services',
      rating: doc.rating || Math.floor(Math.random() * 2) + 4,
      price: doc.price || doc.cost || undefined,
      image: doc.image || doc.imageUrl || getDefaultServiceImage(category),
      featured: doc.featured || false,
      petTypes: doc.petTypes || doc.pets || ['Dog', 'Cat'],
      collectionName: category,
      originalData: doc
    }));

    res.json({
      category: formatCollectionName(category),
      services: services,
      count: services.length
    });
  } catch (error) {
    console.error(`Error fetching services from category ${req.params.category}:`, error);
    res.status(500).json({ error: 'Failed to fetch category services' });
  }
});

// Helper function to get default service image based on category
function getDefaultServiceImage(collectionName) {
  const imageMap = {
    'trainers': 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'grooming': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'veterinary': 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'walking': 'https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'boarding': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'spa': 'https://images.unsplash.com/photo-1596492784531-6c9bb4dde4eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  };
  
  return imageMap[collectionName.toLowerCase()] || 
         `https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`;
}

// Helper function to format collection names for display
function formatCollectionName(collectionName) {
  // Convert camelCase or snake_case to readable format
  return collectionName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Create Vet Booking (Embedded in Vet Document)
app.post('/api/vet-bookings', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const {
      petId,
      petName,
      petParent,
      serviceName,
      serviceCategory,
      provider,
      providerId: frontendProviderId,
      serviceId,
      price,
      duration,
      date,
      time,
      notes,
      symptoms,
      isEmergency = false,
      status = 'confirmed'
    } = req.body;

    // Validate required fields
    if (!petId || !petName || !petParent || !serviceName || !date || !time) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    // Verify the pet belongs to the authenticated user
    const pet = await db.collection('allpets').findOne({
      _id: new ObjectId(petId),
      petOwnerId: new ObjectId(req.user.userId)
    });

    if (!pet) {
      return res.status(403).json({ error: 'Pet not found or unauthorized' });
    }

    // Find the vet document to embed the appointment
    let providerId = frontendProviderId || null;
    let vetDoc = null;

    if (providerId) {
      // Find vet by providerId
      vetDoc = await db.collection('vets').findOne({
        $or: [
          { providerId: new ObjectId(providerId) },
          { userId: new ObjectId(providerId) }
        ]
      });
    }

    // If no vet found by providerId, search by service name
    if (!vetDoc) {
      vetDoc = await db.collection('vets').findOne({
        $or: [
          { 'services.serviceName': serviceName },
          { 'services.name': serviceName },
          { name: serviceName }
        ]
      });
    }

    // If still no vet found, search by provider business name
    if (!vetDoc && provider) {
      const businessDoc = await db.collection('busers').findOne({
        businessName: { $regex: new RegExp(provider, 'i') }
      });

      if (businessDoc) {
        vetDoc = await db.collection('vets').findOne({
          $or: [
            { providerId: businessDoc._id },
            { userId: businessDoc._id }
          ]
        });
        providerId = businessDoc._id.toString();
      }
    }

    if (!vetDoc) {
      return res.status(404).json({ error: 'Vet not found for this service' });
    }

    providerId = vetDoc.providerId || vetDoc.userId;

    // Find the specific service in the vet's services array
    let matchingService = null;
    if (vetDoc.services && Array.isArray(vetDoc.services)) {
      matchingService = vetDoc.services.find(service =>
        service.serviceName === serviceName ||
        service.name === serviceName
      );
    }

    // Check for existing appointment for the same service, pet, and date
    const existingAppointment = vetDoc.appointments?.find(apt => {
      if (apt.patientId.toString() !== petId || apt.serviceName !== serviceName) {
        return false;
      }

      if (!['confirmed', 'pending'].includes(apt.status)) {
        return false;
      }

      // Check date - handle both new appointmentTime format and legacy date field
      if (apt.appointmentTime) {
        try {
          const appointmentDate = new Date(apt.appointmentTime);
          if (!isNaN(appointmentDate.getTime())) {
            const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
            return appointmentDateStr === date;
          }
        } catch (error) {
          console.error('Error parsing appointmentTime:', apt.appointmentTime, error);
        }
      }

      // Fallback to legacy date field
      if (apt.date) {
        return apt.date === date;
      }

      return false;
    });

    if (existingAppointment) {
      return res.status(400).json({
        error: 'Appointment already exists for this service and date',
        existingAppointment: existingAppointment
      });
    }

    // Create valid appointment time
    let appointmentTime;
    try {
      const timeIn24Hour = convertTo24Hour(time);
      appointmentTime = `${date}T${timeIn24Hour}:00.000Z`;

      // Validate the created date
      const testDate = new Date(appointmentTime);
      if (isNaN(testDate.getTime())) {
        throw new Error('Invalid date created');
      }
    } catch (error) {
      console.error('Error creating appointment time:', { date, time, error });
      // Fallback to current date with 9 AM
      const fallbackDate = new Date();
      appointmentTime = fallbackDate.toISOString();
    }

    // Create appointment object
    const newAppointment = {
      appointmentId: new ObjectId(),
      patientId: new ObjectId(petId),
      patientName: petName,
      petParent,
      serviceId: matchingService?._id || null,
      serviceName,
      appointmentTime,
      status,
      notes: notes || '',
      symptoms: symptoms || '',
      isEmergency,
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      duration: duration || '30 minutes',
      userId: new ObjectId(req.user.userId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add appointment to vet's appointments array
    const result = await db.collection('vets').updateOne(
      { _id: vetDoc._id },
      {
        $push: { appointments: newAppointment },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Failed to add appointment to vet document' });
    }

    // Sync appointment to pet's record
    try {
      await syncAppointmentToPet(petId, newAppointment, vetDoc);
    } catch (syncError) {
      console.error('Error syncing appointment to pet record:', syncError);
      // Don't fail the request if sync fails
    }

    res.status(201).json({
      message: 'Vet appointment created successfully',
      appointmentId: newAppointment.appointmentId,
      appointment: newAppointment,
      vetId: vetDoc._id
    });
  } catch (error) {
    console.error('Error creating vet appointment:', error);
    res.status(500).json({ error: 'Failed to create vet appointment' });
  }
});

// Helper function to sync appointment to pet record
async function syncAppointmentToPet(petId, appointment, vetDoc) {
  try {
    const appointmentData = {
      appointmentId: appointment.appointmentId.toString(),
      vetId: vetDoc._id.toString(),
      vetName: vetDoc.name,
      serviceId: appointment.serviceId ? appointment.serviceId.toString() : null,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      notes: appointment.notes || '',
      symptoms: appointment.symptoms || '',
      isEmergency: appointment.isEmergency || false,
      price: typeof appointment.price === 'number' ? appointment.price : 0,
      duration: appointment.duration || '30 minutes',
      diagnosis: appointment.diagnosis || '',
      followUpRequired: appointment.followUpRequired || false,
      prescription: appointment.prescription || null,
      treatment: appointment.treatment || '',
      documents: appointment.documents || [],
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt || appointment.createdAt
    };

    // Update the pet document - either add new appointment or update existing one
    const result = await db.collection('allpets').updateOne(
      {
        _id: new ObjectId(petId),
        'appointments.appointmentId': { $ne: appointment.appointmentId.toString() }
      },
      {
        $push: { appointments: appointmentData },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    // If no document was modified, the appointment might already exist - update it instead
    if (result.matchedCount === 0) {
      await db.collection('allpets').updateOne(
        {
          _id: new ObjectId(petId),
          'appointments.appointmentId': appointment.appointmentId.toString()
        },
        {
          $set: {
            'appointments.$': appointmentData,
            updatedAt: new Date().toISOString()
          }
        }
      );
    }

    console.log(`Synced appointment ${appointment.appointmentId} to pet ${petId}`);
  } catch (error) {
    console.error('Error in syncAppointmentToPet:', error);
    throw error;
  }
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h || typeof time12h !== 'string') {
    console.warn('Invalid time input:', time12h);
    return '09:00';
  }

  try {
    // Clean the input
    const cleanTime = time12h.trim().replace(/\s+/g, ' ');

    // Handle different time formats
    let timeStr, period;

    // Check for AM/PM format
    const ampmMatch = cleanTime.match(/^(\d{1,2}):?(\d{2})?\s*([AaPp][Mm])$/);
    if (ampmMatch) {
      const [, hours, minutes, periodPart] = ampmMatch;
      timeStr = `${hours}:${minutes || '00'}`;
      period = periodPart;
    } else {
      // Try splitting by AM/PM
      const parts = cleanTime.split(/\s*([AaPp][Mm])\s*$/);
      if (parts.length >= 2) {
        timeStr = parts[0];
        period = parts[1];
      } else {
        // Assume 24-hour format or no period
        timeStr = cleanTime;
        period = null;
      }
    }

    // Parse hours and minutes
    const timeParts = timeStr.split(':');
    if (timeParts.length < 2) {
      console.warn('Invalid time format:', time12h);
      return '09:00';
    }

    let hours = parseInt(timeParts[0]);
    let minutes = timeParts[1] || '00';

    // Validate hours and minutes
    if (isNaN(hours) || hours < 1 || hours > 12) {
      console.warn('Invalid hours:', hours, 'in time:', time12h);
      return '09:00';
    }

    if (isNaN(parseInt(minutes)) || parseInt(minutes) < 0 || parseInt(minutes) > 59) {
      console.warn('Invalid minutes:', minutes, 'in time:', time12h);
      minutes = '00';
    }

    // Convert to 24-hour format
    if (period) {
      const periodLower = period.toLowerCase();
      if (periodLower === 'pm' && hours !== 12) {
        hours += 12;
      } else if (periodLower === 'am' && hours === 12) {
        hours = 0;
      }
    }

    // Ensure hours is in valid 24-hour range
    if (hours > 23) hours = 23;
    if (hours < 0) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting time:', time12h, error);
    return '09:00';
  }
}

// Check if appointment exists for specific service and pet
app.get('/api/vet-bookings/check', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { petId, serviceName } = req.query;

    if (!petId || !serviceName) {
      return res.status(400).json({ error: 'Missing petId or serviceName' });
    }

    // Search for appointments in vets collection
    const vetWithAppointment = await db.collection('vets').findOne({
      'appointments': {
        $elemMatch: {
          patientId: new ObjectId(petId),
          serviceName: serviceName,
          userId: new ObjectId(req.user.userId),
          status: { $in: ['confirmed', 'pending'] }
        }
      }
    });

    let existingAppointment = null;
    if (vetWithAppointment) {
      existingAppointment = vetWithAppointment.appointments.find(apt =>
        apt.patientId.toString() === petId &&
        apt.serviceName === serviceName &&
        apt.userId.toString() === req.user.userId &&
        ['confirmed', 'pending'].includes(apt.status)
      );
    }

    res.json({
      hasBooking: !!existingAppointment,
      booking: existingAppointment
    });
  } catch (error) {
    console.error('Error checking vet appointment:', error);
    res.status(500).json({ error: 'Failed to check vet appointment' });
  }
});

// Get Provider's Vet Appointments (for service providers)
app.get('/api/vet-bookings/provider', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Find the vet document for this provider
    const vetDoc = await db.collection('vets').findOne({
      $or: [
        { providerId: new ObjectId(req.user.userId) },
        { userId: new ObjectId(req.user.userId) }
      ]
    });

    if (!vetDoc) {
      return res.json({ appointments: [] });
    }

    // Sort appointments by creation date (most recent first)
    const appointments = (vetDoc.appointments || []).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      appointments,
      vetInfo: {
        name: vetDoc.name,
        description: vetDoc.description,
        services: vetDoc.services || []
      }
    });
  } catch (error) {
    console.error('Error fetching provider appointments:', error);
    res.status(500).json({ error: 'Failed to fetch provider appointments' });
  }
});

// Get User's Vet Appointments
app.get('/api/vet-bookings', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Find all vets that have appointments for this user
    const vetsWithAppointments = await db.collection('vets').find({
      'appointments.userId': new ObjectId(req.user.userId)
    }).toArray();

    // Extract and flatten appointments for this user
    const userAppointments = [];
    vetsWithAppointments.forEach(vet => {
      if (vet.appointments) {
        const userAppts = vet.appointments.filter(apt =>
          apt.userId.toString() === req.user.userId
        );
        userAppts.forEach(apt => {
          userAppointments.push({
            ...apt,
            vetName: vet.name,
            vetId: vet._id,
            providerInfo: {
              name: vet.name,
              businessAddress: vet.businessAddress,
              contactEmail: vet.contactEmail,
              contactPhone: vet.contactPhone
            }
          });
        });
      }
    });

    // Sort by creation date (most recent first)
    userAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ appointments: userAppointments });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ error: 'Failed to fetch user appointments' });
  }
});

// Get Specific Vet Appointment
app.get('/api/vet-bookings/:appointmentId', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { appointmentId } = req.params;

    // Find vet document containing the appointment
    const vetDoc = await db.collection('vets').findOne({
      'appointments.appointmentId': new ObjectId(appointmentId)
    });

    if (!vetDoc) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = vetDoc.appointments.find(apt =>
      apt.appointmentId.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has permission to view this appointment
    const isOwner = appointment.userId && appointment.userId.toString() === req.user.userId;
    const isProvider = (vetDoc.providerId && vetDoc.providerId.toString() === req.user.userId) ||
                      (vetDoc.userId && vetDoc.userId.toString() === req.user.userId);

    if (!isOwner && !isProvider) {
      return res.status(403).json({ error: 'Unauthorized to view this appointment' });
    }

    res.json({
      appointment: {
        ...appointment,
        vetName: vetDoc.name,
        vetId: vetDoc._id
      }
    });
  } catch (error) {
    console.error('Error fetching vet appointment:', error);
    res.status(500).json({ error: 'Failed to fetch vet appointment' });
  }
});

// Update Vet Appointment Status
app.put('/api/vet-bookings/:appointmentId', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { appointmentId } = req.params;
    const { status, notes, symptoms, appointmentTime } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find vet document containing the appointment
    const vetDoc = await db.collection('vets').findOne({
      'appointments.appointmentId': new ObjectId(appointmentId)
    });

    if (!vetDoc) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = vetDoc.appointments.find(apt =>
      apt.appointmentId.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    const isOwner = appointment.userId && appointment.userId.toString() === req.user.userId;
    const isProvider = (vetDoc.providerId && vetDoc.providerId.toString() === req.user.userId) ||
                      (vetDoc.userId && vetDoc.userId.toString() === req.user.userId);

    if (!isOwner && !isProvider) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }

    // Update the appointment in the appointments array
    const updateData = {
      'appointments.$.status': status,
      'appointments.$.updatedAt': new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData['appointments.$.notes'] = notes;
    }

    if (symptoms !== undefined) {
      updateData['appointments.$.symptoms'] = symptoms;
    }

    // Only appointment owners can update appointment time
    if (isOwner && !isProvider && appointmentTime) {
      updateData['appointments.$.appointmentTime'] = appointmentTime;
    }

    const result = await db.collection('vets').updateOne(
      {
        _id: vetDoc._id,
        'appointments.appointmentId': new ObjectId(appointmentId)
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointmentId: appointmentId
    });
  } catch (error) {
    console.error('Error updating vet appointment:', error);
    res.status(500).json({ error: 'Failed to update vet appointment' });
  }
});

// Cancel Vet Appointment
app.delete('/api/vet-bookings/:appointmentId', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { appointmentId } = req.params;

    // Find vet document containing the appointment
    const vetDoc = await db.collection('vets').findOne({
      'appointments.appointmentId': new ObjectId(appointmentId)
    });

    if (!vetDoc) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = vetDoc.appointments.find(apt =>
      apt.appointmentId.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions - only appointment owner can cancel
    const isOwner = appointment.userId && appointment.userId.toString() === req.user.userId;

    if (!isOwner) {
      return res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
    }

    // Update status to cancelled instead of removing
    const result = await db.collection('vets').updateOne(
      {
        _id: vetDoc._id,
        'appointments.appointmentId': new ObjectId(appointmentId)
      },
      {
        $set: {
          'appointments.$.status': 'cancelled',
          'appointments.$.updatedAt': new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointmentId: appointmentId
    });
  } catch (error) {
    console.error('Error cancelling vet appointment:', error);
    res.status(500).json({ error: 'Failed to cancel vet appointment' });
  }
});

// Sync appointments to allpets collection
app.post('/api/pets/sync-appointments', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    console.log('Starting appointment sync for all pets...');

    // Get all pets for the authenticated user
    const userPets = await db.collection('allpets').find({
      petOwnerId: new ObjectId(req.user.userId)
    }).toArray();

    let totalSynced = 0;
    let petsUpdated = 0;

    for (const pet of userPets) {
      // Find all appointments for this pet across all vets
      const vetsWithAppointments = await db.collection('vets').find({
        'appointments.patientId': pet._id
      }).toArray();

      let petAppointments = [];

      // Extract appointments for this pet from all vet documents
      for (const vet of vetsWithAppointments) {
        if (vet.appointments) {
          const petSpecificAppointments = vet.appointments
            .filter(apt => apt.patientId.toString() === pet._id.toString())
            .map(apt => ({
              appointmentId: apt.appointmentId.toString(),
              vetId: vet._id.toString(),
              vetName: vet.name,
              serviceId: apt.serviceId ? apt.serviceId.toString() : null,
              serviceName: apt.serviceName,
              appointmentTime: apt.appointmentTime,
              status: apt.status,
              notes: apt.notes || '',
              symptoms: apt.symptoms || '',
              isEmergency: apt.isEmergency || false,
              price: typeof apt.price === 'number' ? apt.price : (apt.price?.$numberInt ? parseInt(apt.price.$numberInt) : 0),
              duration: apt.duration || '30 minutes',
              diagnosis: apt.diagnosis || '',
              followUpRequired: apt.followUpRequired || false,
              prescription: apt.prescription || null,
              treatment: apt.treatment || '',
              documents: apt.documents || [],
              createdAt: apt.createdAt,
              updatedAt: apt.updatedAt || apt.createdAt
            }));

          petAppointments = petAppointments.concat(petSpecificAppointments);
        }
      }

      // Sort appointments by date (newest first)
      petAppointments.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());

      // Update the pet document with appointments
      await db.collection('allpets').updateOne(
        { _id: pet._id },
        {
          $set: {
            appointments: petAppointments,
            updatedAt: new Date().toISOString()
          }
        }
      );

      if (petAppointments.length > 0) {
        petsUpdated++;
        totalSynced += petAppointments.length;
        console.log(`Synced ${petAppointments.length} appointments for pet ${pet.name}`);
      }
    }

    console.log(`Appointment sync completed: ${totalSynced} appointments synced for ${petsUpdated} pets`);

    res.json({
      message: 'Appointments synced successfully',
      totalAppointments: totalSynced,
      petsUpdated: petsUpdated
    });

  } catch (error) {
    console.error('Error syncing appointments:', error);
    res.status(500).json({ error: 'Failed to sync appointments' });
  }
});

// Get pet appointments (from allpets collection)
app.get('/api/pets/:petId/appointments', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { petId } = req.params;

    // Verify the pet belongs to the authenticated user
    const pet = await db.collection('allpets').findOne({
      _id: new ObjectId(petId),
      petOwnerId: new ObjectId(req.user.userId)
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found or unauthorized' });
    }

    res.json({
      appointments: pet.appointments || [],
      petName: pet.name
    });

  } catch (error) {
    console.error('Error fetching pet appointments:', error);
    res.status(500).json({ error: 'Failed to fetch pet appointments' });
  }
});

// Manual sync for kutta's appointment
app.post('/api/pets/manual-sync-kutta', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    console.log('Manual sync for kutta appointment...');

    // Find kutta pet
    const kuttaPet = await db.collection('allpets').findOne({
      name: { $regex: /kutta/i },
      petOwnerId: new ObjectId(req.user.userId)
    });

    if (!kuttaPet) {
      return res.status(404).json({ error: 'Kutta pet not found' });
    }

    console.log(`Found kutta: ${kuttaPet.name} (${kuttaPet._id})`);

    // Find the vet with completed appointment
    const vetWithAppointment = await db.collection('vets').findOne({
      'appointments': {
        $elemMatch: {
          patientId: kuttaPet._id,
          status: 'completed'
        }
      }
    });

    if (!vetWithAppointment) {
      return res.status(404).json({ error: 'No completed appointment found for kutta' });
    }

    console.log(`Found vet: ${vetWithAppointment.name}`);

    // Get the completed appointment
    const completedAppointment = vetWithAppointment.appointments.find(apt =>
      apt.patientId.toString() === kuttaPet._id.toString() &&
      apt.status === 'completed'
    );

    if (!completedAppointment) {
      return res.status(404).json({ error: 'Completed appointment not found' });
    }

    console.log(`Found appointment: ${completedAppointment.serviceName}`);

    // Create appointment data for pet record
    const appointmentData = {
      appointmentId: completedAppointment.appointmentId.toString(),
      vetId: vetWithAppointment._id.toString(),
      vetName: vetWithAppointment.name,
      serviceId: completedAppointment.serviceId ? completedAppointment.serviceId.toString() : null,
      serviceName: completedAppointment.serviceName,
      appointmentTime: completedAppointment.appointmentTime,
      status: completedAppointment.status,
      notes: completedAppointment.notes || '',
      symptoms: completedAppointment.symptoms || '',
      isEmergency: completedAppointment.isEmergency || false,
      price: typeof completedAppointment.price === 'number' ? completedAppointment.price :
             (completedAppointment.price?.$numberInt ? parseInt(completedAppointment.price.$numberInt) : 12),
      duration: completedAppointment.duration || '10 min',
      diagnosis: completedAppointment.diagnosis || '',
      followUpRequired: completedAppointment.followUpRequired || false,
      prescription: completedAppointment.prescription || null,
      treatment: completedAppointment.treatment || '',
      documents: completedAppointment.documents || [],
      createdAt: completedAppointment.createdAt,
      updatedAt: completedAppointment.updatedAt || completedAppointment.createdAt
    };

    // Update pet record with appointment
    const result = await db.collection('allpets').updateOne(
      { _id: kuttaPet._id },
      {
        $addToSet: { appointments: appointmentData },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    console.log(`Update result: ${result.modifiedCount} documents modified`);

    // Verify the update
    const updatedPet = await db.collection('allpets').findOne({ _id: kuttaPet._id });

    res.json({
      message: 'Kutta appointment synced successfully',
      petName: kuttaPet.name,
      appointmentsSynced: 1,
      totalAppointments: updatedPet.appointments?.length || 0,
      appointmentData: appointmentData
    });

  } catch (error) {
    console.error('Error in manual sync:', error);
    res.status(500).json({ error: 'Failed to sync appointment' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WhiskerBond API is running',
    mongoConnected: !!db,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`WhiskerBond API server running on port ${PORT}`);
});
