import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
import { toast } from "sonner@2.0.3";
import { Plus, Trash2, Eye, EyeOff, Save, Download } from "lucide-react";
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
}

export function ProjectEnvironment({ projectId, token }: ProjectEnvironmentProps) {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [envToDelete, setEnvToDelete] = useState<string | null>(null);
  
  // New env form
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTarget, setNewTarget] = useState<string[]>(["production", "preview", "development"]);

  useEffect(() => {
    fetchEnvVars();
  }, [projectId]);

  const fetchEnvVars = async () => {
    setIsLoading(true);
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
      setEnvVars(data.envs || []);
    } catch (error) {
      toast.error("Could not fetch environment variables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEnvVar = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("Please provide both key and value");
      return;
    }

    try {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: newKey,
            value: newValue,
            target: newTarget,
            type: "encrypted",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add environment variable");

      toast.success("Environment variable added successfully");
      setShowAddDialog(false);
      setNewKey("");
      setNewValue("");
      setNewTarget(["production", "preview", "development"]);
      fetchEnvVars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add variable");
    }
  };

  const handleDeleteEnvVar = async (id: string) => {
    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete environment variable");

      toast.success("Environment variable deleted");
      setShowDeleteDialog(false);
      setEnvToDelete(null);
      fetchEnvVars();
    } catch (error) {
      toast.error("Failed to delete variable");
    }
  };

  const toggleShowValue = (id: string) => {
    const newShowValues = new Set(showValues);
    if (newShowValues.has(id)) {
      newShowValues.delete(id);
    } else {
      newShowValues.add(id);
    }
    setShowValues(newShowValues);
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
      // Fetch full env vars with actual values
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
      const envs = data.envs || [];

      // Create content in varname=value format
      const content = envs
        .map((env: any) => {
          // Note: Vercel API may not return actual values for security
          // We'll export with the key and a placeholder
          return `${env.key}=${env.value || "***ENCRYPTED_VALUE***"}`;
        })
        .join("\n");

      // Create and download file
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vercel-env-${projectId}-${Date.now()}.txt`;
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
            <p>No environment variables configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {envVars.map((env) => (
            <Card key={env.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono">
                        {env.key}
                      </Badge>
                      {env.target.map((target) => (
                        <Badge key={target} variant="secondary" className="text-xs">
                          {target}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showValues.has(env.id) ? "text" : "password"}
                        value={env.value || "********"}
                        readOnly
                        className="h-9 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleShowValue(env.id)}
                        className="h-9 w-9"
                      >
                        {showValues.has(env.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
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
                    className="h-9 w-9 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Variable Dialog */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Environment Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new environment variable to your project
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="e.g., DATABASE_URL"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="password"
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
                  >
                    {target}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddEnvVar}>
              <Save className="mr-2 h-4 w-4" />
              Add Variable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment Variable?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The variable will be removed from all environments.
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
