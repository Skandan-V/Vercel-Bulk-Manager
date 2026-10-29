import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
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
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Save, Download, Copy, Check, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  target: string[];
  type: string;
}

interface ProjectEnvironmentProps {
  projectId: string;
  token: string;
  teamId?: string;
}

export function ProjectEnvironment({ projectId, token, teamId }: ProjectEnvironmentProps) {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [decryptingIds, setDecryptingIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAddingEnv, setIsAddingEnv] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [envToDelete, setEnvToDelete] = useState<string | null>(null);
  
  // New env form
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTarget, setNewTarget] = useState<string[]>(["production", "preview", "development"]);

  useEffect(() => {
    fetchEnvVars();
  }, [projectId, teamId]);

  const getTeamQuery = () => (teamId ? `?teamId=${encodeURIComponent(teamId)}` : "");

  const fetchEnvVars = async () => {
    setIsLoading(true);
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
          ...env,
          target: Array.isArray(env.target) ? env.target : (env.target ? [env.target] : []),
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch environment variables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEnvVar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedKey = newKey.trim();
    if (!trimmedKey) {
      toast.error("Please enter a variable key");
      return;
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmedKey)) {
      toast.error("Variable key must start with a letter/underscore and contain only alphanumeric characters or underscores");
      return;
    }

    if (!newValue) {
      toast.error("Please enter a variable value");
      return;
    }

    if (newTarget.length === 0) {
      toast.error("Please select at least one environment target (Production, Preview, or Development)");
      return;
    }

    setIsAddingEnv(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env${getTeamQuery()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: trimmedKey,
            value: newValue,
            target: newTarget,
            type: "encrypted",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to add environment variable");
      }

      toast.success("Environment variable added successfully");
      setShowAddDialog(false);
      setNewKey("");
      setNewValue("");
      setNewTarget(["production", "preview", "development"]);
      fetchEnvVars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add variable");
    } finally {
      setIsAddingEnv(false);
    }
  };

  const handleDeleteEnvVar = async (id: string) => {
    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${id}${getTeamQuery()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to delete environment variable");
      }

      toast.success("Environment variable deleted");
      setShowDeleteDialog(false);
      setEnvToDelete(null);
      fetchEnvVars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete variable");
    }
  };

  const toggleShowValue = async (id: string) => {
    const isShowing = showValues.has(id);
    if (isShowing) {
      const next = new Set(showValues);
      next.delete(id);
      setShowValues(next);
      return;
    }

    // Check if we need to fetch decrypted value
    const currentEnv = envVars.find((e) => e.id === id);
    if (currentEnv && (!currentEnv.value || currentEnv.value === "********")) {
      setDecryptingIds((prev) => new Set(prev).add(id));
      try {
        const res = await fetch(
          `https://api.vercel.com/v1/projects/${projectId}/env/${id}${getTeamQuery()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const detail = await res.json();
          if (detail && typeof detail.value === "string") {
            setEnvVars((prev) =>
              prev.map((e) => (e.id === id ? { ...e, value: detail.value } : e))
            );
          }
        }
      } catch (err) {
        console.warn("Could not decrypt env value:", err);
      } finally {
        setDecryptingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }

    const next = new Set(showValues);
    next.add(id);
    setShowValues(next);
  };

  const copyToClipboard = async (id: string, text: string) => {
    if (!text || text === "********") {
      // First try to fetch the decrypted value to copy
      try {
        const res = await fetch(
          `https://api.vercel.com/v1/projects/${projectId}/env/${id}${getTeamQuery()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const detail = await res.json();
          if (detail && typeof detail.value === "string") {
            await navigator.clipboard.writeText(detail.value);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            toast.success("Copied to clipboard");
            return;
          }
        }
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const toggleTarget = (target: string) => {
    if (newTarget.includes(target)) {
      setNewTarget(newTarget.filter((t) => t !== target));
    } else {
      setNewTarget([...newTarget, target]);
    }
  };

  const handleExportEnvVars = async () => {
    if (envVars.length === 0) {
      toast.error("No environment variables to export");
      return;
    }

    try {
      // Try to fetch individual decrypted values where possible
      const enrichedEnvs = await Promise.all(
        envVars.map(async (env) => {
          if (env.value && env.value !== "********") {
            return `${env.key}=${env.value}`;
          }
          try {
            const res = await fetch(
              `https://api.vercel.com/v1/projects/${projectId}/env/${env.id}${getTeamQuery()}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && typeof data.value === "string") {
                return `${env.key}=${data.value}`;
              }
            }
          } catch {
            // fallback
          }
          return `${env.key}=${env.value || ""}`;
        })
      );

      const content = enrichedEnvs.join("\n");

      // Create and download file
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `.env.${projectId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Environment variables exported successfully");
    } catch (error) {
      toast.error("Failed to export environment variables");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg">Environment Variables</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage environment variables for this project
          </p>
        </div>
        <div className="flex gap-2">
          {envVars.length > 0 && (
            <Button variant="outline" onClick={handleExportEnvVars} className="h-10">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <Button onClick={() => setShowAddDialog(true)} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Variable</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {envVars.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No environment variables configured for this project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {envVars.map((env) => {
            const isVisible = showValues.has(env.id);
            const isDecrypting = decryptingIds.has(env.id);
            const displayValue = isVisible ? (env.value || "********") : "••••••••••••••••";
            const isCopied = copiedId === env.id;

            return (
              <Card key={env.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{env.key}</span>
                        {(env.target || []).map((target) => (
                          <Badge key={target} variant="secondary" className="text-xs">
                            {target}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type={isVisible ? "text" : "password"}
                          value={displayValue}
                          readOnly
                          className="h-9 text-xs font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleShowValue(env.id)}
                          disabled={isDecrypting}
                          className="h-9 w-9 shrink-0"
                          title={isVisible ? "Hide value" : "Show value"}
                        >
                          {isDecrypting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(env.id, env.value)}
                          className="h-9 w-9 shrink-0"
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEnvToDelete(env.id);
                        setShowDeleteDialog(true);
                      }}
                      className="h-9 w-9 text-destructive hover:text-destructive shrink-0"
                      title="Delete variable"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Variable Dialog (uses standard Dialog to prevent premature closing on error) */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddEnvVar}>
            <DialogHeader>
              <DialogTitle>Add Environment Variable</DialogTitle>
              <DialogDescription>
                Add a new environment variable to your project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="env-key">Key</Label>
                <Input
                  id="env-key"
                  placeholder="e.g., DATABASE_URL"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="h-10 font-mono"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env-value">Value</Label>
                <Input
                  id="env-value"
                  type="text"
                  placeholder="Enter value..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Environment Targets</Label>
                <div className="flex gap-2 flex-wrap">
                  {["production", "preview", "development"].map((target) => (
                    <Button
                      key={target}
                      type="button"
                      variant={newTarget.includes(target) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTarget(target)}
                      className="capitalize"
                    >
                      {target}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isAddingEnv}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingEnv}>
                {isAddingEnv ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Variable
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setEnvToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment Variable?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The variable will be permanently removed from all environments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => envToDelete && handleDeleteEnvVar(envToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
