import { db } from './config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const getProfileRef = (uid: string) => doc(db, 'profiles', uid)

export const readProfile = async <T = any>(uid: string): Promise<T | null> => {
  const ref = getProfileRef(uid)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as T) : null
}

export const writeProfile = async (uid: string, data: Record<string, any>) => {
  const ref = getProfileRef(uid)
  await setDoc(ref, data, { merge: true })
}


