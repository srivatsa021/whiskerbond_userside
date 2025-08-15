const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'whiskerBond';

async function createSampleVets() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    console.log('\n=== Creating Sample Vet Data ===\n');
    
    // First, get existing business users to link as providers
    const businesses = await db.collection('busers').find({}).toArray();
    console.log(`Found ${businesses.length} business users`);
    
    const sampleVets = [
      {
        name: "Srivatsa's Veterinary Hospital",
        description: "Professional veterinary care with modern facilities and experienced staff",
        businessAddress: "123 Pet Care Lane, Animal City, AC 12345",
        contactEmail: "contact@srivatsavet.com",
        contactPhone: "+1-555-VET-CARE",
        providerId: businesses[0]?._id || new ObjectId(),
        services: [
          {
            _id: new ObjectId(),
            serviceName: "General Health Checkup",
            name: "General Health Checkup",
            description: "Comprehensive health examination for your pet",
            price: "$75",
            duration: "30 minutes",
            category: "Consultation"
          },
          {
            _id: new ObjectId(),
            serviceName: "Vaccination Drive",
            name: "Vaccination Drive",
            description: "Essential vaccinations to keep your pet healthy",
            price: "$45",
            duration: "15 minutes",
            category: "Preventive Care"
          },
          {
            _id: new ObjectId(),
            serviceName: "Emergency Care",
            name: "Emergency Care",
            description: "24/7 emergency veterinary services",
            price: "$150",
            duration: "45 minutes",
            category: "Emergency"
          }
        ],
        appointments: [], // Will be populated by bookings
        emergencyServices: true,
        surgicalServices: true,
        diagnosticServices: true,
        vaccinationServices: true,
        dentalServices: true,
        specialties: ['General Practice', 'Emergency Care'],
        labServices: true,
        xrayServices: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: "City Pet Clinic",
        description: "Neighborhood veterinary clinic offering quality pet healthcare",
        businessAddress: "456 Animal Avenue, Pet Town, PT 67890",
        contactEmail: "info@citypetclinic.com",
        contactPhone: "+1-555-PET-CITY",
        providerId: businesses[1]?._id || new ObjectId(),
        services: [
          {
            _id: new ObjectId(),
            serviceName: "Routine Checkup",
            name: "Routine Checkup",
            description: "Regular health monitoring for your pet",
            price: "$60",
            duration: "25 minutes",
            category: "Consultation"
          },
          {
            _id: new ObjectId(),
            serviceName: "Dental Cleaning",
            name: "Dental Cleaning",
            description: "Professional dental care and cleaning",
            price: "$120",
            duration: "60 minutes",
            category: "Dental Care"
          },
          {
            _id: new ObjectId(),
            serviceName: "Grooming Service",
            name: "Grooming Service",
            description: "Complete grooming and hygiene care",
            price: "$50",
            duration: "45 minutes",
            category: "Grooming"
          }
        ],
        appointments: [],
        emergencyServices: false,
        surgicalServices: false,
        diagnosticServices: true,
        vaccinationServices: true,
        dentalServices: true,
        specialties: ['General Practice', 'Dental Care'],
        labServices: false,
        xrayServices: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Clear existing vet data
    await db.collection('vets').deleteMany({});
    console.log('Cleared existing vet data');
    
    // Insert sample vets
    const result = await db.collection('vets').insertMany(sampleVets);
    console.log(`Created ${result.insertedCount} sample vet documents`);
    
    // Display created vets
    const createdVets = await db.collection('vets').find({}).toArray();
    createdVets.forEach((vet, index) => {
      console.log(`\n${index + 1}. ${vet.name}`);
      console.log(`   Provider ID: ${vet.providerId}`);
      console.log(`   Services: ${vet.services.length} services`);
      console.log(`   Address: ${vet.businessAddress}`);
    });
    
    console.log('\n✅ Sample vet data created successfully!');
    console.log('\nNow you can:');
    console.log('1. Browse vet services in the Services section');
    console.log('2. Book appointments which will be embedded in vet documents');
    console.log('3. Test the new appointment system');
    
  } catch (error) {
    console.error('Error creating sample vets:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  createSampleVets().catch(console.error);
}

module.exports = { createSampleVets };
