export const CHART = {
  primary: '#2563eb',
  secondary: '#0d9488',
  tertiary: '#C4A052',
  grid: '#e8ecf1',
  axis: '#94a3b8',
  tooltip: {
    background: '#0B1220',
    border: 'none',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 13,
    padding: '10px 14px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
} as const;

export const chartGradient = (id: string, color: string) => ({
  id,
  stops: [
    { offset: '0%', color, opacity: 0.2 },
    { offset: '100%', color, opacity: 0 },
  ],
});
