import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ParticleField from "@/components/ParticleField";
import ProjectSection from "@/components/ProjectSection";
import { PROJECTS } from "@/lib/projects";

export default function Page() {
  return (
    <>
      <ParticleField />
      <Nav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        {PROJECTS.map((project, i) => (
          <ProjectSection
            key={project.id}
            project={project}
            from={i === 0 ? "ambient" : PROJECTS[i - 1].id}
            isLast={i === PROJECTS.length - 1}
          />
        ))}
        <About />
        <Contact />
      </main>
    </>
  );
}
