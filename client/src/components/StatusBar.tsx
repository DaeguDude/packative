import { useAuth } from "@/contexts/AuthContext";

export function StatusBar() {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 right-0 m-4 p-3 bg-black/80 text-white text-xs font-mono rounded-lg shadow-lg z-50">
      <div className="space-y-1">
        <div className="text-gray-400 font-semibold mb-2">Services</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          <span>Client:</span>
          <a
            href="http://localhost:5173"
            className="text-blue-400 hover:underline"
          >
            :5173
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          <span>Server:</span>
          <a
            href="http://localhost:3000"
            className="text-blue-400 hover:underline"
          >
            :3000
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          <span>Studio:</span>
          <a
            href="http://localhost:5555"
            className="text-blue-400 hover:underline"
          >
            :5555
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          <span>DB:</span>
          <span className="text-gray-400">:5432</span>
        </div>
        <div className="border-t border-gray-600 my-2"></div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              user ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span>Auth:</span>
          <span className={user ? "text-green-400" : "text-red-400"}>
            {user ? user.email : "Not logged in"}
          </span>
        </div>
      </div>
    </div>
  );
}
