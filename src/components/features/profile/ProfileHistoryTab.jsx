import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { removeFromWatchHistory } from "../../../lib/supabaseQueries";
import { useWatchHistory } from "../../../api/supabase/hooks";
import MovieCard from "../movies/MovieCard";
import { History, Search } from "lucide-react";
import { filterFilmItems } from "./filterFilmItems";

function ProfileHistoryTab({ searchQuery }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, error } = useWatchHistory(user?.id, {
    enabled: !!user,
  });

  const filteredItems = useMemo(
    () => filterFilmItems(items, searchQuery),
    [items, searchQuery]
  );

  const handleRemove = async (kinopoiskId) => {
    if (!user) return;
    try {
      const { error } = await removeFromWatchHistory(user.id, kinopoiskId);
      if (error) throw error;
      queryClient.setQueryData(["watchHistory", user.id], (old) =>
        (old || []).filter((item) => item.kinopoisk_id !== kinopoiskId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-blue-500 mb-4" />
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
        {error.message || "Ошибка загрузки"}
      </div>
    );
  }

  const isEmpty = items.length === 0;
  const isSearchEmpty = filteredItems.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <History className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
        <p className="text-zinc-400">История просмотра пуста</p>
      </div>
    );
  }

  if (isSearchEmpty) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <Search className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
        <p className="text-zinc-400">Ничего не найдено</p>
        <p className="text-zinc-500 text-sm mt-2">
          Попробуйте изменить поисковый запрос
        </p>
      </div>
    );
  }

  return (
    <>
      {searchQuery && (
        <div className="mb-4 text-sm text-zinc-400">
          Найдено: {filteredItems.length} из {items.length}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {filteredItems.map((item) => (
          <MovieCard
            key={item.kinopoisk_id}
            movie={item.film_data}
            hideFavorite={true}
            onRemove={() => handleRemove(item.kinopoisk_id)}
          />
        ))}
      </div>
    </>
  );
}

export default ProfileHistoryTab;
