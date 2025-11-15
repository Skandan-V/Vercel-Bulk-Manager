import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface VercelUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface ProfileMenuProps {
  onLogout: () => void;
  userInfo?: VercelUser | null;
}

export function ProfileMenu({ onLogout, userInfo }: ProfileMenuProps) {
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 1).toUpperCase();
    }
    return "V";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(userInfo?.name, userInfo?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {userInfo?.name || "My Account"}
        </DropdownMenuLabel>
        {userInfo?.email && (
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
          </div>
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
