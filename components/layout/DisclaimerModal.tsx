'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ShieldAlert, HeartHandshake } from 'lucide-react'

interface DisclaimerModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />

                {/* Modal Content */}
                <Dialog.Content className="fixed z-[101] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-lg rounded-[28px] border border-white/10 bg-[#121212] shadow-2xl overflow-hidden focus:outline-none animate-in zoom-in-95 duration-200">

                    {/* Decorative gradient */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

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
                        <div className="size-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-900/20">
                            <ShieldAlert className="text-white w-8 h-8" />
                        </div>

                        <Dialog.Title className="text-2xl font-bold text-white mb-6">Disclaimer</Dialog.Title>

                        <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed text-left bg-white/5 p-5 rounded-2xl border border-white/5 mb-6">
                            <p>
                                <strong className="text-white">ARMYVERSE</strong> is a non-profit, fan-made project developed by ARMY for ARMY. Its sole purpose is to connect fans worldwide and enhance the experience of supporting BTS.
                            </p>
                            <p>
                                This platform is <strong>not affiliated with, endorsed by, or associated with HYBE, BigHit Music, or BTS</strong> in any official capacity.
                            </p>
                            <p>
                                All official content, media, trademarks, and intellectual property belong to their respective owners. No copyright infringement is intended. Usage of such materials is essentially for identification, commentary, or non-commercial appreciation purposes.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-purple-300/60 text-xs font-medium uppercase tracking-wider">
                            <HeartHandshake className="w-4 h-4" />
                            <span>Made with borahae</span>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
