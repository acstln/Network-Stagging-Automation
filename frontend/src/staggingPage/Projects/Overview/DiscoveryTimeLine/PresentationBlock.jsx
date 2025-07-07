import "./PresentationBlock.css"; // Assuming you have a CSS file for styling

export default function PresentationBlock() {
  return (
    <div className="presentation-block">
      <h2 className="f3 mb-2">Outil de stagging réseau</h2>
      <p className="f5 color-fg-muted">
        Cet outil vous permet de scanner un sous-réseau pour découvrir les équipements connectés et leur statut en temps réel.
      </p>
    </div>
  );
}