type Props = { title: string; value: number | string; subtitle?: string; loading?: boolean };

export default function StatCard({ title, value, subtitle, loading }: Props) {
  return (
    <article className="card">
      <div className="card__header">{title}</div>
      <div className="card__body">
        {loading ? <div className="skeleton" /> : <div className="stat__value">{value}</div>}
        {subtitle && <div className="stat__subtitle">{subtitle}</div>}
      </div>
    </article>
  );
}
