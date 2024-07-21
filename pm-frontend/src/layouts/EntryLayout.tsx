import "./EntryLayout.css";

type EntryLayoutProps = {
  sectionHeaders: string[],
  sections: EntrySection[], 
};

type EntrySection = {
  sectionHeader: string
  heading: string,
  text: string, 
};

function EntryLayout({ sectionHeaders, sections }: EntryLayoutProps) {

  return (
    <>
      <nav className="entry-layout-container">
        <ul className="sidebar-sections">
          {sectionHeaders.map((sectionHeader) => {
            return (
              <a href={"#" + sectionHeader} className="section-link">
                {sectionHeader}
              </a>
            );
          })}
        </ul>
      </nav>
      {sections.map((section) => {
        <div id={section.sectionHeader}>
          <h2>{section.heading}</h2>
          <p>{section.text}</p>
        </div>
      })}
    </>
  );
}

export { EntryLayout };