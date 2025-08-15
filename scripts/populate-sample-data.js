const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'whiskerBond';

async function populateSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    // Clear existing sample data
    console.log('Clearing existing sample data...');
    await db.collection('busers').deleteMany({ email: { $in: ['demo1@example.com', 'demo2@example.com', 'demo3@example.com'] } });
    await db.collection('trainers').deleteMany({ name: { $regex: /^Sample/ } });
    await db.collection('grooming').deleteMany({ name: { $regex: /^Sample/ } });
    
    // Create sample business users
    console.log('Creating sample business providers...');
    const businesses = [
      {
        businessName: 'Elite Pet Training Academy',
        name: 'John Smith',
        email: 'demo1@example.com',
        phone: '+1-555-PET-TRAIN',
        contactPhone: '+1-555-PET-TRAIN',
        address: '123 Training Ave, Pet City, PC 12345',
        businessAddress: '123 Training Ave, Pet City, PC 12345',
        description: 'Professional pet training services with over 10 years of experience',
        businessDescription: 'We specialize in obedience training, behavior modification, and puppy socialization programs.',
        website: 'https://elitepettraining.com',
        establishedYear: 2014,
        rating: 5,
        totalReviews: 127
      },
      {
        businessName: 'Pampered Paws Grooming Salon',
        name: 'Sarah Johnson',
        email: 'demo2@example.com',
        phone: '+1-555-GROOMING',
        contactPhone: '+1-555-GROOMING',
        address: '456 Beauty Blvd, Grooming Town, GT 67890',
        businessAddress: '456 Beauty Blvd, Grooming Town, GT 67890',
        description: 'Full-service pet grooming and spa treatments',
        businessDescription: 'Luxury grooming services including baths, haircuts, nail trimming, and spa packages for all breeds.',
        website: 'https://pamperedpaws.com',
        establishedYear: 2018,
        rating: 5,
        totalReviews: 89
      },
      {
        businessName: 'Happy Tails Training Center',
        name: 'Mike Wilson',
        email: 'demo3@example.com',
        phone: '+1-555-HAPPY-DOG',
        contactPhone: '+1-555-HAPPY-DOG',
        address: '789 Tail Wag Way, Dogtown, DT 11111',
        businessAddress: '789 Tail Wag Way, Dogtown, DT 11111',
        description: 'Positive reinforcement training for dogs of all ages',
        businessDescription: 'Group classes and private sessions focusing on positive training methods and building strong bonds.',
        establishedYear: 2019,
        rating: 4,
        totalReviews: 65
      }
    ];
    
    const businessResults = await db.collection('busers').insertMany(businesses);
    console.log('Created', businessResults.insertedCount, 'business providers');
    
    // Get the inserted business IDs
    const businessIds = Object.values(businessResults.insertedIds);
    
    // Create sample training services
    console.log('Creating sample training services...');
    const trainingServices = [
      {
        name: 'Basic Obedience Training',
        description: 'Comprehensive 8-week basic obedience program covering sit, stay, come, heel, and down commands. Perfect for puppies and adult dogs.',
        price: '$299',
        duration: '8 weeks (1 hour per week)',
        availability: 'Monday-Friday 9AM-6PM, Saturday 9AM-3PM',
        requirements: 'Dogs must be at least 12 weeks old and up to date on vaccinations',
        includes: 'Training materials, progress tracking, lifetime support',
        petTypes: ['Dog'],
        rating: 5,
        featured: true,
        providerId: businessIds[0]
      },
      {
        name: 'Advanced Agility Training',
        description: 'Advanced agility course for dogs who have completed basic training. Focus on jumps, tunnels, weave poles, and competitive preparation.',
        price: '$450',
        duration: '12 weeks (1.5 hours per week)',
        availability: 'Weekends only',
        requirements: 'Must have completed basic obedience training',
        includes: 'Agility equipment usage, competition preparation, certificate',
        petTypes: ['Dog'],
        rating: 5,
        featured: false,
        providerId: businessIds[2]
      },
      {
        name: 'Puppy Socialization Classes',
        description: 'Early socialization program for puppies 8-16 weeks old. Focus on positive interactions with people, dogs, and new environments.',
        price: '$199',
        duration: '6 weeks (45 minutes per week)',
        availability: 'Tuesday and Thursday evenings',
        requirements: 'Puppies 8-16 weeks old, first vaccination required',
        includes: 'Puppy starter kit, socialization checklist, play time',
        petTypes: ['Dog'],
        rating: 5,
        featured: true,
        providerId: businessIds[0]
      }
    ];
    
    const trainingResults = await db.collection('trainers').insertMany(trainingServices);
    console.log('Created', trainingResults.insertedCount, 'training services');
    
    // Create sample grooming services
    console.log('Creating sample grooming services...');
    const groomingServices = [
      {
        name: 'Full Service Grooming Package',
        description: 'Complete grooming service including bath, haircut, nail trim, ear cleaning, and teeth brushing. Professional styling for all breeds.',
        price: '$75-$150',
        duration: '2-4 hours depending on size and coat',
        availability: 'Tuesday-Saturday 8AM-5PM',
        requirements: 'Dogs must be current on rabies vaccination',
        includes: 'Bath, cut, nail trim, ear cleaning, teeth brushing, cologne spritz',
        petTypes: ['Dog', 'Cat'],
        rating: 5,
        featured: true,
        providerId: businessIds[1]
      },
      {
        name: 'Express Bath & Brush',
        description: 'Quick refresh service perfect for maintenance between full grooming sessions. Includes bath, brush out, and nail trim.',
        price: '$35-$55',
        duration: '1-1.5 hours',
        availability: 'Daily 8AM-6PM',
        requirements: 'Well-behaved pets only',
        includes: 'Bath, brush out, nail trim, ear cleaning',
        petTypes: ['Dog', 'Cat'],
        rating: 4,
        featured: false,
        providerId: businessIds[1]
      }
    ];
    
    const groomingResults = await db.collection('grooming').insertMany(groomingServices);
    console.log('Created', groomingResults.insertedCount, 'grooming services');
    
    console.log('\nSample data population completed successfully!');
    console.log('Business providers:', businessResults.insertedCount);
    console.log('Training services:', trainingResults.insertedCount);
    console.log('Grooming services:', groomingResults.insertedCount);
    
  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    await client.close();
  }
}

// Run the script
populateSampleData();
