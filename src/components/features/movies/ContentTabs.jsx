import { Film, Tv, Sparkles } from 'lucide-react'

const tabs = [
    { id: 'all', label: 'Все', icon: Film },
    { id: 'films', label: 'Фильмы', icon: Film },
    { id: 'series', label: 'Сериалы', icon: Tv },
    { id: 'anime', label: 'Аниме', icon: Sparkles }
]

function ContentTabs({ activeTab, onTabChange }) {
    return (
        <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${isActive
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
        </div>
    )
}

export default ContentTabs

