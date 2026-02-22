import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Film, Clapperboard } from 'lucide-react'

function PersonCard({ person }) {
    const Wrapper = person.staffId ? Link : 'div'
    const wrapperProps = person.staffId ? { to: `/person/${person.staffId}` } : {}

    return (
        <Wrapper
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden hover:bg-zinc-700/50 transition-all group cursor-pointer block no-underline text-inherit"
            {...wrapperProps}
        >
            {person.posterUrl ? (
                <div className="w-full aspect-[2/3] bg-zinc-900 overflow-hidden">
                    <img
                        src={person.posterUrl}
                        alt={person.nameRu || person.nameEn}
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
                    {person.nameRu || person.nameEn}
                </p>
                {person.professionText && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {person.professionText}
                    </p>
                )}
            </div>
        </Wrapper>
    )
}

function FilmActors({ staff }) {
    if (!staff || staff.length === 0) return null

    const directors = staff.filter(person => person.professionKey === 'DIRECTOR').slice(0, 8)
    const actors = staff.filter(person => person.professionKey === 'ACTOR').slice(0, 12)

    if (directors.length === 0 && actors.length === 0) return null

    const defaultTab = actors.length > 0 ? 'actors' : 'directors'
    const [activeTab, setActiveTab] = useState(defaultTab)

    const tabs = [
        { id: 'actors', label: 'Актеры', icon: Users, items: actors },
        { id: 'directors', label: 'Режиссеры', icon: Clapperboard, items: directors }
    ]

    const currentTab = tabs.find(t => t.id === activeTab && t.items.length > 0) || tabs.find(t => t.items.length > 0) || tabs[0]
    const displayItems = currentTab?.items ?? []

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {tabs.map((tab) => {
                    if (tab.items.length === 0) return null
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
            {displayItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayItems.map((person, idx) => (
                        <PersonCard key={person.staffId ?? `${currentTab.id}-${idx}`} person={person} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default FilmActors

