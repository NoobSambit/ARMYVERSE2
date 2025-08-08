'use client'

import React, { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Camera, X, Sparkles } from 'lucide-react'
import { auth } from '@/lib/firebase/config'
import { writeProfile, readProfile } from '@/lib/firebase/profile'

interface ProfileCardProps {
  trigger: React.ReactNode
}

interface ProfileData {
  displayName: string
  photoURL: string
  bias?: string
  era?: string
  motto?: string
}

export default function ProfileCard({ trigger }: ProfileCardProps) {
  const user = auth.currentUser
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<ProfileData>({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
    bias: '',
    era: '',
    motto: ''
  })

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const p = await readProfile<Partial<ProfileData>>(user.uid)
      if (p) setData(d => ({ ...d, ...p }))
    }
    load().catch(() => {})
  }, [user])

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    const json = await res.json()
    setData(prev => ({ ...prev, photoURL: json.url }))
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await writeProfile(user.uid, data)
      // Optionally reflect display name/photo to Firebase Auth profile
      // Auth profile update is optional; Navbar reads Firestore profile for display
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <span>{trigger}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-2xl border border-purple-500/30 bg-[#150424]/95 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-white">Your Profile</Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></Dialog.Close>
          </div>

          <div className="flex items-start gap-4">
            <div className="relative">
              <img src={data.photoURL || '/avatar-placeholder.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-purple-500/30" />
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full cursor-pointer shadow" title="Upload profile photo">
                <Camera className="w-4 h-4" />
              </label>
              <input id="avatar-upload" aria-label="Upload profile photo" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
            <div className="grid grid-cols-1 gap-3 flex-1">
              <div>
                <label className="text-xs text-gray-400">Display name</label>
                <input value={data.displayName} onChange={e => setData({ ...data, displayName: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-purple-500 outline-none" placeholder="How should ARMY see you?" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Bias</label>
                  <input value={data.bias || ''} onChange={e => setData({ ...data, bias: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-purple-500 outline-none" placeholder="e.g., Jimin" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Favorite era</label>
                  <input value={data.era || ''} onChange={e => setData({ ...data, era: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-purple-500 outline-none" placeholder="e.g., Love Yourself" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">ARMY motto</label>
                <input value={data.motto || ''} onChange={e => setData({ ...data, motto: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-purple-500 outline-none" placeholder="e.g., Borahae!" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-gray-400 flex items-center gap-1"><Sparkles className="w-4 h-4 text-purple-400" /> Make it yours with ARMY vibes</div>
            <button onClick={saveProfile} disabled={saving} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


