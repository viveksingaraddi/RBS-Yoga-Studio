'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnquiryRowStatusChanger({
  enquiryId,
  initialStatus,
  initialNotes,
}: {
  enquiryId: string;
  initialStatus: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, internalNotes: notes }),
      });
      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value)}
        disabled={saving}
        className="bg-ivory border border-sage-dark/60 text-xs px-2.5 py-2 text-charcoal focus:outline-none focus:border-forest font-semibold"
      >
        <option value="NEW">Status: NEW</option>
        <option value="CONTACTED">Status: CONTACTED</option>
        <option value="CONVERTED">Status: CONVERTED</option>
        <option value="CLOSED">Status: CLOSED</option>
      </select>
    </div>
  );
}
