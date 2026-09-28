import { ArrowRightIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectArt } from "@/components/site/project-art";
import { experiments, projects } from "@/lib/projects";
import { site } from "@/lib/site";

export function Projects() {
  return (
    <section id="work" className="section section-rule work-section" aria-labelledby="work-title">
      <div className="section-heading">
        <h2 id="work-title">Selected work<span className="accent-period">.</span></h2>
        <p>Tools for a few real-world problems.</p>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article key={project.id} className={index === 0 ? "project-featured" : ""}>
            <Card className="project-card">
              <a href={project.repository.html_url} className="project-link" aria-label={`Explore ${project.name} on GitHub`}>
                <div className={`project-cover project-cover-${project.id}`}><ProjectArt project={project.id} /></div>
                <CardContent className="project-information">
                  <div>
                    <div className="project-title-row"><h3>{project.name}</h3><ArrowRightIcon className="project-arrow arrow-out" aria-hidden="true" /></div>
                    <span className="project-kind">{project.kind}</span>
                  </div>
                  <p>{project.description}</p>
                  <div className="project-technologies">
                    {project.technologies.map((technology) => <Badge key={technology} variant="outline" className="technology-badge">{technology}</Badge>)}
                  </div>
                  <span className="project-cta">Explore repository <ArrowRightIcon className="icon" aria-hidden="true" /></span>
                </CardContent>
              </a>
            </Card>
          </article>
        ))}
      </div>
      <div className="experiments">
        <div className="experiments-heading">
          <h3>A few more experiments</h3>
          <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
            <a href={`${site.github}?tab=repositories`}>All repositories <ArrowRightIcon className="icon arrow-out" aria-hidden="true" /></a>
          </Button>
        </div>
        <Table className="experiments-table">
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead className="experiment-description">The idea</TableHead><TableHead className="experiment-language">Language</TableHead></TableRow></TableHeader>
          <TableBody>
            {experiments.map((experiment) => (
              <TableRow key={experiment.repository.name}>
                <TableCell><a className="experiment-link" href={experiment.repository.html_url}>{experiment.name}<ArrowRightIcon className="icon arrow-out" aria-hidden="true" /></a></TableCell>
                <TableCell className="experiment-description">{experiment.description}</TableCell>
                <TableCell className="experiment-language">{experiment.repository.language}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
