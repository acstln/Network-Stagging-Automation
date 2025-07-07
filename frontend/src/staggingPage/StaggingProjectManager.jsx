import React, { useState } from "react";
import StaggingProjectList from "./StaggingProjectList";
import StaggingProjectPage from "./StaggingProjectPage";

export default function StaggingProjectManager() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleCreateProject = (project) => {
    setProjects([
      ...projects,
      {
        ...project,
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        devices: [],
      },
    ]);
  };

  const handleSelectProject = (id) => setSelectedProjectId(id);

  const handleUpdateDevices = (projectId, devices) => {
    setProjects(projects =>
      projects.map(p =>
        p.id === projectId ? { ...p, devices } : p
      )
    );
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return selectedProject ? (
    <StaggingProjectPage
      project={selectedProject}
      onBack={() => setSelectedProjectId(null)}
      onUpdateDevices={devices => handleUpdateDevices(selectedProject.id, devices)}
    />
  ) : (
    <StaggingProjectList
      projects={projects}
      onCreate={handleCreateProject}
      onSelect={handleSelectProject}
    />
  );
}