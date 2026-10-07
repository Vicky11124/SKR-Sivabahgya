/* Heading split into masked lines; each line slides up into view (animated in App) */
export default function Lines({ as: Tag = 'h2', className = 'display', lines }) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}><span>{line}</span></span>
      ))}
    </Tag>
  );
}
