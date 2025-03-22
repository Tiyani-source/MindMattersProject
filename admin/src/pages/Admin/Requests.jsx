import { useState } from "react";
import { Trash } from "lucide-react";
import { Plus } from "lucide-react";
import { Eye } from "lucide-react";

const initialData = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
];

export default function PatientRequests() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  const handleDelete = (id) => {
    setData(data.filter((user) => user.id !== id));
  };

  const handleAdd = () => {
    const newUser = {
      id: Date.now(),
      name: "New User",
      email: "new@example.com",
    };
    setData([...data, newUser]);
  };

  return (
    <div className="p-4 w-full mt-4">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name..."
        className="mb-4 w-full p-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((user) =>
                user.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="text-blue-500 p-2"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        <Eye size={24} />
                      </button>

                      <button
                        className="text-green-500 p-2"
                        onClick={handleAdd}
                      >
                        <Plus size={24} />
                      </button>

                      <button
                        className="text-red-500 p-2"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
