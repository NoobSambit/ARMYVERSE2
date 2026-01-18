'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Heart, Coffee, Server } from 'lucide-react'

interface DonationModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />

                {/* Modal Content */}
                <Dialog.Content className="fixed z-[101] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-lg rounded-[28px] border border-white/10 bg-[#121212] shadow-2xl overflow-hidden focus:outline-none animate-in zoom-in-95 duration-200">

                    {/* Decorative gradient */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />

                    {/* Close button */}
                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 focus:outline-none"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </Dialog.Close>

                    <div className="p-6 md:p-8 text-center relative z-0">
                        {/* Icon */}
                        <div className="size-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-900/20">
                            <Coffee className="text-white w-8 h-8" />
                        </div>

                        <Dialog.Title className="text-2xl font-bold text-white mb-2">Support ARMYVERSE</Dialog.Title>

                        <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed text-left bg-white/5 p-5 rounded-2xl border border-white/5 mb-8">
                            <p>
                                I&apos;m a student developer running this site entirely on my own, with no income source to cover server and platform costs. The site currently runs on free hosting services.
                            </p>
                            <p>
                                Hosting services often go above their free limits, and keeping the site online typically costs around <span className="text-white font-bold">$20/month</span> (excluding costs of other services like database). Without support, I may not be able to keep the servers running once the free tier is exhausted.
                            </p>
                            <p>
                                If you enjoy this project and want to help keep it running for a long time, any contribution—no matter the amount—truly helps. Your support directly goes into maintaining the site, upgrading features, and ensuring it stays free for everyone.
                            </p>
                        </div>

                        <a
                            href="https://ko-fi.com/noobsambit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full group relative overflow-hidden rounded-xl bg-[#FF5E5B] p-1 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF5E5B]/20 block focus:outline-none focus:ring-2 focus:ring-[#FF5E5B]/50"
                        >
                            <div className="relative h-full px-6 py-4 flex items-center justify-center gap-3 bg-[#FF5E5B] group-hover:bg-[#ff4845] transition-colors rounded-lg">
                                <Coffee className="w-5 h-5 text-white animate-bounce-subtle" />
                                <span className="font-bold text-white text-lg">Buy me a Coffee on Ko-fi</span>
                            </div>
                        </a>

                        <p className="mt-4 text-xs text-gray-500">
                            Secure payment via Ko-fi. No account required.
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
