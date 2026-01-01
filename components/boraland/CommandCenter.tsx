import Link from 'next/link'

export default function CommandCenter() {
  return (
    <aside className="w-full lg:w-64 flex flex-col gap-4 shrink-0 overflow-y-auto lg:overflow-visible">
    <div className="bora-glass-panel rounded-2xl p-1 flex flex-col gap-1 h-full">
    <div className="p-4 mb-2 border-b border-white/5">
    <h2 className="font-display text-sm text-gray-500 uppercase tracking-widest mb-1">Command Center</h2>
    </div>
    
    <NavItem href="/boraland/inventory" icon="inventory_2" label="Inventory" subLabel="View collection" color="blue" />
    <NavItem href="/boraland/leaderboard" icon="trophy" label="Leaderboard" subLabel="Global Rankings" color="yellow" />
    <NavItem href="/boraland/mastery" icon="military_tech" label="Mastery" subLabel="Skill Tree" color="orange" />
    <NavItem href="/boraland/quests" icon="assignment_turned_in" label="Quests" subLabel="Daily challenges" color="green" />

    <div className="mt-auto p-4 border-t border-white/5">
    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg p-3 border border-white/10">
    <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-bold text-indigo-300 uppercase">Season 4</span>
    <span className="text-xs text-gray-400">24d left</span>
    </div>
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%]"></div>
    </div>
    </div>
    </div>
    </div>
    </aside>
  )
}

function NavItem({ href, icon, label, subLabel, color }: { href: string, icon: string, label: string, subLabel: string, color: string }) {
    // We construct the class strings explicitly to ensure Tailwind picks them up if they are safelisted, 
    // but better to map them to avoid dynamic class issues if not using JIT or safelist.
    // However, since we want to be exact to the HTML, let's map the specific classes.
    
    let colorClasses = {
        bg: '',
        text: '',
        hoverText: '',
        subText: '',
        shadow: '',
        gradient: ''
    }

    if (color === 'blue') {
        colorClasses = {
            bg: 'bg-blue-500/20',
            text: 'text-blue-400',
            hoverText: 'group-hover:text-blue-300',
            subText: 'group-hover:text-blue-400/80',
            shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]',
            gradient: 'from-blue-500/10'
        }
    } else if (color === 'yellow') {
        colorClasses = {
            bg: 'bg-yellow-500/20',
            text: 'text-yellow-400',
            hoverText: 'group-hover:text-yellow-300',
            subText: 'group-hover:text-yellow-400/80',
            shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.2)]',
            gradient: 'from-yellow-500/10'
        }
    } else if (color === 'orange') {
        colorClasses = {
            bg: 'bg-orange-500/20',
            text: 'text-orange-400',
            hoverText: 'group-hover:text-orange-300',
            subText: 'group-hover:text-orange-400/80',
            shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.2)]',
            gradient: 'from-orange-500/10'
        }
    } else if (color === 'green') {
        colorClasses = {
            bg: 'bg-green-500/20',
            text: 'text-green-400',
            hoverText: 'group-hover:text-green-300',
            subText: 'group-hover:text-green-400/80',
            shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.2)]',
            gradient: 'from-green-500/10'
        }
    }

    return (
        <Link className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all overflow-hidden" href={href}>
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center ${colorClasses.text} ${colorClasses.hoverText} group-hover:scale-110 transition-all ${colorClasses.shadow}`}>
        <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
        <div className="font-semibold text-gray-200 group-hover:text-white">{label}</div>
        <div className={`text-xs text-gray-500 ${colorClasses.subText}`}>{subLabel}</div>
        </div>
        </Link>
    )
}
