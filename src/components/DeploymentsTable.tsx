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
  onToggleSelection: (uid: string) => void;
  onToggleSelectAll: () => void;
  onUpdate: () => void;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
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
      return "secondary";
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
  onToggleSelection,
  onToggleSelectAll,
  onUpdate,
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

  const allSelected = selectedDeployments.size === deployments.length && deployments.length > 0;

  return (
    <div className="rounded-lg border overflow-x-auto">
      <div className="min-w-[640px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
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
            {deployments.map((deployment) => (
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
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline text-primary text-sm"
                  >
                    <span className="truncate block max-w-[280px]">{deployment.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <div className="md:hidden mt-1 text-xs text-muted-foreground truncate">
                    {deployment.meta?.githubCommitRef || "No branch"}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell w-[150px]">
                  <span className="text-sm text-muted-foreground truncate block">
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
                    onDelete={() => onToggleSelection(deployment.uid)}
                    onUpdate={onUpdate}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
