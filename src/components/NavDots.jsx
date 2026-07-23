export default function NavDots({ total, current, onNavigate }) {
  return (
    <div className="side-nav">
      {Array.from({ length: total + 1 }, (_, i) => {
        let label = `#${i}`;
        if (i === 0) label = 'Index';
        else if (i === total - 1) label = 'Tutorial';
        else if (i === total) label = 'Contact';
        
        return (
          <button
            key={i}
            className={`side-nav-dot ${current === i ? 'active' : ''}`}
            data-label={label}
            onClick={() => onNavigate(i)}
            aria-label={label}
          />
        );
      })}
    </div>
  );
}
