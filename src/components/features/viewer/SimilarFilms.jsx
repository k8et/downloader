import MovieCard from '../movies/MovieCard'

function SimilarFilms({ films }) {
    if (!films || films.length === 0) return null

    const filmsWithIds = films.map(film => ({
        ...film,
        kinopoiskId: film.filmId || film.kinopoiskId
    }))

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-light text-zinc-100 flex items-center gap-2">
                Похожие фильмы
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {filmsWithIds.map((film) => (
                    <MovieCard key={film.filmId || film.kinopoiskId} movie={film} />
                ))}
            </div>
        </div>
    )
}

export default SimilarFilms

