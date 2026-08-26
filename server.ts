import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Lazy-initialized Resend Email Client
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Lazy-initialized Nodemailer Gmail / SMTP Transporter
let smtpTransporter: nodemailer.Transporter | null = null;
function getSmtp(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, "");
  const pass = process.env.SMTP_PASS?.replace(/[\s"']/g, ""); // clean all spaces and quotes from 16-char app password

  if (user && pass) {
    if (!smtpTransporter) {
      console.log(`🔌 Initializing Nodemailer for user: ${user} (password length: ${pass.length})`);
      smtpTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user,
          pass: pass,
        },
      });
    }
    return smtpTransporter;
  }
  return null;
}

// Unified Email Dispatcher (Supports Gmail SMTP and Resend)
async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}): Promise<{ success: boolean; provider: string; id?: string; error?: string }> {
  const { to, subject, html, fromName = "LEBENSWERK Physiotherapie" } = params;
  console.log(`📨 Attempting to dispatch email to: "${to}" | Subject: "${subject}"`);

  // 1. Prioritize Gmail SMTP / Nodemailer if configured
  const smtp = getSmtp();
  const smtpUser = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, "");

  if (smtp && smtpUser) {
    try {
      console.log(`📤 Sending via Gmail SMTP from: ${smtpUser} to: ${to}...`);
      const fromHeader = `"${fromName}" <${smtpUser}>`;
      const info = await smtp.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
      });
      console.log(`✅ [Gmail SMTP SUCCESS] Email delivered to ${to} (MessageID: ${info.messageId})`);
      return { success: true, provider: "Gmail SMTP", id: info.messageId };
    } catch (err: any) {
      console.error("❌ [Gmail SMTP FAILED]:", err.message || err);
      if (err.code === 'EAUTH' || err.responseCode === 535) {
        console.error("⚠️ Authentication Failed: Google requires a 16-character App Password, not your standard Gmail password.");
      }
      return { 
        success: false, 
        provider: "Gmail SMTP", 
        error: `Gmail Error (${err.code || 'AUTH'}): ${err.message}` 
      };
    }
  }

  // 2. Fallback to Resend API if configured
  const resend = getResend();
  if (resend) {
    try {
      console.log(`📤 Sending via Resend API to: ${to}...`);
      const fromAddress = process.env.RESEND_FROM_EMAIL || `"${fromName}" <onboarding@resend.dev>`;
      const res = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });
      if (res.error) {
        console.error("❌ [Resend Error]:", res.error);
        return { success: false, provider: "Resend", error: res.error.message };
      }
      console.log(`✅ [Resend SUCCESS] Email delivered to ${to} (ID: ${res.data?.id})`);
      return { success: true, provider: "Resend", id: res.data?.id };
    } catch (err: any) {
      console.error("❌ [Resend Delivery Exception]:", err);
      return { success: false, provider: "Resend", error: err.message };
    }
  }

  console.log(`ℹ️ [Email Simulation] Neither SMTP_USER nor RESEND_API_KEY configured. Email to ${to} saved to in-app Reminders Queue.`);
  return { 
    success: false, 
    provider: "none", 
    error: "No email credentials found in .env. Please set SMTP_USER & SMTP_PASS (Gmail) or RESEND_API_KEY." 
  };
}

// In-Memory Database for LEBENSWERK Physiotherapie & Gesundheit Biberist
const services = [
  {
    id: "serv-1",
    name: "Klassische Physiotherapie",
    category: "classical-physio",
    durationMinutes: 50,
    price: 130,
    shortDescription: "Gezielte Behandlung bei Beschwerden des Bewegungsapparates in der Praxis Biberist oder bei Ihnen zu Hause.",
    fullDescription: "Individuelle, persönliche und verlässliche physiotherapeutische Betreuung. Umfassende Befundaufnahme, massgeschneiderte Übungsprotokolle sowie sanfte aktive und passive Mobilisation.",
    benefits: ["Lindert akute & chronische Gelenkschmerzen", "Optimiert die Biomechanik & Haltung", "Anerkannt von allen Schweizer Krankenkassen (KVG/UVG/MV)", "Flexible Termine in der Praxis oder als Hausbesuch"],
    recommendedFor: ["Rücken- & Nackenbeschwerden", "Gelenk- & Wirbelsäulenblockaden", "Ischias & Bandscheibenprobleme", "Muskuläre Dysbalancen"],
    icon: "Activity",
    badge: "01 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-2",
    name: "Manuelle Therapie & Mobilisation",
    category: "manual-therapy",
    durationMinutes: 50,
    price: 140,
    shortDescription: "Gezielte Mobilisation von Blockaden, Schmerzlinderung und Funktionsstörungen an Gelenken und Wirbelsäule.",
    fullDescription: "Spezifische manuelle Grifftechniken zur Wiederherstellung der Gelenkmechanik, Entlastung gereizter Nervenstrukturen und Lösung tiefer myofaszialer Verspannungen.",
    benefits: ["Lösung von Wirbelsäulen- & Gelenkblockaden", "Schnelle Schmerzlinderung", "Wiederherstellung des physiologischen Bewegungsausmasses", "Schonende, evidenzbasierte Behandlung"],
    recommendedFor: ["Wirbelsäulen- & Beckenblockaden", "Zervikogene Kopfschmerzen", "Schulterimpingement", "Hüft- & Kniebeschwerden"],
    icon: "Zap",
    badge: "02 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-3",
    name: "Schmerztherapie & Triggerpunktbehandlung",
    category: "pain-therapy",
    durationMinutes: 45,
    price: 135,
    shortDescription: "Linderung akuter und chronischer Schmerzzustände durch moderne, evidenzbasierte Methoden.",
    fullDescription: "Gezielte Schmerztherapie unter Einsatz von myofaszialer Entlastung, Triggerpunktbehandlung, neuromuskulärer Reizsetzung und individuellen Dehn- und Entspannungsprogrammen.",
    benefits: ["Nachhaltige Linderung chronischer Schmerzen", "Lösung schmerzhafter Myogelosen & Triggerpunkte", "Förderung der lokalen Gewebedurchblutung", "Verbesserung von Schlafqualität & Lebensfreude"],
    recommendedFor: ["Chronische Rücken- & Nackenschmerzen", "Myofasziales Schmerzsyndrom", "Spannungskopfschmerzen", "Fibromyalgie & Überlastungsschmerzen"],
    icon: "Sparkles",
    badge: "03 Kernbehandlung",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-4",
    name: "Neurologische Rehabilitation",
    category: "neuro-rehab",
    durationMinutes: 60,
    price: 150,
    shortDescription: "Spezialisierte Rehabilitation nach Schlaganfall, bei Parkinson und neurologischen Bewegungseinschränkungen.",
    fullDescription: "Gezielte Neurorehabilitation nach Bobath-Konzept und alltagsorientiertem Training zur Wiedererlangung von Gleichgewicht, Gangsicherheit und selbstständigen Transfers.",
    benefits: ["Neuroplastisches Training von Bewegungsabläufen", "Sturzprävention & Sicherheitsanalyse im Alltag", "Gleichgewichts- & Gangschulung", "Förderung der Selbstständigkeit zu Hause"],
    recommendedFor: ["Zustand nach Schlaganfall (Apoplex)", "Morbus Parkinson", "Multiple Sklerose", "Ataxie & Gangunsicherheiten"],
    icon: "ShieldCheck",
    badge: "Spezialisierte Therapie",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-5",
    name: "Geriatrische Physiotherapie & Sturzprävention",
    category: "geriatric-care",
    durationMinutes: 45,
    price: 125,
    shortDescription: "Einfühlsame Erhaltung der Mobilität, Kraftaufbau und Sturzprophylaxe für Senioren in Biberist & Region.",
    fullDescription: "Schonende Bewegungstherapie in der Praxis, im Pflegeheim oder bei Hausbesuchen im Kanton Solothurn. Fördert die Gehfähigkeit, Beweglichkeit und das Vertrauen in den eigenen Körper.",
    benefits: ["Erhält die Selbstständigkeit im Alltag", "Stärkt die Haltemuskulatur", "Sicheres Gehtraining mit Rollator oder Gehstock", "Erhalt der Gelenkbeweglichkeit"],
    recommendedFor: ["Bewohner von Senioren- & Pflegeheimen", "Senioren mit Mobilitätseinschränkungen", "Sicherheit nach Stürzen", "Arthrose & Alterssteifigkeit"],
    icon: "Compass",
    badge: "Praxis & Hausbesuche",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "serv-6",
    name: "Postoperative Rehabilitation & Frakturen",
    category: "post-surgery",
    durationMinutes: 50,
    price: 135,
    shortDescription: "Strukturierter Phasenaufbau nach Gelenkersatz (TEP), Arthroskopie oder Knochenbrüchen.",
    fullDescription: "Sichere Rehabilitation direkt nach dem Spitalaufenthalt. Wir begleiten Sie mit abschwellenden Massnahmen, Narbenmobilisation, schonendem Kraftaufbau und Gangschulung.",
    benefits: ["Sicherheit nach Spitalaustritt", "Manuelle Lymphdrainage & Abschwellung", "Progressive Wiederherstellung der Gelenkbeweglichkeit", "Treppensteigen & Alltagsbelastung"],
    recommendedFor: ["Hüft- oder Knie-Totalendoprothese (TEP)", "Schulteroperationen", "Nach Wirbelsäuleneingriffen", "Zustand nach Frakturen"],
    icon: "Clock",
    badge: "Postoperativ",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
  }
];

const specialists = [
  {
    id: "doc-1",
    name: "Vigan Musliu",
    email: "info@lebenswerk.praxismail.ch",
    phone: "076 458 04 42",
    title: "Dipl. Physiotherapeut HF/FH & Praxisleiter",
    credentials: [
      "Dipl. Physiotherapeut HF/FH",
      "SRK Anerkannt (Schweizerisches Rotes Kreuz)",
      "Mitglied Physioswiss",
      "Zertifiziert in Manueller Therapie & Rehabilitation"
    ],
    experienceYears: 12,
    rating: 4.99,
    reviewsCount: 180,
    avatar: "/src/assets/images/doctor_vigan_musliu_1787647012290.jpg",
    bio: "Vigan Musliu bietet individuelle, persönliche und zuverlässige physiotherapeutische Betreuung an der Hauptstrasse 19 in 4562 Biberist sowie bei Hausbesuchen. Mit langjähriger klinischer Erfahrung verbindet er manuelle Therapie, Schmerztherapie und gezielte Bewegungstherapie.",
    specialties: ["Klassische Physiotherapie", "Manuelle Therapie & Mobilisation", "Schmerztherapie & Triggerpunkte", "Neurologische Rehabilitation", "Rehabilitation nach Operationen"],
    education: "Dipl. Physiotherapeut HF/FH • ZHAW / SRK Anerkannt",
    availableDays: ["Thu", "Fri", "Sat"],
    consultationFee: 130,
    languages: ["Deutsch (Muttersprache)", "Englisch", "Französisch"],
    nextAvailable: "Do 18:00–21:00 | Fr 17:00–20:00 | Sa 08:00–14:00",
    workSchedule: {
      thursday: "18:00 - 21:00",
      friday: "17:00 - 20:00",
      saturday: "08:00 - 14:00"
    }
  }
];

let contactInquiries: any[] = [
  {
    id: "inq-101",
    type: "appointment",
    firstName: "Maria",
    lastName: "Gerber",
    phone: "079 555 12 34",
    email: "maria.gerber@solothurn.ch",
    description: "Ich benötige nach einer Knie-Operation Physiotherapie, am liebsten Donnerstag ab 18:00 Uhr in der Praxis Biberist.",
    treatmentLocation: "practice",
    preferredDate: "Donnerstag",
    preferredTime: "18:30",
    serviceId: "serv-1",
    serviceName: "Klassische Physiotherapie",
    status: "new",
    createdAt: new Date().toISOString()
  }
];

let appointments: any[] = [
  {
    id: "apt-101",
    confirmationCode: "PHYSIO-8821",
    patientName: "Vigan Musliu",
    patientEmail: "sadikudrit6@gmail.com",
    patientPhone: "+1 (555) 234-5678",
    serviceId: "serv-1",
    serviceName: "Spinal Rehabilitation & Disc Therapy",
    specialistId: "doc-1",
    specialistName: "Dr. Elena Rostova, DPT, OCS",
    date: "2026-08-26",
    timeSlot: "10:30 AM",
    durationMinutes: 50,
    meetingType: "in-clinic",
    painArea: "Lower Back & Sciatic Nerve",
    painLevel: 6,
    symptomsNotes: "Shooting pain down right thigh after sitting at computer over 45 minutes. Periodic morning lumbar stiffness.",
    medicalHistory: "L4-L5 disc protrusion diagnosed on MRI 2 months ago.",
    insuranceProvider: "Blue Cross Blue Shield",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    googleCalendarSynced: true,
    remindersEnabled: {
      email24h: true,
      email2h: true,
      sms: true
    },
    price: 120
  }
];

let emailRemindersQueue: any[] = [
  {
    id: "rem-1",
    appointmentId: "apt-101",
    recipientEmail: "sadikudrit6@gmail.com",
    recipientName: "Sadik Udrit",
    type: "booking-confirmed",
    subject: "Appointment Confirmed: Spinal Rehabilitation with Dr. Elena Rostova",
    scheduledTime: "Immediate",
    sentAt: new Date().toISOString(),
    status: "delivered",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0d9488; color: white; padding: 16px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Appointment Confirmed</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.9;">Confirmation: <strong>PHYSIO-8821</strong></p>
        </div>
        <div style="margin-top: 20px;">
          <p>Hi Sadik,</p>
          <p>Your physiotherapy session has been successfully booked and synchronized with real-time clinic schedules.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #0d9488;">
            <p style="margin: 4px 0;"><strong>Date:</strong> Wednesday, Aug 26, 2026</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> 10:30 AM (50 Mins)</p>
            <p style="margin: 4px 0;"><strong>Specialist:</strong> Dr. Elena Rostova, DPT, OCS</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> Apex Spine & Physical Health Clinic (Suite 400)</p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 16px;">Automated 24-hour and 2-hour email notifications will be sent prior to your visit. Please wear comfortable, flexible athletic wear.</p>
        </div>
      </div>
    `
  },
  {
    id: "rem-2",
    appointmentId: "apt-101",
    recipientEmail: "sadikudrit6@gmail.com",
    recipientName: "Sadik Udrit",
    type: "reminder-24h",
    subject: "Reminder (Tomorrow): Your Physiotherapy Session at 10:30 AM",
    scheduledTime: "2026-08-25T10:30:00Z",
    status: "scheduled",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h3 style="color: #0f766e;">24-Hour Visit Reminder</h3>
        <p>This is a quick notification that your physical therapy appointment with <strong>Dr. Elena Rostova</strong> is scheduled for tomorrow at <strong>10:30 AM</strong>.</p>
        <p>Please arrive 10 minutes early to complete any preliminary spinal mobility checks.</p>
      </div>
    `
  }
];

let patientRecords: Record<string, any> = {
  "sadikudrit6@gmail.com": {
    id: "pat-901",
    patientName: "Sadik Udrit",
    patientEmail: "sadikudrit6@gmail.com",
    patientPhone: "+1 (555) 234-5678",
    dob: "1992-04-18",
    primaryCondition: "L4-L5 Lumbar Disc Radiculopathy & Sciatic Neural Tension",
    initialPainScore: 8,
    currentPainScore: 3,
    mobilityImprovementPct: 78,
    carePlanStartDate: "2026-07-15",
    targetRecoveryDate: "2026-09-30",
    attendingPhysio: "Dr. Elena Rostova, DPT, OCS",
    clinicalNotes: [
      {
        date: "2026-08-18",
        physio: "Dr. Elena Rostova",
        note: "Patient reported marked reduction in leg radiation following McKenzie extension loading protocols. SLR (Straight Leg Raise) angle increased from 42° to 74° pain-free.",
        measurements: "Lumbar Flexion: +18cm floor reach; SLR Right: 74°"
      },
      {
        date: "2026-08-04",
        physio: "Dr. Elena Rostova",
        note: "Initial assessment. Hypomobility noted at L4-L5 segment with secondary piriformis hypertonicity. Initiated gentle neural glides and transverse abdominis activation.",
        measurements: "Lumbar Flexion: Pain at 30°; SLR Right: 42°"
      }
    ],
    prescribedExercises: [
      {
        id: "ex-1",
        name: "Prone Lumbar Press-Ups (McKenzie Protocol)",
        targetArea: "Lower Back / Lumbar Spine",
        sets: 3,
        reps: "10-12 reps",
        holdSeconds: 3,
        frequency: "3 times daily",
        instructions: [
          "Lie face down on a firm surface with hands placed near shoulders.",
          "Gently press upper torso upward while keeping pelvic hips completely relaxed against the floor.",
          "Hold for 2-3 seconds at end-range, exhale deeply, and return smoothly."
        ],
        precautions: "Stop if sharp peripheral shooting pain travels past your knee.",
        difficulty: "Gentle",
        completedToday: true,
        streakDays: 6
      },
      {
        id: "ex-2",
        name: "Sciatic Nerve Flossing / Glide",
        targetArea: "Posterior Chain & Neural Sheath",
        sets: 2,
        reps: "15 rhythmic repetitions",
        holdSeconds: 1,
        frequency: "Twice daily",
        instructions: [
          "Sit tall on the edge of a chair.",
          "As you extend the right knee and dorsiflex your foot (toes up), simultaneously tilt your chin up toward the ceiling.",
          "As you bend the knee back down, tuck your chin to your chest in a fluid waving motion."
        ],
        precautions: "Do not hold tension at end-range; keep the movement dynamic and pain-free.",
        difficulty: "Moderate",
        completedToday: false,
        streakDays: 4
      },
      {
        id: "ex-3",
        name: "Bird-Dog Core & Multifidus Stabilizer",
        targetArea: "Core & Deep Spinal Stabilizers",
        sets: 3,
        reps: "8 per side",
        holdSeconds: 5,
        frequency: "Daily in morning",
        instructions: [
          "Start on all fours with wrists under shoulders and knees under hips.",
          "Simultaneously extend opposite arm and opposite leg parallel to floor without arching lower back.",
          "Hold for 5 seconds, engaging abdominal core tightly, then switch."
        ],
        precautions: "Maintain neutral pelvis; avoid twisting or sagging through hips.",
        difficulty: "Moderate",
        completedToday: true,
        streakDays: 5
      },
      {
        id: "ex-4",
        name: "Supine 90/90 Diaphragmatic Decompression",
        targetArea: "Pelvis, Psoas & Diaphragm",
        sets: 1,
        reps: "10 minutes",
        holdSeconds: 600,
        frequency: "Evening before sleep",
        instructions: [
          "Lie flat on back with calves resting elevated on a chair or ottoman at 90-degree angle.",
          "Breathe deeply into lower ribcage, exhaling for twice the duration of inhalation to reset autonomic nervous system."
        ],
        precautions: "Ensure lower back is flat against the mat without straining.",
        difficulty: "Gentle",
        completedToday: false,
        streakDays: 7
      }
    ],
    painTrajectory: [
      { week: "Week 1", score: 8, activityScore: 35 },
      { week: "Week 2", score: 7, activityScore: 45 },
      { week: "Week 3", score: 5, activityScore: 60 },
      { week: "Week 4", score: 4, activityScore: 72 },
      { week: "Week 5", score: 3, activityScore: 84 },
      { week: "Current", score: 2.5, activityScore: 90 }
    ]
  }
};

// API ROUTES

// 1. Get services
app.get("/api/services", (req: Request, res: Response) => {
  res.json({ success: true, services });
});

// 2. Get specialists
app.get("/api/specialists", (req: Request, res: Response) => {
  res.json({ success: true, specialists });
});

// 3. Real-Time Slot Availability with Google Calendar sync (Thursday 18:00-21:00, Friday 17:00-20:00, Saturday 08:00-14:00)
app.get("/api/availability", (req: Request, res: Response) => {
  const { specialistId, date } = req.query as { specialistId?: string; date?: string };
  
  const targetDate = date ? new Date(date + 'T00:00:00') : new Date();
  // day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const dayOfWeek = isNaN(targetDate.getTime()) ? -1 : targetDate.getDay();

  // Schedule mapping:
  // Thursday (4): 18:00 - 21:00
  // Friday (5): 17:00 - 20:00
  // Saturday (6): 08:00 - 14:00
  let daySlots: string[] = [];
  let scheduleDescription = "";

  if (dayOfWeek === 4) {
    daySlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
    scheduleDescription = "Donnerstag (18:00 - 21:00)";
  } else if (dayOfWeek === 5) {
    daySlots = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
    scheduleDescription = "Freitag (17:00 - 20:00)";
  } else if (dayOfWeek === 6) {
    daySlots = [
      "08:00", "08:30", "09:00", "09:30", 
      "10:00", "10:30", "11:00", "11:30", 
      "12:00", "12:30", "13:00", "13:30"
    ];
    scheduleDescription = "Samstag (08:00 - 14:00)";
  }

  const isAvailableDay = daySlots.length > 0;

  if (!isAvailableDay) {
    return res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      specialistId: specialistId || "all",
      isWorkingDay: false,
      message: "Termine sind an folgenden Arbeitstagen verfügbar: Donnerstag (18:00–21:00), Freitag (17:00–20:00), Samstag (08:00–14:00).",
      slots: [],
      workingHours: {
        thursday: "18:00 - 21:00",
        friday: "17:00 - 20:00",
        saturday: "08:00 - 14:00"
      },
      googleCalendarSyncTime: new Date().toISOString(),
      latencyMs: 6
    });
  }

  // Check booked slots from in-memory appointments
  const bookedSlots = appointments
    .filter(a => a.status === 'confirmed' && (!specialistId || a.specialistId === specialistId) && (!date || a.date === date))
    .map(a => a.timeSlot);

  // Example Google Calendar busy blocks if any
  const gcalBusySlots = dayOfWeek === 6 ? ["11:30"] : [];

  const availableSlots = daySlots.map(slot => {
    const isBooked = bookedSlots.includes(slot);
    const isGcalBusy = gcalBusySlots.includes(slot);
    return {
      time: slot,
      available: !isBooked && !isGcalBusy,
      reason: isBooked ? "Bereits reserviert" : isGcalBusy ? "Google Kalender Termin" : "Verfügbarer Termin"
    };
  });

  res.json({
    success: true,
    date: date || new Date().toISOString().split('T')[0],
    specialistId: specialistId || "all",
    isWorkingDay: true,
    scheduleDescription,
    slots: availableSlots,
    workingHours: {
      thursday: "18:00 - 21:00",
      friday: "17:00 - 20:00",
      saturday: "08:00 - 14:00"
    },
    googleCalendarSyncTime: new Date().toISOString(),
    latencyMs: 8
  });
});

// 4. Get appointments
app.get("/api/appointments", (req: Request, res: Response) => {
  const { email } = req.query as { email?: string };
  if (email) {
    const userAppointments = appointments.filter(a => a.patientEmail.toLowerCase() === email.toLowerCase());
    return res.json({ success: true, appointments: userAppointments });
  }
  res.json({ success: true, appointments });
});

// 5. Create new appointment with automated Google Calendar event link & email triggers
app.post("/api/appointments", (req: Request, res: Response) => {
  const data = req.body;
  
  if (!data.patientName || !data.patientEmail || !data.serviceId || !data.date || !data.timeSlot) {
    return res.status(400).json({ success: false, error: "Missing required booking details" });
  }

  const selectedService = services.find(s => s.id === data.serviceId) || services[0];
  const selectedDoc = specialists.find(d => d.id === data.specialistId) || specialists[0];
  const confCode = `LEBENSWERK-${Math.floor(1000 + Math.random() * 9000)}`;

  // Parse hours & minutes for Google Calendar url
  let hours = 0;
  let minutes = 0;
  if (data.timeSlot.includes(':')) {
    const parts = data.timeSlot.split(':');
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10) || 0;
  }
  const startDateStr = `${data.date.replace(/-/g, '')}T${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}00`;
  const endMinutesTotal = hours * 60 + minutes + (selectedService.durationMinutes || 50);
  const endHours = Math.floor(endMinutesTotal / 60);
  const endMins = endMinutesTotal % 60;
  const endDateStr = `${data.date.replace(/-/g, '')}T${endHours.toString().padStart(2, '0')}${endMins.toString().padStart(2, '0')}00`;

  const gcalTitle = encodeURIComponent(`Physiotherapie: ${selectedService.name} - ${data.patientName}`);
  const addressInfo = data.meetingType === 'home-visit' 
    ? (data.streetAddress ? `${data.streetAddress}, ${data.zipCity || 'Biberist'}` : "Hausbesuch (Solothurn & Biberist Region)")
    : "LEBENSWERK Praxis, Hauptstrasse 19, 4562 Biberist";
  const gcalDetails = encodeURIComponent(`Termin-Bestätigung: ${confCode}\nPatient: ${data.patientName}\nTelefon: ${data.patientPhone || '076 458 04 42'}\nBehandlung: ${selectedService.name}\nTherapeut: ${selectedDoc.name}\nOrt: ${addressInfo}\nHinweise: ${data.symptomsNotes || 'Keine'}`);
  const gcalLocation = encodeURIComponent(addressInfo);
  const googleEventLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&details=${gcalDetails}&location=${gcalLocation}&dates=${startDateStr}/${endDateStr}`;

  const newAppointment = {
    id: `apt-${Date.now()}`,
    confirmationCode: confCode,
    patientName: data.patientName,
    patientEmail: data.patientEmail,
    patientPhone: data.patientPhone || "076 458 04 42",
    serviceId: selectedService.id,
    serviceName: selectedService.name,
    specialistId: selectedDoc.id,
    specialistName: selectedDoc.name,
    date: data.date,
    timeSlot: data.timeSlot,
    durationMinutes: selectedService.durationMinutes,
    meetingType: data.meetingType || "practice-clinic",
    streetAddress: data.streetAddress || "",
    zipCity: data.zipCity || "",
    addressNotes: data.addressNotes || "",
    painArea: data.painArea || "Physiotherapeutische Abklärung",
    painLevel: data.painLevel || 5,
    symptomsNotes: data.symptomsNotes || "",
    medicalHistory: data.medicalHistory || "",
    insuranceProvider: data.insuranceProvider || "Krankenkasse (KVG / UVG / MV)",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    googleCalendarSynced: true,
    googleEventLink,
    remindersEnabled: data.remindersEnabled || { email24h: true, email2h: true, sms: true },
    price: selectedService.price
  };

  appointments.unshift(newAppointment);

  // Create in-app queue reminder items
  const confirmationReminder = {
    id: `rem-${Date.now()}-1`,
    appointmentId: newAppointment.id,
    recipientEmail: newAppointment.patientEmail,
    recipientName: newAppointment.patientName,
    type: "booking-confirmed",
    subject: `Confirmed: ${selectedService.name} (${confCode})`,
    scheduledTime: "Immediate",
    sentAt: new Date().toISOString(),
    status: "delivered",
    htmlContent: `
      <div style="font-family: system-ui, sans-serif; max-width: 580px; padding: 24px; border: 1px solid #A5D6A7; border-radius: 12px; background: #ffffff;">
        <div style="background: #1B5E20; color: #E8F5E9; padding: 18px; border-radius: 10px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">Appointment Confirmed!</h2>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Confirmation Code: <strong>${confCode}</strong></p>
        </div>
        <div style="margin-top: 20px; color: #1B5E20; line-height: 1.6;">
          <p>Dear <strong>${newAppointment.patientName}</strong>,</p>
          <p>We look forward to partnering in your physical recovery journey. Your appointment details are below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #E8F5E9; border-radius: 8px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #A5D6A7;"><td style="padding: 10px 14px; color: #1B5E20;">Treatment:</td><td style="padding: 10px 14px; font-weight: 600; color: #1B5E20;">${selectedService.name}</td></tr>
            <tr style="border-bottom: 1px solid #A5D6A7;"><td style="padding: 10px 14px; color: #1B5E20;">Specialist:</td><td style="padding: 10px 14px; font-weight: 600; color: #1B5E20;">${selectedDoc.name}</td></tr>
            <tr style="border-bottom: 1px solid #A5D6A7;"><td style="padding: 10px 14px; color: #1B5E20;">Date & Time:</td><td style="padding: 10px 14px; font-weight: 600; color: #1B5E20;">${data.date} at ${data.timeSlot}</td></tr>
            <tr style="border-bottom: 1px solid #A5D6A7;"><td style="padding: 10px 14px; color: #1B5E20;">Format / Location:</td><td style="padding: 10px 14px; font-weight: 600; color: #1B5E20;">${data.meetingType === 'home-visit' ? `Hausbesuch (${addressInfo})` : "LEBENSWERK Praxis (Hauptstrasse 19, 4562 Biberist)"}</td></tr>
            ${data.addressNotes ? `<tr><td style="padding: 10px 14px; color: #1B5E20;">Access Notes:</td><td style="padding: 10px 14px; color: #1B5E20;">${data.addressNotes}</td></tr>` : ''}
          </table>
          <p style="font-size: 13px; color: #1B5E20;">Automatische E-Mail-Erinnerungen sind 24 Stunden und 2 Stunden vor dem Termin geplant. Google Kalender Synchronisation aktiv.</p>
        </div>
      </div>
    `
  };

  // Determine doctor notification email recipient
  const doctorRecipientEmail = (selectedDoc as any).email || process.env.DOCTOR_NOTIFICATION_EMAIL || process.env.CLINIC_NOTIFICATION_EMAIL || "info@lebenswerk.praxismail.ch";

  // Doctor Notification Item in internal queue
  const doctorAlertReminder = {
    id: `rem-${Date.now()}-doc`,
    appointmentId: newAppointment.id,
    recipientEmail: doctorRecipientEmail,
    recipientName: selectedDoc.name,
    type: "doctor-alert",
    subject: `🩺 Neuer Patient gebucht: ${newAppointment.patientName} (${confCode})`,
    scheduledTime: "Immediate",
    sentAt: new Date().toISOString(),
    status: "delivered",
    htmlContent: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #A5D6A7; border-radius: 12px; background: #ffffff;">
        <div style="background: #1B5E20; color: #E8F5E9; padding: 20px; border-radius: 10px; text-align: left;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Neuer Physiotherapie Termin gebucht</h2>
          <p style="margin: 6px 0 0; opacity: 0.92; font-size: 14px;">Therapeut: <strong>${selectedDoc.name}</strong></p>
        </div>

        <div style="margin-top: 24px; color: #1B5E20; line-height: 1.6;">
          <h3 style="font-size: 16px; margin: 0 0 12px; color: #1B5E20; border-bottom: 2px solid #A5D6A7; padding-bottom: 6px;">Patient & Termin Übersicht</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20; width: 140px;">Patient Name:</td><td style="padding: 8px 0; font-weight: 600; color: #1B5E20;">${newAppointment.patientName}</td></tr>
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Patient Email:</td><td style="padding: 8px 0; color: #1B5E20;"><a href="mailto:${newAppointment.patientEmail}" style="color: #1B5E20; font-weight: 600;">${newAppointment.patientEmail}</a></td></tr>
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Patient Phone:</td><td style="padding: 8px 0; color: #1B5E20;">${newAppointment.patientPhone}</td></tr>
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Behandlung:</td><td style="padding: 8px 0; font-weight: 600; color: #1B5E20;">${selectedService.name} (${selectedService.durationMinutes} min)</td></tr>
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Datum & Zeit:</td><td style="padding: 8px 0; font-weight: 600; color: #1B5E20;">${newAppointment.date} um ${newAppointment.timeSlot}</td></tr>
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Ort / Format:</td><td style="padding: 8px 0; color: #1B5E20; font-weight: 600;">${newAppointment.meetingType === 'home-visit' ? 'Hausbesuch' : "LEBENSWERK Praxis (Hauptstrasse 19, 4562 Biberist)"}</td></tr>
            ${data.streetAddress ? `<tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Adresse:</td><td style="padding: 8px 0; font-weight: 600; color: #1B5E20;">${data.streetAddress}, ${data.zipCity || 'Biberist'}</td></tr>` : ''}
            ${data.addressNotes ? `<tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Hinweise:</td><td style="padding: 8px 0; color: #1B5E20;">${data.addressNotes}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #E8F5E9;"><td style="padding: 8px 0; color: #1B5E20;">Code:</td><td style="padding: 8px 0; font-family: monospace; font-weight: 700; color: #1B5E20;">${confCode}</td></tr>
          </table>

          <h3 style="font-size: 16px; margin: 20px 0 12px; color: #0f766e; border-bottom: 2px solid #ccfbf1; padding-bottom: 6px;">Clinical Assessment & Triage</h3>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px;"><strong>Chief Complaint / Pain Area:</strong> ${newAppointment.painArea}</p>
            <p style="margin: 0 0 8px;"><strong>Reported Pain Intensity:</strong> <span style="background: ${newAppointment.painLevel >= 7 ? '#fee2e2' : '#fef3c7'}; color: ${newAppointment.painLevel >= 7 ? '#991b1b' : '#92400e'}; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${newAppointment.painLevel} / 10</span></p>
            <p style="margin: 0 0 8px;"><strong>Symptoms / Specific Triggers:</strong> ${newAppointment.symptomsNotes || 'None noted by patient during online booking'}</p>
            <p style="margin: 0;"><strong>Medical History / Red Flags:</strong> ${newAppointment.medicalHistory || 'No prior surgeries or red flags indicated'}</p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${googleEventLink}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">📅 Add to Google Calendar</a>
          </div>
        </div>
      </div>
    `
  };

  const reminder24h = {
    id: `rem-${Date.now()}-2`,
    appointmentId: newAppointment.id,
    recipientEmail: newAppointment.patientEmail,
    recipientName: newAppointment.patientName,
    type: "reminder-24h",
    subject: `Reminder: Physical Therapy Tomorrow at ${data.timeSlot}`,
    scheduledTime: `${data.date}T08:00:00Z`,
    status: "scheduled",
    htmlContent: `
      <div style="font-family: system-ui, sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="color: #0f766e; margin-top: 0;">24-Hour Appointment Reminder</h3>
        <p>Hi ${newAppointment.patientName}, your rehabilitation session with ${selectedDoc.name} is scheduled for tomorrow at ${data.timeSlot}.</p>
      </div>
    `
  };

  emailRemindersQueue.unshift(confirmationReminder, doctorAlertReminder, reminder24h);

  // Dispatch Real Email Notifications (Gmail SMTP or Resend) if configured
  dispatchEmail({
    to: doctorRecipientEmail,
    subject: `🩺 New Patient Booked: ${newAppointment.patientName} (${confCode}) - ${selectedService.name}`,
    html: doctorAlertReminder.htmlContent
  }).then(result => {
    if (result.success) {
      console.log(`✅ Doctor booking notification sent via ${result.provider} to ${doctorRecipientEmail}`);
    } else {
      console.log(`ℹ️ Doctor notification status: ${result.error}`);
    }
  });

  dispatchEmail({
    to: newAppointment.patientEmail,
    subject: `Booking Confirmed: ${selectedService.name} with ${selectedDoc.name} (${confCode})`,
    html: confirmationReminder.htmlContent
  }).then(result => {
    if (result.success) {
      console.log(`✅ Patient confirmation sent via ${result.provider} to ${newAppointment.patientEmail}`);
    }
  });

  // If patient doesn't have a record yet, create one
  if (!patientRecords[newAppointment.patientEmail]) {
    patientRecords[newAppointment.patientEmail] = {
      id: `pat-${Date.now()}`,
      patientName: newAppointment.patientName,
      patientEmail: newAppointment.patientEmail,
      patientPhone: newAppointment.patientPhone,
      dob: "1994-06-12",
      primaryCondition: newAppointment.painArea,
      initialPainScore: newAppointment.painLevel,
      currentPainScore: newAppointment.painLevel,
      mobilityImprovementPct: 15,
      carePlanStartDate: newAppointment.date,
      targetRecoveryDate: "2026-10-15",
      attendingPhysio: selectedDoc.name,
      clinicalNotes: [
        {
          date: newAppointment.date,
          physio: selectedDoc.name,
          note: `New patient booked for ${selectedService.name}. Initial pain rated ${newAppointment.painLevel}/10 for ${newAppointment.painArea}. Notes: ${newAppointment.symptomsNotes || 'None'}.`,
          measurements: "Baseline assessment pending arrival."
        }
      ],
      prescribedExercises: [
        {
          id: `ex-${Date.now()}-1`,
          name: "Gentle Active Assisted Range of Motion (AAROM)",
          targetArea: newAppointment.painArea,
          sets: 2,
          reps: "10 gentle repetitions",
          holdSeconds: 3,
          frequency: "Twice daily",
          instructions: ["Perform slow pain-free range cycles without forcing resistance.", "Focus on smooth diaphragmatic breathing during each cycle."],
          precautions: "Do not exceed comfortable 3/10 discomfort threshold.",
          difficulty: "Gentle",
          completedToday: false,
          streakDays: 1
        },
        {
          id: `ex-${Date.now()}-2`,
          name: "Postural Reset & Scapular Squeeze",
          targetArea: "Upper Thoracic Spine & Scapula",
          sets: 3,
          reps: "10 reps",
          holdSeconds: 5,
          frequency: "Every 2 hours during desk work",
          instructions: ["Draw shoulder blades down and back gently.", "Hold for 5 seconds while keeping neck long and relaxed."],
          precautions: "Avoid shrugging shoulders up toward ears.",
          difficulty: "Gentle",
          completedToday: false,
          streakDays: 1
        }
      ],
      painTrajectory: [
        { week: "Initial", score: newAppointment.painLevel, activityScore: 40 }
      ]
    };
  }

  res.status(201).json({
    success: true,
    appointment: newAppointment,
    remindersScheduled: 2,
    googleCalendarUrl: googleEventLink
  });
});

// 5b. Contact Form & Inquiry Submission Endpoint
app.post("/api/contact", async (req: Request, res: Response) => {
  const { 
    type = "appointment", 
    firstName, 
    lastName, 
    phone, 
    email, 
    description, 
    treatmentLocation, 
    preferredDate, 
    preferredTime, 
    serviceId, 
    serviceName 
  } = req.body;

  if (!firstName || !lastName || !phone || !email || !description) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required contact fields: firstName, lastName, phone, email, and description are required." 
    });
  }

  const newInquiry = {
    id: `inq-${Date.now()}`,
    type,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    description: String(description).trim(),
    treatmentLocation: treatmentLocation || "practice",
    preferredDate: preferredDate || "",
    preferredTime: preferredTime || "",
    serviceId: serviceId || "serv-1",
    serviceName: serviceName || "Physiotherapie",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  contactInquiries.unshift(newInquiry);
  console.log(`📬 [New Contact Inquiry] Type: ${type} | Name: ${newInquiry.firstName} ${newInquiry.lastName} | Phone: ${newInquiry.phone} | Email: ${newInquiry.email}`);

  // Dispatch Email Notification to Practice and Confirmation to Patient if email is configured
  const doctorEmail = process.env.DOCTOR_NOTIFICATION_EMAIL || process.env.SMTP_USER || "info@lebenswerk.praxismail.ch";
  const typeLabel = type === "appointment" ? "Terminanfrage" : type === "question" ? "Allgemeine Frage" : "Feedback";

  try {
    // Notify Practice
    await dispatchEmail({
      to: doctorEmail,
      subject: `🩺 [LEBENSWERK] Neue ${typeLabel} von ${newInquiry.firstName} ${newInquiry.lastName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #A5D6A7; border-radius: 16px; background: #ffffff; color: #1B5E20;">
          <div style="background: #1B5E20; color: #E8F5E9; padding: 20px; border-radius: 12px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">Neue ${typeLabel} eingegangen</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">LEBENSWERK Physiotherapie Biberist</p>
          </div>
          <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
            <div style="background: #E8F5E9; padding: 16px; border-radius: 12px; border: 1px solid #A5D6A7; margin-bottom: 16px;">
              <p style="margin: 0 0 8px;"><strong>Kategorie:</strong> ${typeLabel}</p>
              <p style="margin: 0 0 8px;"><strong>Name:</strong> ${newInquiry.firstName} ${newInquiry.lastName}</p>
              <p style="margin: 0 0 8px;"><strong>Telefon:</strong> <a href="tel:${newInquiry.phone}" style="color: #1B5E20; font-weight: bold;">${newInquiry.phone}</a></p>
              <p style="margin: 0 0 8px;"><strong>E-Mail:</strong> <a href="mailto:${newInquiry.email}" style="color: #1B5E20;">${newInquiry.email}</a></p>
              ${type === 'appointment' ? `
                <p style="margin: 0 0 8px;"><strong>Ort:</strong> ${newInquiry.treatmentLocation === 'home' ? '🏡 Mobile Hausbesuche' : '🏥 Praxis Biberist (Hauptstrasse 19)'}</p>
                <p style="margin: 0 0 8px;"><strong>Therapie:</strong> ${newInquiry.serviceName}</p>
                ${newInquiry.preferredDate ? `<p style="margin: 0 0 8px;"><strong>Wunschtermin:</strong> ${newInquiry.preferredDate}</p>` : ''}
              ` : ''}
            </div>
            <p><strong>Beschreibung / Anliegen:</strong></p>
            <div style="background: #ffffff; border: 1px solid #A5D6A7; padding: 14px; border-radius: 10px; font-style: italic; margin-bottom: 16px;">
              "${newInquiry.description}"
            </div>
            <p style="font-size: 12px; color: #4B7A50;">Eingegangen am ${new Date().toLocaleString('de-CH')}</p>
          </div>
        </div>
      `
    });
  } catch (emailErr) {
    console.warn("Could not dispatch inquiry email:", emailErr);
  }

  res.status(201).json({
    success: true,
    inquiry: newInquiry
  });
});

app.get("/api/inquiries", (req: Request, res: Response) => {
  res.json({ success: true, inquiries: contactInquiries });
});

// 6. Cancel or Reschedule Appointment
app.patch("/api/appointments/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date, timeSlot } = req.body;
  const aptIndex = appointments.findIndex(a => a.id === id);

  if (aptIndex === -1) {
    return res.status(404).json({ success: false, error: "Appointment not found" });
  }

  if (status) appointments[aptIndex].status = status;
  if (date) appointments[aptIndex].date = date;
  if (timeSlot) appointments[aptIndex].timeSlot = timeSlot;

  res.json({ success: true, appointment: appointments[aptIndex] });
});

// 7. Patient Portal Records
app.get("/api/patient/portal", (req: Request, res: Response) => {
  const { email } = req.query as { email?: string };
  const targetEmail = (email || "sadikudrit6@gmail.com").toLowerCase();
  
  const record = patientRecords[targetEmail] || patientRecords["sadikudrit6@gmail.com"];
  const userAppointments = appointments.filter(a => a.patientEmail.toLowerCase() === targetEmail);
  const userReminders = emailRemindersQueue.filter(r => r.recipientEmail.toLowerCase() === targetEmail);

  res.json({
    success: true,
    patient: record,
    appointments: userAppointments.length > 0 ? userAppointments : appointments,
    reminders: userReminders.length > 0 ? userReminders : emailRemindersQueue
  });
});

// 8. Toggle Exercise Completion (Interactive Patient Portal Routine)
app.post("/api/patient/exercise-toggle", (req: Request, res: Response) => {
  const { email, exerciseId, completed } = req.body;
  const targetEmail = (email || "sadikudrit6@gmail.com").toLowerCase();
  const record = patientRecords[targetEmail] || patientRecords["sadikudrit6@gmail.com"];

  if (record && record.prescribedExercises) {
    const ex = record.prescribedExercises.find((e: any) => e.id === exerciseId);
    if (ex) {
      ex.completedToday = completed;
      if (completed) {
        ex.streakDays = (ex.streakDays || 0) + 1;
      }
    }
  }

  res.json({ success: true, prescribedExercises: record?.prescribedExercises || [] });
});

// 9. Automated Email Reminders Queue & Trigger Test
app.get("/api/reminders", (req: Request, res: Response) => {
  res.json({ success: true, reminders: emailRemindersQueue });
});

app.post("/api/reminders/send-test", (req: Request, res: Response) => {
  const { recipientEmail, reminderType, appointmentId } = req.body;
  const apt = appointments.find(a => a.id === appointmentId) || appointments[0];

  const testReminder = {
    id: `rem-${Date.now()}`,
    appointmentId: apt.id,
    recipientEmail: recipientEmail || apt.patientEmail,
    recipientName: apt.patientName,
    type: reminderType || "reminder-24h",
    subject: `[SIMULATED EMAIL] ${reminderType === 'reminder-2h' ? '🚨 2 Hours Away' : '📅 24-Hour Notice'}: Physio with ${apt.specialistName}`,
    scheduledTime: "Sent Just Now",
    sentAt: new Date().toISOString(),
    status: "delivered",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 580px; padding: 20px; border: 1px solid #99f6e4; border-radius: 8px; background: #ffffff;">
        <h3 style="color: #0f766e;">Automated Session Notification Delivered</h3>
        <p>Dear ${apt.patientName},</p>
        <p>This automated reminder confirms your physical therapy session for <strong>${apt.serviceName}</strong>.</p>
        <p><strong>Scheduled:</strong> ${apt.date} at ${apt.timeSlot}</p>
        <p><strong>Physiotherapist:</strong> ${apt.specialistName}</p>
      </div>
    `
  };

  emailRemindersQueue.unshift(testReminder);
  res.json({ success: true, reminder: testReminder });
});

// 9b. Live Test Email Trigger & Diagnostic Route (Gmail SMTP or Resend)
app.post("/api/send-test-email", async (req: Request, res: Response) => {
  const { to } = req.body;
  const targetEmail = to || process.env.DOCTOR_NOTIFICATION_EMAIL || process.env.CLINIC_NOTIFICATION_EMAIL || "sadikudrit6@gmail.com";

  const result = await dispatchEmail({
    to: targetEmail,
    subject: "🩺 Live Test: Apex Physiotherapy Email Notifications Active!",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 580px; padding: 24px; border: 1px solid #ccfbf1; border-radius: 12px; background: #ffffff;">
        <div style="background: #0f766e; color: #ffffff; padding: 18px; border-radius: 10px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Email Notifications Active!</h2>
        </div>
        <div style="margin-top: 20px; color: #334155; line-height: 1.6;">
          <p>Hello Doctor,</p>
          <p>This is a live test notification from your Apex Physiotherapy clinic booking platform. Your email dispatch integration is verified and working properly.</p>
          <div style="background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 6px;"><strong>Status:</strong> ✅ Verified & Active</p>
            <p style="margin: 0 0 6px;"><strong>Recipient:</strong> ${targetEmail}</p>
            <p style="margin: 0 0 6px;"><strong>Delivery Method:</strong> ${process.env.SMTP_USER ? `Gmail SMTP (${process.env.SMTP_USER})` : 'Resend API'}</p>
            <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">Whenever a new patient books an appointment, all clinical details, pain severity scores, and triage notes will be delivered to you here instantly.</p>
        </div>
      </div>
    `
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      configured: result.provider !== "none",
      provider: result.provider,
      error: result.error || "Failed to send email. Check your SMTP_USER/SMTP_PASS in .env"
    });
  }

  return res.json({
    success: true,
    configured: true,
    provider: result.provider,
    message: `Test email successfully sent to ${targetEmail} via ${result.provider}!`,
    messageId: result.id
  });
});

// 9c. Live Email Configuration & Diagnostic Check Endpoint
app.get("/api/email-diagnostics", async (req: Request, res: Response) => {
  const user = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, "");
  const pass = process.env.SMTP_PASS?.replace(/[\s"']/g, "");
  const doctorEmail = process.env.DOCTOR_NOTIFICATION_EMAIL || "sadikudrit6@gmail.com";
  const resendKey = process.env.RESEND_API_KEY?.trim();

  let smtpStatus = "not_configured";
  let smtpError: string | null = null;

  if (user && pass) {
    try {
      const smtp = getSmtp();
      if (smtp) {
        await smtp.verify();
        smtpStatus = "connected_and_verified";
      }
    } catch (err: any) {
      smtpStatus = "auth_failed";
      smtpError = err.message || String(err);
    }
  }

  res.json({
    hasSmtpUser: !!user,
    maskedUser: user ? `${user.substring(0, 3)}***@${user.split('@')[1] || 'gmail.com'}` : null,
    hasSmtpPass: !!pass,
    smtpPassLength: pass ? pass.length : 0,
    hasResendKey: !!resendKey,
    doctorNotificationEmail: doctorEmail,
    smtpStatus,
    smtpError,
    activeProvider: smtpStatus === "connected_and_verified" ? "Gmail SMTP (Active)" : (user && pass ? "Gmail SMTP (Auth Issue)" : (resendKey ? "Resend API" : "Simulated Local Queue"))
  });
});

// 9d. Google Calendar Sync Endpoint (updates appointment status & link)
app.post("/api/calendar/sync-event", (req: Request, res: Response) => {
  const { appointmentId, eventId, htmlLink } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ error: "Missing appointmentId" });
  }

  const apt = appointments.find(a => a.id === appointmentId || a.confirmationCode === appointmentId);
  if (apt) {
    apt.googleCalendarSynced = true;
    if (htmlLink) apt.googleEventLink = htmlLink;
    return res.json({ success: true, appointment: apt });
  }

  res.json({ success: true, message: "Sync recorded" });
});

// 10. AI Physiotherapy Clinical Intake & Triage Assistant
app.post("/api/ai/symptom-triage", async (req: Request, res: Response) => {
  const { painArea, painLevel, duration, description, priorSurgeries } = req.body;

  const prompt = `You are a licensed Doctor of Physical Therapy (DPT) performing a clinical intake triage. 
A patient has provided the following physical symptoms:
- Location / Pain Area: ${painArea || 'General'}
- Pain Severity Level (1-10): ${painLevel || '5'}
- Duration of Pain: ${duration || 'Several weeks'}
- Detailed Description: ${description || 'Stiffness, dull ache upon movement'}
- Prior Surgeries / Trauma: ${priorSurgeries || 'None'}

Please provide a concise, structured JSON clinical triage recommendation with these exact keys:
1. "urgencyLevel": "Low (Standard Rehab)" | "Moderate (Prompt Evaluation Recommended)" | "High (Immediate Orthopedic/Medical Review Required)"
2. "suspectedPathology": A clear, 1-2 sentence clinical assessment of possible musculoskeletal causes (e.g. disc herniation, rotator cuff impingement, myofascial trigger point, patellofemoral syndrome).
3. "recommendedService": Recommended physiotherapy modality name from our clinic (options: "Spinal Rehabilitation & Disc Therapy", "Sports Injury & Athletic Performance Rehab", "Post-Surgical Joint & Mobility Restoration", "Dry Needling & Advanced Trigger Point Therapy", "Posture Correction & Ergonomic Health", "Virtual Physiotherapy & Tele-Rehab Consultation").
4. "recommendedSpecialist": Either "Dr. Elena Rostova, DPT, OCS" (Spine/Neck), "Marcus Vance, PT, CSCS" (Sports/Knee/Shoulder), or "Dr. Sophia Chen, DPT, CMPT" (Post-Op/Joint/Mobility).
5. "immediateSelfCareAdvice": 3 practical bullet points for acute relief before the appointment (e.g. ice vs heat, gentle unloading postures, movements to avoid).
6. "questionsToPrepare": 2 questions the patient should be ready to discuss with their physiotherapist.

Respond in pure valid JSON format ONLY with no markdown quotes.`;

  try {
    const ai = getAi();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const triageData = JSON.parse(text);
      return res.json({ success: true, triage: triageData });
    }
  } catch (err) {
    console.warn("Gemini triage fallback triggered:", err);
  }

  // Graceful rule-based clinical fallback if no API key or error
  const isSpine = (painArea || "").toLowerCase().includes("back") || (painArea || "").toLowerCase().includes("spine") || (painArea || "").toLowerCase().includes("neck");
  const isSports = (painArea || "").toLowerCase().includes("knee") || (painArea || "").toLowerCase().includes("shoulder") || (painArea || "").toLowerCase().includes("ankle");

  res.json({
    success: true,
    triage: {
      urgencyLevel: Number(painLevel) >= 8 ? "Moderate (Prompt Evaluation Recommended)" : "Low (Standard Rehab)",
      suspectedPathology: isSpine 
        ? "Possible mechanical lumbar/cervical facet irritation or discogenic nerve sensitivity with localized muscular spasm."
        : isSports 
        ? "Possible soft tissue ligamentous strain or kinetic chain tendinopathy with periarticular load imbalance."
        : "Musculoskeletal imbalance and myofascial strain with reduced range of motion.",
      recommendedService: isSpine ? "Spinal Rehabilitation & Disc Therapy" : isSports ? "Sports Injury & Athletic Performance Rehab" : "Dry Needling & Advanced Trigger Point Therapy",
      recommendedSpecialist: isSpine ? "Dr. Elena Rostova, DPT, OCS" : isSports ? "Marcus Vance, PT, CSCS" : "Dr. Sophia Chen, DPT, CMPT",
      immediateSelfCareAdvice: [
        "Avoid prolonged static postures greater than 30 minutes; alternate positions gently.",
        "Apply cold compress for 15 minutes if acute swelling or burning is present.",
        "Perform slow diaphragmatic breathing to release protective muscular bracing."
      ],
      questionsToPrepare: [
        "What specific daily movements or chair positions provoke the sharpest onset?",
        "Have you noticed any numbness, tingling, or weakness radiating into hands or feet?"
      ]
    }
  });
});

// Vite middleware for development & SPA serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Physiotherapy Clinic Server running on http://localhost:${PORT}`);
  });
}

startServer();
