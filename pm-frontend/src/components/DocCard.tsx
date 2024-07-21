import "./DocCard.css";

type docCardProps = {
  docName: string,
  creationTime: string
};

function DocCard({ docName, creationTime }: docCardProps) {

  return (
    <>
      <div className="doc-card">
        {docName}
      </div>
      <div className="doc-card-hover">
        {creationTime} 
      </div>
    </>
  );
}


export { DocCard };