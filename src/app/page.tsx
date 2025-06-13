import { Construction } from "lucide-react"

export default function UnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <Construction className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Under Construction</h1>
        <p className="text-gray-600 mb-6">We're working hard to bring you something amazing. Please check back soon!</p>
        <div className="text-sm text-gray-500">© {new Date().getFullYear()} | Coming Soon</div>
      </div>
    </div>
  )
}
