import { LogOut, Users, User, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface VercelUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
}

interface ProfileMenuProps {
  onLogout: () => void;
  userInfo?: VercelUser | null;
  teams?: VercelTeam[];
  selectedTeamId?: string | null;
  onSelectTeam?: (teamId: string | null) => void;
}

export function ProfileMenu({
  onLogout,
  userInfo,
  teams = [],
  selectedTeamId = null,
  onSelectTeam,
}: ProfileMenuProps) {
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.trim().substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().substring(0, 1).toUpperCase();
    }
    return "V";
  };

  const activeTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          aria-label="User account menu"
        >
          <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {activeTeam
                ? getInitials(activeTeam.name)
                : getInitials(userInfo?.name, userInfo?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{userInfo?.name || "Account"}</p>
            {userInfo?.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">{userInfo.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        
        {teams.length > 0 && onSelectTeam && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Scope / Team
            </div>
            <DropdownMenuItem
              onClick={() => onSelectTeam(null)}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Personal ({userInfo?.username || "Account"})</span>
              </div>
              {selectedTeamId === null && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>

            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className="cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{team.name}</span>
                </div>
                {selectedTeamId === team.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Remove Token</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
