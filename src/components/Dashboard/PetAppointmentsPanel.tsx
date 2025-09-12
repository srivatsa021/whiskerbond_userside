import React, { useMemo, useState } from 'react';
import { Appointment } from '../../types/pets';
import { CalendarIcon, CheckCircleIcon, ChevronDown, ChevronRight, ClockIcon, FileTextIcon, X as CloseIcon, XCircleIcon } from 'lucide-react';

interface PetAppointmentsPanelProps {
  appointments: Appointment[];
  onClose: () => void;
}

const isMedicalAppointment = (serviceName: string): boolean => {
  const s = serviceName.toLowerCase();
  return (
    s.includes('medical') ||
    s.includes('vet') ||
    s.includes('check') ||
    s.includes('vaccine') ||
    s.includes('vaccin') ||
    s.includes('surg') ||
    s.includes('consult') ||
    s.includes('diagnos') ||
    s.includes('treat') ||
    s.includes('follow')
  );
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

const StatusBadge: React.FC<{ status: string; emergency?: boolean }> = ({ status, emergency }) => {
  const statusLower = status.toLowerCase();
  const color = statusLower === 'completed'
    ? 'text-green-400'
    : statusLower === 'cancelled'
      ? 'text-red-400'
      : 'text-yellow-400';
  const Icon = statusLower === 'completed' ? CheckCircleIcon : statusLower === 'cancelled' ? XCircleIcon : ClockIcon;
  return (
    <div className="flex items-center space-x-2">
      <span className={`flex items-center ${color}`}>
        <Icon size={12} />
        <span className="ml-1 text-xs font-medium capitalize">{statusLower}</span>
      </span>
      {emergency && <span className="text-[10px] bg-red-600 text-white px-1 rounded">Emergency</span>}
    </div>
  );
};

export const PetAppointmentsPanel: React.FC<PetAppointmentsPanelProps> = ({ appointments, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sortedAppointments = useMemo(() => {
    const medical: Appointment[] = [];
    const other: Appointment[] = [];
    for (const a of appointments) {
      (isMedicalAppointment(a.serviceName) ? medical : other).push(a);
    }
    const byTimeDesc = (a: Appointment, b: Appointment) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime();
    medical.sort(byTimeDesc);
    other.sort(byTimeDesc);
    return [...medical, ...other];
  }, [appointments]);

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="absolute inset-0 p-3 select-none">
      <button aria-label="Close" data-no-flip onClick={onClose} className="absolute top-2 left-2 text-gray-400 hover:text-white">
        <CloseIcon size={18} />
      </button>

      <div className="flex items-center justify-center mb-2 mt-1">
        <div className="flex items-center text-sm text-green-400">
          <CalendarIcon size={16} className="mr-2" />
          Appointments
        </div>
      </div>

      <div className="h-[12rem] overflow-y-auto space-y-2 pr-1">
        {sortedAppointments.map((a) => {
          const open = expandedId === a.appointmentId;
          return (
            <div key={a.appointmentId} className="bg-gray-800 rounded-md border border-gray-600">
              <button onClick={() => toggle(a.appointmentId)} className="w-full p-3 flex items-center justify-between">
                <div className="min-w-0 text-left">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={a.status} emergency={a.isEmergency} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(a.appointmentTime)} {formatTime(a.appointmentTime)}</span>
                  </div>
                  <p className="text-xs text-white truncate mt-1">{a.serviceName}</p>
                </div>
                {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>
              {open && (
                <div className="px-3 pb-3 border-t border-gray-700 text-xs">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <p className="text-white">{a.duration}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Price:</span>
                      <p className="text-green-400">${a.price}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Follow-up:</span>
                      <p className="text-white">{a.followUpRequired ? 'Required' : 'Not needed'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Vet:</span>
                      <p className="text-white truncate">{a.vetName}</p>
                    </div>
                  </div>
                  {a.notes && (
                    <div className="mt-2">
                      <span className="text-gray-400">Notes:</span>
                      <p className="text-white mt-1">{a.notes}</p>
                    </div>
                  )}
                  {a.diagnosis && (
                    <div className="mt-2">
                      <span className="text-gray-400">Diagnosis:</span>
                      <p className="text-white mt-1">{a.diagnosis}</p>
                    </div>
                  )}
                  {a.treatment && (
                    <div className="mt-2">
                      <span className="text-gray-400">Treatment:</span>
                      <p className="text-white mt-1">{a.treatment}</p>
                    </div>
                  )}
                  {a.documents && a.documents.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-400">Documents:</span>
                      <div className="mt-1 space-y-1">
                        {a.documents.map((doc) => (
                          <div key={doc._id} className="flex items-center justify-between">
                            <span className="text-xs text-blue-400 capitalize flex items-center"><FileTextIcon size={12} className="mr-1" />{doc.type}</span>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">View</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {sortedAppointments.length === 0 && (
          <div className="text-center text-sm text-gray-400">No appointments found</div>
        )}
      </div>
    </div>
  );
};

export default PetAppointmentsPanel;
