export function createWhatsAppEnquiryLink({
  phone,
  fullName,
  program,
  preferredType,
  message,
}: {
  phone: string;
  fullName: string;
  program?: string | null;
  preferredType?: string;
  message?: string;
}): string {
  // Strip non-digits
  const cleanPhone = phone.replace(/\D/g, '');

  const textLines = [
    `*Namaste RBS Yoga Studio!* 🙏`,
    `I would like to enquire about your yoga programs.`,
    ``,
    `*Name:* ${fullName}`,
    program ? `*Interested Program:* ${program}` : null,
    preferredType ? `*Preferred Mode:* ${preferredType}` : null,
    message ? `*Message:* ${message}` : null,
    ``,
    `Looking forward to beginning my wellness journey with Master Sangu.`,
  ].filter(Boolean);

  const encodedText = encodeURIComponent(textLines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
