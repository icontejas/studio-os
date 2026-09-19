// ==========================================================
// StudioOS — Formatters & Helper Utilities
// ==========================================================

export function formatINR(amount: number | string | undefined | null): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  try {
    const [hours, mins] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${mins || '00'} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export function getRelativeDays(dateStr: string): string {
  try {
    const target = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    return `In ${diffDays} days`;
  } catch {
    return dateStr;
  }
}

export function generateWhatsAppLink(phone: string | undefined, message: string): string {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const encodedMsg = encodeURIComponent(message.trim());
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PAID':
    case 'ACCEPTED':
    case 'DELIVERED':
    case 'COMPLETED':
    case 'APPROVED':
    case 'WON':
      return 'badge-success';
    case 'OVERDUE':
    case 'REJECTED':
    case 'CANCELLED':
    case 'LOST':
    case 'REVISION_REQUESTED':
      return 'badge-danger';
    case 'PARTIALLY_PAID':
    case 'SENT':
    case 'QUOTED':
    case 'REVIEW':
    case 'READY_FOR_REVIEW':
    case 'IN_PROGRESS':
    case 'HIGH':
    case 'URGENT':
      return 'badge-warning';
    case 'BOOKED':
    case 'SHOOTING':
    case 'EDITING':
    case 'UPCOMING':
      return 'badge-accent';
    default:
      return 'badge-neutral';
  }
}
