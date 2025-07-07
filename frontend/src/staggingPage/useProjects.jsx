import { createContext, useContext, useState, useEffect } from "react";

// Contexte pour stocker les projets
const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    // Charge depuis localStorage au démarrage
    const saved = localStorage.getItem("stagging-projects");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Sauvegarde à chaque modification
    localStorage.setItem("stagging-projects", JSON.stringify(projects));
  }, [projects]);

  return (
    <ProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
}

// Hook pour accéder aux projets partout dans l'app
export function useProjects() {
  return useContext(ProjectsContext);
}