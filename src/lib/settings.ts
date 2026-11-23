import { prisma } from './prisma';

export interface StudioBusinessSettings {
  id: string;
  businessName: string;
  brandTagline: string;
  instructorName: string;
  instructorBiography: string;
  publicWhatsAppNumber: string;
  publicContactPhone: string;
  publicContactEmail: string;
  adminNotificationEmail: string;
  businessAddress: string;
  timezone: string;
  currency: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
  notifyOnBooking: boolean;
  notifyOnEnquiry: boolean;
  notifyOnPayment: boolean;
  notifyOnMembership: boolean;
}

const DEFAULT_SETTINGS: StudioBusinessSettings = {
  id: 'singleton',
  businessName: 'RBS Yoga Studio',
  brandTagline: 'The Art of Strength, Balance & Wellness',
  instructorName: 'Master Sangu',
  instructorBiography:
    'Master Sangu holds an M.Sc. in Yoga with over 10 years of international teaching experience, including extensive work in Vietnam. Dedicated to authentic yogic discipline, Master Sangu integrates classical posture alignment, rhythmic pranayama, and profound meditative stillness to help students cultivate enduring physical strength, mental clarity, and holistic balance.',
  publicWhatsAppNumber: '+91 89513 46405',
  publicContactPhone: '+91 89513 46405',
  publicContactEmail: 'contact@rbsyogastudio.com',
  adminNotificationEmail: 'owner@rbsyogastudio.com',
  businessAddress: 'RBS Studio Pavilion, Bangalore / Global Online Shala (Physical address to be finalized)',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  instagramUrl: 'https://instagram.com/rbsyogastudio',
  facebookUrl: 'https://facebook.com/rbsyogastudio',
  youtubeUrl: 'https://youtube.com/@rbsyogastudio',
  websiteUrl: 'https://rbsyogastudio.com',
  notifyOnBooking: true,
  notifyOnEnquiry: true,
  notifyOnPayment: true,
  notifyOnMembership: true,
};

export function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export async function getBusinessSettings(): Promise<StudioBusinessSettings> {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    return {
      id: settings.id,
      businessName: settings.businessName || DEFAULT_SETTINGS.businessName,
      brandTagline: settings.brandTagline || settings.tagline || DEFAULT_SETTINGS.brandTagline,
      instructorName: settings.instructorName || settings.leadInstructor || DEFAULT_SETTINGS.instructorName,
      instructorBiography: settings.instructorBiography || settings.instructorBio || DEFAULT_SETTINGS.instructorBiography,
      publicWhatsAppNumber: settings.publicWhatsAppNumber || settings.whatsappNumber || DEFAULT_SETTINGS.publicWhatsAppNumber,
      publicContactPhone: settings.publicContactPhone || settings.contactPhone || DEFAULT_SETTINGS.publicContactPhone,
      publicContactEmail: settings.publicContactEmail || settings.contactEmail || DEFAULT_SETTINGS.publicContactEmail,
      adminNotificationEmail: settings.adminNotificationEmail || DEFAULT_SETTINGS.adminNotificationEmail,
      businessAddress: settings.businessAddress || settings.address || DEFAULT_SETTINGS.businessAddress,
      timezone: settings.timezone || DEFAULT_SETTINGS.timezone,
      currency: settings.currency || DEFAULT_SETTINGS.currency,
      instagramUrl: settings.instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
      facebookUrl: settings.facebookUrl ?? DEFAULT_SETTINGS.facebookUrl,
      youtubeUrl: settings.youtubeUrl ?? DEFAULT_SETTINGS.youtubeUrl,
      websiteUrl: settings.websiteUrl ?? DEFAULT_SETTINGS.websiteUrl,
      notifyOnBooking: settings.notifyOnBooking ?? true,
      notifyOnEnquiry: settings.notifyOnEnquiry ?? true,
      notifyOnPayment: settings.notifyOnPayment ?? true,
      notifyOnMembership: settings.notifyOnMembership ?? true,
    };
  } catch (error) {
    console.error('Error fetching business settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}
