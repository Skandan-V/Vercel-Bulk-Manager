"use client";

import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Skeleton } from "./components/ui/skeleton";
import { Alert, AlertDescription } from "./components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Rocket, FolderX, ArrowLeft, ShieldCheck } from "lucide-react";
import { DeploymentsTable } from "./components/DeploymentsTable";
import { ProjectsTable } from "./components/ProjectsTable";
import { ThemeToggle } from "./components/ThemeToggle";
import { ProfileMenu } from "./components/ProfileMenu";
import { DeploymentFilters } from "./components/DeploymentFilters";
import { Footer } from "./components/Footer";
import { ProjectEnvironment } from "./components/ProjectEnvironment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

interface VercelProject {
  id: string;
  name: string;
}

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

interface VercelUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

type ViewMode = "select" | "deployments" | "projects";

const STORAGE_KEY = "vercel_api_token";

export default function App() {
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("select");
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [userInfo, setUserInfo] = useState<VercelUser | null>(null);
  const [selectedDeployments, setSelectedDeployments] = useState<Set<string>>(new Set());
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"deployments" | "projects">("deployments");
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [isValidatingStoredToken, setIsValidatingStoredToken] = useState(false);
  const [tokenError, setTokenError] = useState<string>("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Load token from localStorage on mount
  useEffect(() => {
    const validateStoredToken = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEY);
      if (savedToken) {
        setIsValidatingStoredToken(true);
        const isValid = await verifyToken(savedToken);
        if (isValid) {
          setToken(savedToken);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          toast.error("Stored token is invalid or expired. Please enter a new token.");
        }
        setIsValidatingStoredToken(false);
      }
    };
    
    validateStoredToken();
  }, []);

  // Fetch projects when token is available
  useEffect(() => {
    if (token) {
      fetchUserInfo();
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch deployments when project is selected in deployment view
  useEffect(() => {
    if (selectedProjectId && token && viewMode === "deployments") {
      fetchDeployments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, viewMode]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      setUserInfo(data.user);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      // If we get user data, the token is valid
      return !!data.user;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch("https://api.vercel.com/v9/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects. Please check your API token.");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch projects");
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchDeployments = async () => {
    setIsLoadingDeployments(true);
    setSelectedDeployments(new Set());
    try {
      const response = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${selectedProjectId}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }

      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch deployments");
      setDeployments([]);
    } finally {
      setIsLoadingDeployments(false);
    }
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a valid API token");
      setTokenError("Token cannot be empty");
      return;
    }
    
    setTokenError("");
    setIsVerifyingToken(true);
    const isValid = await verifyToken(tokenInput.trim());
    
    if (!isValid) {
      setIsVerifyingToken(false);
      setTokenError("Invalid or expired API token. Please check your token and try again.");
      toast.error("Invalid token. Please check your API token and try again.");
      return;
    }
    
    setTokenError("");
    localStorage.setItem(STORAGE_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
    setIsVerifyingToken(false);
    toast.success("Token verified and saved successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setTokenInput("");
    setProjects([]);
    setDeployments([]);
    setSelectedProjectId("");
    setSelectedProjects(new Set());
    setSelectedDeployments(new Set());
    setViewMode("select");
    toast.success("Token removed");
  };

  const handleDeleteDeployments = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    const deploymentIds = Array.from(selectedDeployments);
    toast.info(`Deleting ${deploymentIds.length} deployment${deploymentIds.length > 1 ? 's' : ''}...`);

    const deletePromises = deploymentIds.map((id) =>
      fetch(`https://api.vercel.com/v13/deployments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    const results = await Promise.allSettled(deletePromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      toast.error(`Deleted ${successful} deployments, ${failed} failed`);
    } else {
      toast.success(`Successfully deleted ${successful} deployment${successful > 1 ? 's' : ''}`);
    }

    setIsDeleting(false);
    setSelectedDeployments(new Set());
    
    // Refresh deployments
    if (selectedProjectId) {
      fetchDeployments();
    }
  };

  const handleDeleteProjects = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    const projectIds = Array.from(selectedProjects);
    toast.info(`Deleting ${projectIds.length} project${projectIds.length > 1 ? 's' : ''}...`);

    const deletePromises = projectIds.map((id) =>
      fetch(`https://api.vercel.com/v9/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    const results = await Promise.allSettled(deletePromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      toast.error(`Deleted ${successful} projects, ${failed} failed`);
    } else {
      toast.success(`Successfully deleted ${successful} project${successful > 1 ? 's' : ''}`);
    }

    setIsDeleting(false);
    setSelectedProjects(new Set());
    
    // Refresh projects
    fetchProjects();
  };

  const handleDeleteClick = () => {
    setDeleteType(viewMode === "deployments" ? "deployments" : "projects");
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteType === "deployments") {
      await handleDeleteDeployments();
    } else {
      await handleDeleteProjects();
    }
  };

  const toggleDeploymentSelection = (uid: string) => {
    const newSelection = new Set(selectedDeployments);
    if (newSelection.has(uid)) {
      newSelection.delete(uid);
    } else {
      newSelection.add(uid);
    }
    setSelectedDeployments(newSelection);
  };

  const handleDeleteSingleDeployment = async (uid: string) => {
    setIsDeleting(true);
    toast.info("Deleting deployment...");

    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete deployment");
      }

      toast.success("Deployment deleted successfully");
      
      // Remove from selection if it was selected
      const newSelection = new Set(selectedDeployments);
      newSelection.delete(uid);
      setSelectedDeployments(newSelection);
      
      // Refresh deployments
      if (selectedProjectId) {
        fetchDeployments();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete deployment");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProjectSelection = (id: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProjects(newSelection);
  };

  const toggleSelectAllDeployments = () => {
    if (selectedDeployments.size === filteredDeployments.length) {
      setSelectedDeployments(new Set());
    } else {
      setSelectedDeployments(new Set(filteredDeployments.map((d) => d.uid)));
    }
  };

  const toggleSelectAllProjects = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map((p) => p.id)));
    }
  };

  const handleBackToSelect = () => {
    setViewMode("select");
    setSelectedProjectId("");
    setSelectedProjects(new Set());
    setSelectedDeployments(new Set());
    clearFilters();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBranch("all");
    setSelectedState("all");
    setDateRange({});
  };

  // Get unique branches from deployments
  const uniqueBranches = Array.from(
    new Set(
      deployments
        .map((d) => d.meta?.githubCommitRef)
        .filter(Boolean) as string[]
    )
  ).sort();

  // Filter deployments based on filters
  const filteredDeployments = deployments.filter((deployment) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesUrl = deployment.url.toLowerCase().includes(query);
      const matchesCommitMessage = deployment.meta?.githubCommitMessage?.toLowerCase().includes(query);
      if (!matchesUrl && !matchesCommitMessage) return false;
    }

    // Branch filter
    if (selectedBranch !== "all" && deployment.meta?.githubCommitRef !== selectedBranch) {
      return false;
    }

    // State filter
    if (selectedState !== "all" && deployment.state !== selectedState) {
      return false;
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const deploymentDate = new Date(deployment.created);
      if (dateRange.from && deploymentDate < dateRange.from) return false;
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (deploymentDate > toDate) return false;
      }
    }

    return true;
  });

  // Count active filters
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedBranch !== "all" ? 1 : 0) +
    (selectedState !== "all" ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0);

  // Show loading screen while validating stored token
  if (isValidatingStoredToken) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <img src="/logo.svg" alt="Hyperdyn Logo" className="h-8 w-8" />
              </div>
              <div>
                <CardTitle>Vercel Bulk Manager</CardTitle>
                <CardDescription className="mt-1">
                  Verifying stored credentials...
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Validating your API token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show token input if no token
  if (!token) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <a
              href="https://app.storylane.io/share/riih1a39wtdg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-6 px-2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              aria-label="View demo guide"
            >
              Tutorial
            </a>
            <ThemeToggle />
          </div>
          <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <img src="/logo.svg" alt="Hyperdyn Logo" className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Vercel Bulk Manager
                  <span className="text-xs font-normal text-muted-foreground">by Hyperdyn</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Powerful bulk deployment & project management
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                Your token is stored locally in your browser. We don't store or transmit your credentials.
              </AlertDescription>
            </Alert>
            
            {tokenError && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {tokenError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="token">Vercel API Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your token..."
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setTokenError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveToken();
                  }
                }}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Create a token in your{" "}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel account settings
                </a>
              </p>
            </div>
            <Button onClick={handleSaveToken} className="w-full h-11" disabled={isVerifyingToken}>
              {isVerifyingToken ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying Token...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardContent>
        </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Show feature selection
  if (viewMode === "select") {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Hyperdyn Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <div>
                <h1 className="text-2xl sm:text-3xl">
                  {userInfo?.name ? `Hey, ${userInfo.name.split(" ")[0]}!` : "Vercel Manager"}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Choose a management option
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://app.storylane.io/share/riih1a39wtdg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-6 px-2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                aria-label="View demo guide"
              >
                Tutorial
              </a>
              <ThemeToggle />
              <ProfileMenu onLogout={handleLogout} userInfo={userInfo} />
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
              Your API token is stored securely in your browser's localStorage. We never send your token to any external servers.
            </AlertDescription>
          </Alert>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Manage Deployments Card */}
            <Card 
              className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all group"
              onClick={() => setViewMode("deployments")}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-colors">
                    <Rocket className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">Manage Deployments</CardTitle>
                  <CardDescription className="text-sm">
                    Select a project and manage its deployments. View details, filter by branch, and bulk delete multiple deployments.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-11 group-hover:bg-primary/90">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Delete Projects Card */}
            <Card 
              className="cursor-pointer hover:shadow-xl hover:border-destructive/50 transition-all group"
              onClick={() => setViewMode("projects")}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 group-hover:from-red-500/20 group-hover:to-orange-500/20 transition-colors">
                    <FolderX className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">Bulk Delete Projects</CardTitle>
                  <CardDescription className="text-sm">
                    View all projects in one place. Select multiple projects and delete them permanently with a single action.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full h-11 group-hover:bg-destructive/90">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show deployments management view
  if (viewMode === "deployments") {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={handleBackToSelect} className="shrink-0 h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img src="/logo.svg" alt="Hyperdyn Logo" className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl truncate">Manage Deployments</h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  Select a project to view deployments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://app.storylane.io/share/riih1a39wtdg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-6 px-2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                aria-label="View demo guide"
              >
                Tutorial
              </a>
              <ThemeToggle />
              <ProfileMenu onLogout={handleLogout} userInfo={userInfo} />
            </div>
          </div>

          {/* Project Selection */}
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Select Project</CardTitle>
              <CardDescription className="text-sm">
                Choose a project to manage its deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Select
                  value={selectedProjectId}
                  onValueChange={(value: string) => {
                    setSelectedProjectId(value);
                    setSelectedDeployments(new Set());
                    clearFilters();
                  }}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Project Management Tabs */}
          {selectedProjectId && (
            <Tabs defaultValue="deployments" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="deployments">Deployments</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
              </TabsList>

              <TabsContent value="deployments" className="space-y-0">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-lg">Deployments</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {filteredDeployments.length > 0
                            ? `${filteredDeployments.length} of ${deployments.length} deployment${deployments.length !== 1 ? 's' : ''}`
                            : "No deployments found"}
                        </CardDescription>
                      </div>
                      {selectedDeployments.size > 0 && (
                        <Button
                          variant="destructive"
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          className="h-10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Delete Selected </span>
                          ({selectedDeployments.size})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DeploymentFilters
                      branches={uniqueBranches}
                      selectedBranch={selectedBranch}
                      onBranchChange={setSelectedBranch}
                      selectedState={selectedState}
                      onStateChange={setSelectedState}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      onClearFilters={clearFilters}
                      activeFilterCount={activeFilterCount}
                    />
                    <DeploymentsTable
                      deployments={filteredDeployments}
                      selectedDeployments={selectedDeployments}
                      isLoading={isLoadingDeployments}
                      token={token}
                      projectId={selectedProjectId}
                      onToggleSelection={toggleDeploymentSelection}
                      onToggleSelectAll={toggleSelectAllDeployments}
                      onUpdate={fetchDeployments}
                      onDeleteSingle={handleDeleteSingleDeployment}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="environment">
                <ProjectEnvironment projectId={selectedProjectId} token={token} />
              </TabsContent>
            </Tabs>
          )}

          {/* Delete Confirmation Dialog for Deployments */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    You are about to permanently delete{" "}
                    <strong className="text-foreground">
                      {selectedDeployments.size}{" "}
                      deployment{selectedDeployments.size !== 1 ? 's' : ''}
                    </strong>
                    . This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Footer />
      </div>
    );
  }

  // Show projects bulk delete view
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBackToSelect} className="shrink-0 h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src="/logo.svg" alt="Hyperdyn Logo" className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl truncate">Bulk Delete Projects</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                Select and delete multiple projects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://app.storylane.io/share/riih1a39wtdg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-6 px-2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              aria-label="View demo guide"
            >
              Tutorial
            </a>
            <ThemeToggle />
            <ProfileMenu onLogout={handleLogout} userInfo={userInfo} />
          </div>
        </div>

        {/* Projects Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-lg">All Projects</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {projects.length > 0
                    ? `${projects.length} project${projects.length !== 1 ? 's' : ''} found`
                    : "No projects found"}
                </CardDescription>
              </div>
              {selectedProjects.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="h-10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Delete Selected </span>
                  ({selectedProjects.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ProjectsTable
              projects={projects}
              selectedProjects={selectedProjects}
              isLoading={isLoadingProjects}
              onToggleSelection={toggleProjectSelection}
              onToggleSelectAll={toggleSelectAllProjects}
              userInfo={userInfo}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You are about to permanently delete{" "}
                  <strong className="text-foreground">
                    {deleteType === "deployments" ? selectedDeployments.size : selectedProjects.size}{" "}
                    {deleteType === "deployments" ? "deployment" : "project"}
                    {(deleteType === "deployments" ? selectedDeployments.size : selectedProjects.size) !== 1 ? 's' : ''}
                  </strong>
                  . This action cannot be undone.
                </p>
                {deleteType === "projects" && (
                  <p className="font-medium text-destructive">
                    ⚠️ Warning: Deleting projects will also delete all associated deployments, domains, and environment variables.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </div>
  );
}
