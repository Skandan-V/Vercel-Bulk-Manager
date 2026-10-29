import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";
import { DeploymentActions } from "./DeploymentActions";

interface VercelDeployment {
  uid: string;
  url: string;
  state: string;
  created: number;
  meta?: {
    githubCommitRef?: string;
    githubCommitMessage?: string;
  };
}

interface DeploymentsTableProps {
  deployments: VercelDeployment[];
  selectedDeployments: Set<string>;
  isLoading: boolean;
  token: string;
  projectId: string;
  projectName?: string;
  teamId?: string;
  onToggleSelection: (uid: string) => void;
  onToggleSelectAll: () => void;
  onUpdate: () => void;
  onDeleteSingle: (uid: string) => void;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp || isNaN(timestamp)) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStateVariant = (state: string): "default" | "destructive" | "secondary" | "outline" | "success" => {
  switch (state.toUpperCase()) {
    case "READY":
      return "success";
    case "ERROR":
      return "destructive";
    case "BUILDING":
    case "QUEUED":
    case "INITIALIZING":
      return "secondary";
    case "CANCELED":
      return "outline";
    default:
      return "outline";
  }
};

export function DeploymentsTable({
  deployments,
  selectedDeployments,
  isLoading,
  token,
  projectId,
  projectName,
  teamId,
  onToggleSelection,
  onToggleSelectAll,
  onUpdate,
  onDeleteSingle,
}: DeploymentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Deployment URL</TableHead>
              <TableHead className="hidden md:table-cell">Git Branch</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
              <TableHead className="w-12"></TableHead>
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
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="rounded-lg border p-8 sm:p-12 text-center text-muted-foreground">
        <p className="text-sm sm:text-base">No deployments found for this project.</p>
      </div>
    );
  }

  const allFilteredSelected =
    deployments.length > 0 && deployments.every((d) => selectedDeployments.has(d.uid));
  const someSelected = deployments.some((d) => selectedDeployments.has(d.uid));

  return (
    <div className="rounded-lg border overflow-x-auto">
      <div className="min-w-[640px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allFilteredSelected ? true : (someSelected ? "indeterminate" : false)}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all deployments"
                />
              </TableHead>
              <TableHead className="min-w-[200px] max-w-[300px]">Deployment URL</TableHead>
              <TableHead className="hidden md:table-cell w-[150px]">Git Branch</TableHead>
              <TableHead className="w-[100px]">State</TableHead>
              <TableHead className="hidden sm:table-cell w-[150px]">Created At</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment) => {
              const fullUrl = deployment.url.startsWith("http://") || deployment.url.startsWith("https://")
                ? deployment.url
                : `https://${deployment.url}`;

              return (
                <TableRow key={deployment.uid}>
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedDeployments.has(deployment.uid)}
                      onCheckedChange={() => onToggleSelection(deployment.uid)}
                      aria-label={`Select deployment ${deployment.url}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-[200px] max-w-[300px]">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline text-primary text-sm font-medium"
                    >
                      <span className="truncate block max-w-[280px]">{deployment.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {deployment.meta?.githubCommitMessage && (
                      <div className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5" title={deployment.meta.githubCommitMessage}>
                        {deployment.meta.githubCommitMessage}
                      </div>
                    )}
                    <div className="md:hidden mt-1 text-xs text-muted-foreground truncate">
                      {deployment.meta?.githubCommitRef || "No branch"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[150px]">
                    <span className="text-sm text-muted-foreground truncate block font-mono">
                      {deployment.meta?.githubCommitRef || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <Badge variant={getStateVariant(deployment.state)} className="text-xs whitespace-nowrap">
                      {deployment.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap w-[150px]">
                    {formatDate(deployment.created)}
                  </TableCell>
                  <TableCell>
                    <DeploymentActions
                      deployment={deployment}
                      token={token}
                      projectId={projectId}
                      projectName={projectName}
                      teamId={teamId}
                      onDelete={() => onDeleteSingle(deployment.uid)}
                      onUpdate={onUpdate}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
