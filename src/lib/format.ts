export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0%';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

export function safeNumber(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function getCaseFatalityRate(
  deaths: number | null | undefined,
  totalCases: number | null | undefined,
): number {
  const safeDeaths = safeNumber(deaths);
  const safeTotal = safeNumber(totalCases);

  if (safeTotal <= 0) {
    return 0;
  }

  return safeDeaths / safeTotal;
}

export function getUnconfirmedTotal(input: {
  suspected?: number | null;
  probable?: number | null;
  possible?: number | null;
  underInvestigation?: number | null;
  pending?: number | null;
  explicitUnconfirmed?: number | null;
}): number {
  const explicit = safeNumber(input.explicitUnconfirmed);

  if (explicit > 0) {
    return explicit;
  }

  return (
    safeNumber(input.suspected) +
    safeNumber(input.probable) +
    safeNumber(input.possible) +
    safeNumber(input.underInvestigation) +
    safeNumber(input.pending)
  );
}