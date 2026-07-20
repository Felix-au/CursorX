export default function NavDots({ total, current, onNavigate }) {
  return (
    <div className="side-nav">
      {Array.from({ length: total + 1 }, (_, i) => (
        <button
          key={i}
          className={`side-nav-dot ${current === i ? 'active' : ''}`}
          data-label={i === 0 ? 'Index' : `#${i}`}
          onClick={() => onNavigate(i)}
          aria-label={i === 0 ? 'Hero Index' : `Cursor ${i}`}
        />
      ))}
    </div>
  );
}
