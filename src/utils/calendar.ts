export function generateGoogleCalendarUrl(params: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  durationMinutes: number;
}): string {
  const { title, description, location, startDate, timeSlot, durationMinutes } = params;
  
  // Parse time
  const [time, modifier] = timeSlot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = startDate.split('-').map(Number);
  
  const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const datesParam = `${formatGCalDate(startDateTime)}/${formatGCalDate(endDateTime)}`;
  
  const encodedTitle = encodeURIComponent(title);
  const encodedDetails = encodeURIComponent(description);
  const encodedLocation = encodeURIComponent(location);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${datesParam}&details=${encodedDetails}&location=${encodedLocation}&sf=true&output=xml`;
}

export function downloadIcsFile(params: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  timeSlot: string;
  durationMinutes: number;
  filename?: string;
}): void {
  const { title, description, location, startDate, timeSlot, durationMinutes, filename = 'physiotherapy-appointment.ics' } = params;
  
  const [time, modifier] = timeSlot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = startDate.split('-').map(Number);
  
  const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apex Physiotherapy Clinic//Appointment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:apt-${Date.now()}@apexphysioclinic.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDateTime)}`,
    `DTEND:${formatIcsDate(endDateTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Physiotherapy Appointment Tomorrow',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Physiotherapy Appointment in 2 Hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
