import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ProfileHistoryTab,
  ProfileFavoritesTab,
  ProfileFoldersTab,
} from "../components/features/profile";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useDebounce } from "../hooks/useDebounce";
import { History, Heart, LogOut, FolderOpen, Search } from "lucide-react";

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const tabs = [
    { id: "history", label: "История просмотра", icon: History },
    { id: "favorites", label: "Избранное", icon: Heart },
    { id: "folders", label: "Папки", icon: FolderOpen },
  ];

  const tabContent = {
    history: <ProfileHistoryTab searchQuery={debouncedSearchQuery} />,
    favorites: <ProfileFavoritesTab searchQuery={debouncedSearchQuery} />,
    folders: <ProfileFoldersTab searchQuery={debouncedSearchQuery} />,
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
            Профиль
          </h1>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="secondary"
          size="md"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти</span>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2 border-b border-zinc-700/50 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all w-full sm:w-auto ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Input
          startContent={<Search className="w-5 h-5 text-zinc-500" />}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Поиск в ${activeTab === "history" ? "истории просмотра" : activeTab === "favorites" ? "избранном" : "папках"}...`}
          className="max-w-md"
        />
      </div>

      {tabContent[activeTab]}
    </div>
  );
}

export default ProfilePage;
