export default function Loading() {
	return (
		<div className="min-h-screen bg-black">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-8">
					<div className="mx-auto h-8 w-64 rounded bg-gray-900/60 animate-pulse" />
					<div className="mx-auto mt-3 h-4 w-96 rounded bg-gray-900/60 animate-pulse" />
				</div>
				<div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
					<div className="lg:col-span-2 h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
					<div className="h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
					<div className="h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="rounded-2xl border border-purple-500/20 p-4">
							<div className="h-40 rounded-lg bg-gray-900/60 animate-pulse" />
							<div className="mt-4 h-5 w-2/3 rounded bg-gray-900/60 animate-pulse" />
							<div className="mt-2 h-4 w-full rounded bg-gray-900/60 animate-pulse" />
							<div className="mt-2 h-4 w-5/6 rounded bg-gray-900/60 animate-pulse" />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


