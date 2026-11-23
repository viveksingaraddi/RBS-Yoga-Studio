import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import GallerySection from '@/components/home/GallerySection';

export const revalidate = 60;

export default async function GalleryPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar
        businessName={settings.businessName}
        brandTagline={settings.brandTagline}
        whatsAppNumber={settings.publicWhatsAppNumber}
      />

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Visual Sanctuary
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-forest leading-tight">
              Studio & Practice Gallery
            </h1>
            <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
              Glimpse into the tranquil environment, posture alignment, and mindful discipline
              fostered daily under the guidance of Master Sangu.
            </p>
          </div>

          <GallerySection />
        </div>
      </main>

      <Footer
        businessName={settings.businessName}
        brandTagline={settings.brandTagline}
        contactEmail={settings.publicContactEmail}
        contactPhone={settings.publicContactPhone}
        address={settings.businessAddress}
        timezone={settings.timezone}
        instagramUrl={settings.instagramUrl}
        facebookUrl={settings.facebookUrl}
        youtubeUrl={settings.youtubeUrl}
        websiteUrl={settings.websiteUrl}
        instructorName={settings.instructorName}
      />
      <FloatingWhatsApp whatsAppNumber={settings.publicWhatsAppNumber} />
    </div>
  );
}
