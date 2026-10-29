import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  MoreVertical,
  Rocket,
  Link2,
  RefreshCw,
  FileText,
  Settings,
  Trash2,
} from "lucide-react";

interface DeploymentActionsProps {
  deployment: {
    uid: string;
    url: string;
    state: string;
  };
  token: string;
  projectId: string;
  projectName?: string;
  teamId?: string;
  onDelete: () => void;
  onUpdate: () => void;
}

interface EnvVarDisplay {
  id: string;
  key: string;
  value: string;
  target?: string[];
  type?: string;
}

export function DeploymentActions({
  deployment,
  token,
  projectId,
  projectName,
  teamId,
  onDelete,
  onUpdate,
}: DeploymentActionsProps) {
  const [showAliasDialog, setShowAliasDialog] = useState(false);
  const [showLogsSheet, setShowLogsSheet] = useState(false);
  const [showEnvSheet, setShowEnvSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [aliasValue, setAliasValue] = useState("");
  const [logs, setLogs] = useState<string>("");
  const [envVars, setEnvVars] = useState<EnvVarDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTeamQuery = (prefix: "?" | "&" = "?") =>
    teamId ? `${prefix}teamId=${encodeURIComponent(teamId)}` : "";

  const handlePromoteToProduction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/promote/${deployment.uid}${getTeamQuery()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to promote deployment");
      }

      toast.success("Deployment promoted to production!");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to promote deployment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAlias = async () => {
    const cleanedAlias = aliasValue.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!cleanedAlias) {
      toast.error("Please enter a valid domain");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v2/deployments/${deployment.uid}/aliases${getTeamQuery()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alias: cleanedAlias }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to assign alias");
      }

      toast.success(`Alias assigned: ${cleanedAlias}`);
      setShowAliasDialog(false);
      setAliasValue("");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign alias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeploy = async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = {
        deploymentId: deployment.uid,
        name: projectName || projectId,
        target: "production",
      };

      const response = await fetch(
        `https://api.vercel.com/v13/deployments${getTeamQuery()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to redeploy");
      }

      toast.success("Redeployment initiated!");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to redeploy");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setShowLogsSheet(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v3/deployments/${deployment.uid}/events?limit=100&direction=forward${getTeamQuery("&")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to fetch logs");
      }

      // Read raw text to handle JSON arrays, ndjson streams, or plain text safely
      const rawText = await response.text();
      let logsText = "";

      try {
        const parsed = JSON.parse(rawText);
        const eventsList = Array.isArray(parsed) ? parsed : (parsed.events || []);
        logsText = eventsList
          .map((e: any) =>
            e.text ||
            e.payload?.text ||
            e.payload?.message ||
            e.message ||
            (typeof e === "string" ? e : JSON.stringify(e))
          )
          .filter(Boolean)
          .join("\n");
      } catch {
        // Fallback for ndjson or plain text lines
        const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
        logsText = lines
          .map((line) => {
            try {
              const obj = JSON.parse(line);
              return obj.text || obj.payload?.text || obj.payload?.message || obj.message || line;
            } catch {
              return line;
            }
          })
          .join("\n");
      }

      setLogs(logsText || "No logs available for this deployment.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not fetch deployment logs";
      setLogs(`Failed to load logs: ${msg}`);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnvVars = async () => {
    setIsLoading(true);
    setShowEnvSheet(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env${getTeamQuery()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to fetch environment variables");
      }

      const data = await response.json();
      setEnvVars(
        (data.envs || []).map((env: any) => ({
          id: env.id,
          key: env.key,
          value: env.value ? env.value : "Encrypted",
          target: Array.isArray(env.target) ? env.target : (env.target ? [env.target] : []),
          type: env.type || "encrypted",
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch environment variables");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            aria-label="Deployment actions"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {deployment.state === "READY" && (
            <>
              <DropdownMenuItem onClick={handlePromoteToProduction} disabled={isLoading}>
                <Rocket className="mr-2 h-4 w-4" />
                Promote to Production
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAliasDialog(true)}>
                <Link2 className="mr-2 h-4 w-4" />
                Assign Domain Alias
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={handleRedeploy} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Redeploy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={fetchLogs}>
            <FileText className="mr-2 h-4 w-4" />
            View Logs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={fetchEnvVars}>
            <Settings className="mr-2 h-4 w-4" />
            View Environment Variables
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Deployment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alias Dialog */}
      <Dialog open={showAliasDialog} onOpenChange={setShowAliasDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Domain Alias</DialogTitle>
            <DialogDescription>
              Enter a custom domain to assign to this deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alias">Domain</Label>
              <Input
                id="alias"
                placeholder="e.g., my-feature.example.com"
                value={aliasValue}
                onChange={(e) => setAliasValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAssignAlias();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAliasDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAlias} disabled={isLoading}>
              Assign Alias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Sheet */}
      <Sheet open={showLogsSheet} onOpenChange={setShowLogsSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Deployment Logs</SheetTitle>
            <SheetDescription>
              Build and runtime logs for {deployment.url}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {isLoading ? "Loading logs..." : logs}
              </pre>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Environment Variables Sheet */}
      <Sheet open={showEnvSheet} onOpenChange={setShowEnvSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Environment Variables</SheetTitle>
            <SheetDescription>
              Variables configured for this project
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : envVars.length > 0 ? (
              <div className="space-y-3">
                {envVars.map((env) => (
                  <div
                    key={env.id || env.key}
                    className="p-3 border rounded-lg bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <span className="font-mono text-sm font-semibold">{env.key}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {env.target?.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {env.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {env.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No environment variables found
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deployment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deployment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
