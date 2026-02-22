import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { filterFilmItems } from "./filterFilmItems";
import {
  useFolders,
  useFolderItems,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useRemoveFromFolder,
} from "../../../api/supabase/hooks";
import MovieCard from "../movies/MovieCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import AlertDeleteModal from "../../ui/AlertDeleteModal";
import {
  FolderOpen,
  FolderPlus,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";

function ProfileFoldersTab({ searchQuery }) {
  const { user } = useAuth();
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [openMenuFolderId, setOpenMenuFolderId] = useState(null);
  const menuRef = useRef(null);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const editInputRef = useRef(null);

  const {
    data: folders = [],
    isLoading: loadingFolders,
    error: foldersError,
  } = useFolders(user?.id, {
    enabled: !!user,
  });

  const { data: folderItemsRaw = [], isLoading: loadingItems } = useFolderItems(
    user?.id,
    selectedFolderId,
    { enabled: !!user && !!selectedFolderId },
  );

  const folderItems = useMemo(
    () => filterFilmItems(folderItemsRaw, searchQuery),
    [folderItemsRaw, searchQuery],
  );

  const createMutation = useCreateFolder();
  const updateMutation = useUpdateFolder();
  const deleteMutation = useDeleteFolder();
  const removeFromFolderMutation = useRemoveFromFolder();

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    try {
      await createMutation.mutateAsync({
        userId: user.id,
        name: newFolderName.trim(),
      });
      setNewFolderName("");
      setShowCreateModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFolder = async () => {
    if (!user || !editingFolderId || !editingName.trim()) return;
    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        folderId: editingFolderId,
        name: editingName.trim(),
      });
      setEditingFolderId(null);
      setEditingName("");
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingFolderId(null);
    setEditingName("");
  };

  useEffect(() => {
    if (showEditModal) editInputRef.current?.focus();
  }, [showEditModal]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuFolderId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteFolder = async (folderId) => {
    if (!user) return;
    await deleteMutation.mutateAsync({ userId: user.id, folderId });
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  };

  const handleRemoveFromFolder = async (kinopoiskId) => {
    if (!user || !selectedFolderId) return;
    try {
      await removeFromFolderMutation.mutateAsync({
        userId: user.id,
        folderId: selectedFolderId,
        kinopoiskId,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingFolders) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-blue-500 mb-4" />
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    );
  }

  if (foldersError) {
    return (
      <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
        {foldersError.message || "Ошибка загрузки"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex  gap-2 pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800 border border-zinc-600/50 hover:border-blue-500/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-blue-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Новая папка</span>
          </button>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                selectedFolderId === folder.id
                  ? "bg-blue-600/20 border-blue-500 text-blue-400"
                  : "bg-zinc-800 border-zinc-600/50 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100"
              }`}
            >
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className="flex items-center gap-2 min-w-0"
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {folder.name}
                </span>
              </button>
              <div
                ref={openMenuFolderId === folder.id ? menuRef : null}
                className="relative ml-1"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuFolderId((v) => (v === folder.id ? null : folder.id));
                  }}
                  className="p-1 rounded-full text-zinc-500 hover:text-zinc-200 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Действия"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenuFolderId === folder.id && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[140px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        openEditModal(folder);
                        setOpenMenuFolderId(null);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50"
                    >
                      <Pencil className="w-4 h-4 text-zinc-400" />
                      Изменить
                    </button>
                    <button
                      onClick={() => {
                        setFolderToDelete(folder);
                        setOpenMenuFolderId(null);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {folders.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <FolderPlus className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 mb-2">Нет папок</p>
         
        </div>
      )}
      {folders.length > 0 && (
        <div className="flex-1 min-w-0">
          {selectedFolderId ? (
            loadingItems ? (
              <div className="text-center py-16">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-zinc-400 animate-spin" />
              </div>
            ) : folderItems.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                {searchQuery && folderItemsRaw.length > 0 ? (
                  <>
                    <Search className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-400">Ничего не найдено</p>
                    <p className="text-zinc-500 text-sm mt-2">
                      Попробуйте изменить поисковый запрос
                    </p>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-400">Папка пуста</p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Добавляйте фильмы кнопкой на карточках
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                {searchQuery && (
                  <div className="mb-4 text-sm text-zinc-400">
                    Найдено: {folderItems.length} из {folderItemsRaw.length}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {folderItems.map((item) => (
                    <MovieCard
                      key={item.kinopoisk_id}
                      movie={item.film_data}
                      hideFavorite={true}
                      onRemove={() => handleRemoveFromFolder(item.kinopoisk_id)}
                    />
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="text-center py-20 text-zinc-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">Выберите папку</p>
              <p className="text-zinc-500 text-sm mt-1">
                Нажмите на папку выше, чтобы посмотреть фильмы
              </p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewFolderName("");
        }}
        title="Новая папка"
      >
        <div className="space-y-4">
          <Input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            placeholder="Введите название папки"
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewFolderName("");
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Создание..." : "Создать"}
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDeleteModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={() =>
          folderToDelete
            ? handleDeleteFolder(folderToDelete.id)
            : Promise.resolve()
        }
        title="Удалить папку?"
        message={
          folderToDelete
            ? `Папка «${folderToDelete.name}» и все фильмы в ней будут удалены.`
            : ""
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={deleteMutation.isPending}
      />

      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Редактировать папку"
      >
        <div className="space-y-4">
          <Input
            ref={editInputRef}
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateFolder();
              if (e.key === "Escape") closeEditModal();
            }}
            placeholder="Название папки"
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeEditModal}>
              Отмена
            </Button>
            <Button
              onClick={handleUpdateFolder}
              disabled={!editingName.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProfileFoldersTab;
