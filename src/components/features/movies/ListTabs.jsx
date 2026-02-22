import { Film, Tv, TrendingUp, Star, Award, DollarSign } from 'lucide-react'

const LIST_ICONS = {
    '': Film,
    'popular': TrendingUp,
    'popular-films': Film,
    'top250': Star,
    'top500': Star,
    'box-total': DollarSign,
    'box-usa-all-time': DollarSign,
    'oscar-visual-effects': Award
}

function ListTabs({ lists, activeList, onListChange }) {
    return (
        <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-3">Подборки</p>
            <div className="flex flex-wrap gap-2">
                {lists.map((list) => {
                    const Icon = LIST_ICONS[list.value] || Film
                    const isActive = activeList === list.value
                    return (
                        <button
                            key={list.value || 'default'}
                            onClick={() => onListChange(list.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {list.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default ListTabs
