export interface Appointment {
  appointmentId: string;
  vetId: string;
  vetName: string;
  serviceId: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
  notes: string;
  symptoms: string;
  isEmergency: boolean;
  price: number;
  duration: string;
  diagnosis?: string;
  followUpRequired?: boolean;
  prescription?: {
    instructions: string;
  };
  treatment?: string;
  documents?: Array<{
    type: string;
    url: string;
    uploadedAt: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  type: string;
  breed: string;
  behavior?: string;
  allergies: string;
  medicalDocuments: string[];
  appointments?: Appointment[];
  petOwnerId: string;
  createdAt: string;
}
