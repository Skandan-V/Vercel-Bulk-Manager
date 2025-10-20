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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
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
  onDelete: () => void;
  onUpdate: () => void;
}

export function DeploymentActions({
  deployment,
  token,
  projectId,
  onDelete,
  onUpdate,
}: DeploymentActionsProps) {
  const [showAliasDialog, setShowAliasDialog] = useState(false);
  const [showLogsSheet, setShowLogsSheet] = useState(false);
  const [showEnvSheet, setShowEnvSheet] = useState(false);
  const [aliasValue, setAliasValue] = useState("");
  const [logs, setLogs] = useState<string>("");
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromoteToProduction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v13/deployments/${deployment.uid}/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to promote deployment");

      toast.success("Deployment promoted to production!");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to promote deployment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAlias = async () => {
    if (!aliasValue.trim()) {
      toast.error("Please enter a valid domain");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v2/deployments/${deployment.uid}/aliases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alias: aliasValue }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign alias");

      toast.success(`Alias assigned: ${aliasValue}`);
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
      const response = await fetch(
        `https://api.vercel.com/v13/deployments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deploymentId: deployment.uid,
            target: "production",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to redeploy");

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
        `https://api.vercel.com/v2/deployments/${deployment.uid}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      const logsText = data.events?.map((e: any) => e.text || e.payload?.text).filter(Boolean).join("\n") || "No logs available";
      setLogs(logsText);
    } catch (error) {
      setLogs("Failed to load logs. This might be due to API limitations.");
      toast.error("Could not fetch deployment logs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnvVars = async () => {
    setIsLoading(true);
    setShowEnvSheet(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch environment variables");

      const data = await response.json();
      setEnvVars(
        data.envs?.map((env: any) => ({
          key: env.key,
          value: env.value ? "********" : "Not set",
        })) || []
      );
    } catch (error) {
      toast.error("Could not fetch environment variables");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
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
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
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
              Variables applied to this deployment
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : envVars.length > 0 ? (
              <div className="space-y-3">
                {envVars.map((env, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-muted/30 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {env.key}
                      </Badge>
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
    </>
  );
}
