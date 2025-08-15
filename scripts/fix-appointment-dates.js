const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'whiskerBond';

async function fixAppointmentDates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    console.log('\n=== Fixing Invalid Appointment Dates ===\n');
    
    // Find all vets with appointments
    const vetsWithAppointments = await db.collection('vets').find({
      'appointments.0': { $exists: true }
    }).toArray();
    
    console.log(`Found ${vetsWithAppointments.length} vets with appointments`);
    
    let totalFixed = 0;
    let totalInvalid = 0;
    
    for (const vet of vetsWithAppointments) {
      console.log(`\nChecking appointments for: ${vet.name}`);
      
      if (!vet.appointments || !Array.isArray(vet.appointments)) {
        continue;
      }
      
      let updatedAppointments = [];
      let hasChanges = false;
      
      for (const appointment of vet.appointments) {
        let fixedAppointment = { ...appointment };
        let isInvalid = false;
        
        // Check if appointmentTime is valid
        if (appointment.appointmentTime) {
          const date = new Date(appointment.appointmentTime);
          if (isNaN(date.getTime())) {
            console.log(`  - Invalid appointmentTime: ${appointment.appointmentTime}`);
            isInvalid = true;
            totalInvalid++;
          }
        }
        
        // If appointmentTime is invalid but we have date and time fields
        if (isInvalid && appointment.date && appointment.time) {
          try {
            const timeIn24Hour = convertTo24Hour(appointment.time);
            const newAppointmentTime = `${appointment.date}T${timeIn24Hour}:00.000Z`;
            const testDate = new Date(newAppointmentTime);
            
            if (!isNaN(testDate.getTime())) {
              fixedAppointment.appointmentTime = newAppointmentTime;
              hasChanges = true;
              totalFixed++;
              console.log(`  - Fixed: ${appointment.date} ${appointment.time} → ${newAppointmentTime}`);
            } else {
              console.log(`  - Could not fix: ${appointment.date} ${appointment.time}`);
            }
          } catch (error) {
            console.log(`  - Error fixing: ${error.message}`);
          }
        }
        
        // If still invalid, use a default time
        if (isInvalid && (!fixedAppointment.appointmentTime || isNaN(new Date(fixedAppointment.appointmentTime).getTime()))) {
          const defaultDate = new Date();
          defaultDate.setHours(9, 0, 0, 0); // Set to 9 AM today
          fixedAppointment.appointmentTime = defaultDate.toISOString();
          hasChanges = true;
          totalFixed++;
          console.log(`  - Set default time: ${fixedAppointment.appointmentTime}`);
        }
        
        // Ensure appointmentId exists
        if (!fixedAppointment.appointmentId) {
          fixedAppointment.appointmentId = new ObjectId();
          hasChanges = true;
          console.log(`  - Added missing appointmentId`);
        }
        
        // Ensure required fields exist
        if (!fixedAppointment.status) {
          fixedAppointment.status = 'confirmed';
          hasChanges = true;
        }
        
        if (!fixedAppointment.notes) {
          fixedAppointment.notes = '';
          hasChanges = true;
        }
        
        if (!fixedAppointment.symptoms) {
          fixedAppointment.symptoms = '';
          hasChanges = true;
        }
        
        if (fixedAppointment.isEmergency === undefined) {
          fixedAppointment.isEmergency = false;
          hasChanges = true;
        }
        
        updatedAppointments.push(fixedAppointment);
      }
      
      // Update the vet document if there are changes
      if (hasChanges) {
        await db.collection('vets').updateOne(
          { _id: vet._id },
          { 
            $set: { 
              appointments: updatedAppointments,
              updatedAt: new Date().toISOString()
            }
          }
        );
        console.log(`  - Updated vet document with ${updatedAppointments.length} appointments`);
      }
    }
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Total invalid dates found: ${totalInvalid}`);
    console.log(`Total dates fixed: ${totalFixed}`);
    console.log('✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('Error fixing appointment dates:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h || typeof time12h !== 'string') {
    return '09:00';
  }
  
  try {
    const cleanTime = time12h.trim().replace(/\s+/g, ' ');
    
    const ampmMatch = cleanTime.match(/^(\d{1,2}):?(\d{2})?\s*([AaPp][Mm])$/);
    if (ampmMatch) {
      const [, hours, minutes, periodPart] = ampmMatch;
      let hour = parseInt(hours);
      const min = minutes || '00';
      
      if (periodPart.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (periodPart.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${min}`;
    }
    
    return '09:00';
  } catch (error) {
    return '09:00';
  }
}

// Run if called directly
if (require.main === module) {
  fixAppointmentDates().catch(console.error);
}

module.exports = { fixAppointmentDates };
