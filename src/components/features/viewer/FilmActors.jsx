import { Users, Film } from 'lucide-react'

function FilmActors({ staff }) {
    if (!staff || staff.length === 0) return null

    const actors = staff
        .filter(person => person.professionKey === 'ACTOR' || person.professionKey === 'DIRECTOR')
        .slice(0, 12)

    if (actors.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-light text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Актеры и режиссеры
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {actors.map((actor) => (
                    <div
                        key={actor.staffId}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden hover:bg-zinc-700/50 transition-all group"
                    >
                        {actor.posterUrl ? (
                            <div className="w-full aspect-[2/3] bg-zinc-900 overflow-hidden">
                                <img
                                    src={actor.posterUrl}
                                    alt={actor.nameRu || actor.nameEn}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center">
                                <Film className="w-8 h-8 text-zinc-600" />
                            </div>
                        )}
                        <div className="p-3">
                            <p className="text-sm font-medium text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                                {actor.nameRu || actor.nameEn}
                            </p>
                            {actor.professionText && (
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                    {actor.professionText}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FilmActors

