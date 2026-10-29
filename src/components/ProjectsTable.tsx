import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ExternalLink, Search, X } from "lucide-react";
import { Button } from "./ui/button";

interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface VercelUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface ProjectsTableProps {
  projects: VercelProject[];
  selectedProjects: Set<string>;
  isLoading: boolean;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: (filteredIds?: string[]) => void;
  userInfo: VercelUser | null;
  activeTeamSlug?: string;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp || isNaN(timestamp)) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFrameworkBadge = (framework?: string) => {
  if (!framework) return null;
  
  const frameworkLower = framework.toLowerCase();
  
  if (frameworkLower.includes("next")) return { label: "Next.js", variant: "default" as const };
  if (frameworkLower.includes("react")) return { label: "React", variant: "secondary" as const };
  if (frameworkLower.includes("vue")) return { label: "Vue", variant: "secondary" as const };
  if (frameworkLower.includes("svelte")) return { label: "Svelte", variant: "secondary" as const };
  if (frameworkLower.includes("nuxt")) return { label: "Nuxt", variant: "secondary" as const };
  
  return { label: framework, variant: "outline" as const };
};

export function ProjectsTable({
  projects,
  selectedProjects,
  isLoading,
  onToggleSelection,
  onToggleSelectAll,
  userInfo,
  activeTeamSlug,
}: ProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead className="hidden sm:table-cell">Framework</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 sm:w-48" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border p-8 sm:p-12 text-center text-muted-foreground">
        <p className="text-sm sm:text-base">No projects found in this account.</p>
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.framework?.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      )
    : projects;

  const allFilteredSelected =
    filteredProjects.length > 0 &&
    filteredProjects.every((p) => selectedProjects.has(p.id));
  const someSelected = filteredProjects.some((p) => selectedProjects.has(p.id));

  const handleHeaderCheckbox = () => {
    onToggleSelectAll(filteredProjects.map((p) => p.id));
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search projects by name or framework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p className="text-sm">No projects matching "{searchQuery}"</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs"
          >
            Clear search filter
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      id="select-all-projects-checkbox"
                      checked={
                        allFilteredSelected
                          ? true
                          : someSelected
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={handleHeaderCheckbox}
                      aria-label="Select all projects"
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px] max-w-[300px]">Project Name</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Framework</TableHead>
                  <TableHead className="hidden md:table-cell w-[150px]">Created</TableHead>
                  <TableHead className="hidden lg:table-cell w-[150px]">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const frameworkInfo = getFrameworkBadge(project.framework);
                  const accountSlug = activeTeamSlug || userInfo?.username;
                  const projectUrl = accountSlug 
                    ? `https://vercel.com/${encodeURIComponent(accountSlug)}/${encodeURIComponent(project.name)}`
                    : `https://vercel.com/dashboard/projects/${encodeURIComponent(project.id)}`;

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={() => onToggleSelection(project.id)}
                          aria-label={`Select project ${project.name}`}
                        />
                      </TableCell>
                      <TableCell className="min-w-[200px] max-w-[300px]">
                        <a
                          href={projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline text-primary text-sm font-medium"
                        >
                          <span className="truncate block max-w-[280px]">{project.name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        {frameworkInfo && (
                          <div className="sm:hidden mt-1">
                            <Badge variant={frameworkInfo.variant} className="text-xs">
                              {frameworkInfo.label}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell w-[120px]">
                        {frameworkInfo ? (
                          <Badge variant={frameworkInfo.variant} className="text-xs whitespace-nowrap">
                            {frameworkInfo.label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(project.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(project.updatedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
