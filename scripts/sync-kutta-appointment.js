const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'whiskerBond';

async function syncKuttaAppointment() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    console.log('\n=== Syncing Kutta\'s Completed Appointment ===\n');
    
    // Find the kutta pet
    const kuttaPet = await db.collection('allpets').findOne({
      name: { $regex: /kutta/i }
    });
    
    if (!kuttaPet) {
      console.log('Kutta pet not found');
      return;
    }
    
    console.log(`Found pet: ${kuttaPet.name} (ID: ${kuttaPet._id})`);
    
    // Find the vet with the completed appointment for kutta
    const vetWithAppointment = await db.collection('vets').findOne({
      'appointments': {
        $elemMatch: {
          patientId: kuttaPet._id,
          status: 'completed'
        }
      }
    });
    
    if (!vetWithAppointment) {
      console.log('No completed appointment found for kutta in vets collection');
      return;
    }
    
    console.log(`Found vet: ${vetWithAppointment.name}`);
    
    // Extract the completed appointment for kutta
    const completedAppointment = vetWithAppointment.appointments.find(apt => 
      apt.patientId.toString() === kuttaPet._id.toString() &&
      apt.status === 'completed'
    );
    
    if (!completedAppointment) {
      console.log('No completed appointment found');
      return;
    }
    
    console.log(`Found completed appointment: ${completedAppointment.serviceName}`);
    console.log(`Appointment ID: ${completedAppointment.appointmentId}`);
    console.log(`Status: ${completedAppointment.status}`);
    console.log(`Diagnosis: ${completedAppointment.diagnosis || 'None'}`);
    console.log(`Treatment: ${completedAppointment.treatment || 'None'}`);
    
    // Create the appointment data for allpets collection
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
    
    console.log('\nAppointment data to sync:');
    console.log(JSON.stringify(appointmentData, null, 2));
    
    // Check if appointment already exists in pet's record
    const existingPetRecord = await db.collection('allpets').findOne({
      _id: kuttaPet._id,
      'appointments.appointmentId': completedAppointment.appointmentId.toString()
    });
    
    if (existingPetRecord) {
      console.log('\nAppointment already exists in pet record, updating...');
      
      // Update existing appointment
      const updateResult = await db.collection('allpets').updateOne(
        { 
          _id: kuttaPet._id,
          'appointments.appointmentId': completedAppointment.appointmentId.toString()
        },
        { 
          $set: { 
            'appointments.$': appointmentData,
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} appointment record`);
    } else {
      console.log('\nAdding new appointment to pet record...');
      
      // Add new appointment
      const addResult = await db.collection('allpets').updateOne(
        { _id: kuttaPet._id },
        { 
          $push: { appointments: appointmentData },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
      
      console.log(`Added appointment to pet record (matched: ${addResult.matchedCount}, modified: ${addResult.modifiedCount})`);
    }
    
    // Verify the sync
    const updatedPet = await db.collection('allpets').findOne({ _id: kuttaPet._id });
    console.log(`\nVerification: Pet now has ${updatedPet.appointments?.length || 0} appointments`);
    
    if (updatedPet.appointments && updatedPet.appointments.length > 0) {
      console.log('Appointments in pet record:');
      updatedPet.appointments.forEach((apt, index) => {
        console.log(`  ${index + 1}. ${apt.serviceName} - ${apt.status} (${apt.appointmentId})`);
      });
    }
    
    console.log('\n✅ Kutta\'s appointment sync completed successfully!');
    
  } catch (error) {
    console.error('Error syncing kutta appointment:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  syncKuttaAppointment().catch(console.error);
}

module.exports = { syncKuttaAppointment };
