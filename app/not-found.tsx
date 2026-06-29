import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full mt-20">
      {/* Message */}
      <h1 className="text-3xl font-bold">404 - Page introuvable</h1>

      <p className="text-gray-500 mt-5">
        La page que vous recherchez n’existe pas ou a été déplacée.
      </p>
    </div>
  )
}
