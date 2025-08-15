const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'whiskerBond';

async function migrateToEmbeddedAppointments() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    console.log('\n=== Starting Migration: vet_bookings → vets.appointments ===\n');
    
    // Step 1: Get all existing vet bookings
    const vetBookings = await db.collection('vet_bookings').find({}).toArray();
    console.log(`Found ${vetBookings.length} vet bookings to migrate`);
    
    if (vetBookings.length === 0) {
      console.log('No vet bookings found. Migration completed.');
      return;
    }
    
    // Step 2: Group bookings by providerId
    const bookingsByProvider = {};
    const orphanedBookings = [];
    
    for (const booking of vetBookings) {
      if (booking.providerId) {
        const providerId = booking.providerId.toString();
        if (!bookingsByProvider[providerId]) {
          bookingsByProvider[providerId] = [];
        }
        bookingsByProvider[providerId].push(booking);
      } else {
        orphanedBookings.push(booking);
      }
    }
    
    console.log(`Grouped bookings by ${Object.keys(bookingsByProvider).length} providers`);
    console.log(`Found ${orphanedBookings.length} orphaned bookings (no providerId)`);
    
    // Step 3: Ensure vets collection has the necessary documents
    let vetsProcessed = 0;
    let appointmentsMigrated = 0;
    
    for (const [providerId, bookings] of Object.entries(bookingsByProvider)) {
      console.log(`\nProcessing provider ${providerId} with ${bookings.length} bookings...`);
      
      // Find or create vet document for this provider
      let vetDoc = await db.collection('vets').findOne({
        $or: [
          { providerId: new ObjectId(providerId) },
          { userId: new ObjectId(providerId) }
        ]
      });
      
      if (!vetDoc) {
        // Create a new vet document if none exists
        console.log(`Creating new vet document for provider ${providerId}`);
        
        // Get provider info from busers collection
        const provider = await db.collection('busers').findOne({
          _id: new ObjectId(providerId)
        });
        
        const newVetDoc = {
          name: provider?.businessName || 'Veterinary Services',
          description: provider?.businessDescription || 'Professional veterinary care services',
          businessAddress: provider?.businessAddress || 'Service location varies',
          contactEmail: provider?.email || 'contact@veterinary.com',
          contactPhone: provider?.contactPhone || provider?.phone || 'Contact for details',
          providerId: new ObjectId(providerId),
          services: [
            {
              _id: new ObjectId(),
              serviceName: 'General Consultation',
              description: 'Professional veterinary consultation',
              price: 'Contact for pricing',
              duration: '30 minutes',
              category: 'Consultation'
            },
            {
              _id: new ObjectId(),
              serviceName: 'Vaccination',
              description: 'Pet vaccination services',
              price: 'Contact for pricing',
              duration: '15 minutes',
              category: 'Preventive Care'
            }
          ],
          appointments: [],
          emergencyServices: false,
          surgicalServices: false,
          diagnosticServices: true,
          vaccinationServices: true,
          dentalServices: false,
          specialties: ['General Practice'],
          labServices: false,
          xrayServices: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const result = await db.collection('vets').insertOne(newVetDoc);
        vetDoc = newVetDoc;
        vetDoc._id = result.insertedId;
      }
      
      // Convert bookings to appointments format
      const appointments = bookings.map(booking => {
        // Try to find matching service ID from vet's services array
        let serviceId = null;
        if (vetDoc.services && Array.isArray(vetDoc.services)) {
          const matchingService = vetDoc.services.find(service => 
            service.serviceName === booking.serviceName ||
            service.name === booking.serviceName
          );
          serviceId = matchingService ? matchingService._id : vetDoc.services[0]?._id;
        }
        
        return {
          appointmentId: new ObjectId(),
          patientId: booking.petId,
          patientName: booking.petName,
          petParent: booking.petParent,
          serviceId: serviceId,
          serviceName: booking.serviceName, // Keep for reference
          appointmentTime: `${booking.date}T${convertTo24Hour(booking.time)}:00.000Z`,
          status: mapBookingStatus(booking.status),
          notes: booking.notes || '',
          symptoms: booking.symptoms || '',
          isEmergency: booking.isEmergency || false,
          price: booking.price || 0,
          duration: booking.duration || '30 minutes',
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt || booking.createdAt,
          // Keep original booking reference for tracking
          originalBookingId: booking._id
        };
      });
      
      // Update vet document with appointments
      await db.collection('vets').updateOne(
        { _id: vetDoc._id },
        { 
          $push: { appointments: { $each: appointments } },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
      
      console.log(`Migrated ${appointments.length} appointments to vet ${vetDoc.name}`);
      vetsProcessed++;
      appointmentsMigrated += appointments.length;
    }
    
    // Step 4: Handle orphaned bookings
    if (orphanedBookings.length > 0) {
      console.log(`\n=== Handling ${orphanedBookings.length} orphaned bookings ===`);
      
      // Create a general vet document for orphaned bookings
      const orphanedVetDoc = {
        name: 'General Veterinary Services',
        description: 'Migrated bookings without specific provider',
        businessAddress: 'Various locations',
        contactEmail: 'contact@veterinary.com',
        contactPhone: 'Contact for details',
        providerId: null,
        services: [
          {
            _id: new ObjectId(),
            serviceName: 'General Service',
            description: 'General veterinary service',
            price: 'Contact for pricing',
            duration: '30 minutes',
            category: 'General'
          }
        ],
        appointments: orphanedBookings.map(booking => ({
          appointmentId: new ObjectId(),
          patientId: booking.petId,
          patientName: booking.petName,
          petParent: booking.petParent,
          serviceId: null,
          serviceName: booking.serviceName,
          appointmentTime: `${booking.date}T${convertTo24Hour(booking.time)}:00.000Z`,
          status: mapBookingStatus(booking.status),
          notes: booking.notes || '',
          symptoms: booking.symptoms || '',
          isEmergency: booking.isEmergency || false,
          price: booking.price || 0,
          duration: booking.duration || '30 minutes',
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt || booking.createdAt,
          originalBookingId: booking._id,
          orphaned: true
        })),
        emergencyServices: false,
        surgicalServices: false,
        diagnosticServices: true,
        vaccinationServices: true,
        dentalServices: false,
        specialties: ['General Practice'],
        labServices: false,
        xrayServices: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('vets').insertOne(orphanedVetDoc);
      console.log(`Created general vet document for ${orphanedBookings.length} orphaned appointments`);
      appointmentsMigrated += orphanedBookings.length;
    }
    
    // Step 5: Backup and archive old vet_bookings collection
    console.log('\n=== Backing up vet_bookings collection ===');
    
    // Create backup collection
    const backupCollectionName = `vet_bookings_backup_${Date.now()}`;
    await db.collection(backupCollectionName).insertMany(vetBookings);
    console.log(`Created backup collection: ${backupCollectionName}`);
    
    // Optional: Remove old vet_bookings collection (commented out for safety)
    // await db.collection('vet_bookings').drop();
    // console.log('Dropped original vet_bookings collection');
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total vet bookings processed: ${vetBookings.length}`);
    console.log(`Vets processed/created: ${vetsProcessed + (orphanedBookings.length > 0 ? 1 : 0)}`);
    console.log(`Total appointments migrated: ${appointmentsMigrated}`);
    console.log(`Backup collection created: ${backupCollectionName}`);
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return '09:00';
  
  try {
    const time = time12h.replace(/\s/g, '');
    const [timeStr, period] = time.split(/([AaPp][Mm])/);
    let [hours, minutes] = timeStr.split(':');
    
    hours = parseInt(hours);
    minutes = minutes || '00';
    
    if (period && period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period && period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  } catch (error) {
    console.error('Error converting time:', time12h, error);
    return '09:00';
  }
}

// Helper function to map booking status to appointment status
function mapBookingStatus(status) {
  const statusMap = {
    'scheduled': 'confirmed',
    'pending': 'confirmed',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  
  return statusMap[status] || 'confirmed';
}

// Run migration if called directly
if (require.main === module) {
  migrateToEmbeddedAppointments().catch(console.error);
}

module.exports = { migrateToEmbeddedAppointments };
