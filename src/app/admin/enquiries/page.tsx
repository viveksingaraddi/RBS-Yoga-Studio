import { prisma } from '@/lib/prisma';
import { MessageSquare, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import EnquiryRowStatusChanger from '@/components/admin/EnquiryRowStatusChanger';

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Lead Follow-Up CRM
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          WhatsApp & Website Enquiries
        </h1>
        <p className="text-xs text-charcoal/70">
          Track incoming customer requests, change follow-up statuses, and add internal notes.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card divide-y divide-sage-dark/30">
        {enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal/60">
            No enquiries received yet.
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-2xl text-forest font-medium">
                      {enquiry.fullName}
                    </span>
                    <span className="text-xs text-olive font-medium">
                      ({enquiry.interestedProgram || 'General Enquiry'} · {enquiry.preferredType})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-olive">
                    <span className="flex items-center space-x-1 font-semibold text-forest">
                      <Phone className="w-3.5 h-3.5 text-earth" />
                      <span>{enquiry.phone}</span>
                    </span>
                    {enquiry.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-earth" />
                        <span>{enquiry.email}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-earth" />
                      <span>
                        {new Date(enquiry.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={`https://wa.me/${enquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Namaste ${enquiry.fullName}! Master Sangu from RBS Yoga Studio following up on your enquiry.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] text-white px-3.5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <EnquiryRowStatusChanger
                    enquiryId={enquiry.id}
                    initialStatus={enquiry.status}
                    initialNotes={enquiry.internalNotes || ''}
                  />
                </div>
              </div>

              {/* Message quote */}
              <div className="p-4 bg-sage-light/60 border border-sage-dark/30 text-xs text-charcoal/85 leading-relaxed">
                <span className="font-semibold block text-forest mb-1">Message from visitor:</span>
                "{enquiry.message}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
