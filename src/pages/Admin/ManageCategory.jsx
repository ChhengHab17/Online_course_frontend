import { useState, useEffect } from "react";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/category");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Category name is required!");
    try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_name: newCategory,
        }),
      });
      const data = await res.json();
      setCategories([...categories, data]);
      setNewCategory("");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleEditCategory = async () => {
    if (!newCategory.trim() || !editingCategory) return;
    try {
      const res = await fetch(
  `https://backend-hosting-d4f6.onrender.com/api/category/${editingCategory._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_name: newCategory }),
        }
      );
      const data = await res.json();

      setCategories(
        categories.map((cat) => (cat._id === editingCategory._id ? data : cat))
      );
      setEditingCategory(null);
      setNewCategory("");
      setShowModal(false);
    } catch (err) {
      console.error("Error editing category:", err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
  await fetch(`https://backend-hosting-d4f6.onrender.com/api/category/${categoryId}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((c) => c._id !== categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategory("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNewCategory(category.category_name);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-0 sm:px-6 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                Category Management
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Organize and manage your course categories
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto group relative bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-[#1A252F] hover:to-[#2C3E50] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Category
              </span>
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E50]"></div>
                <p className="text-slate-600 font-medium">
                  Loading categories...
                </p>
              </div>
            </div>
          ) : (
            <>
              {categories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <svg
                      className="w-16 h-16 text-slate-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      No categories yet
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Create your first category to get started organizing your
                      courses
                    </p>
                    <button
                      onClick={openAddModal}
                      className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white px-6 py-2 rounded-lg hover:from-[#1A252F] hover:to-[#2C3E50] transition-all duration-300 font-medium"
                    >
                      Create Category
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-xs sm:text-sm">
                    <thead className="bg-gray from-slate-100 to-purple-100 border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#2C3E50] rounded-full"></span>
                            #
                          </div>
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Category Name
                        </th>
                        <th className="py-4 px-6 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((category, idx) => (
                        <tr
                          key={category._id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <span className="flex items-center justify-center w-8 h-8 bg-[#2C3E50]/10 text-[#2C3E50] rounded-full text-sm font-semibold">
                                {idx + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-gradient-to-br from-[#2C3E50]/10 to-[#34495E]/10 rounded-lg mr-3">
                                <svg
                                  className="w-5 h-5 text-[#2C3E50]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                              </div>
                              <span className="text-slate-800 font-medium">
                                {category.category_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end space-x-2 opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(category)}
                                className="flex items-center gap-2 bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 text-[#2C3E50] px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-8 rounded-2xl w-full max-w-xs sm:max-w-md shadow-2xl border border-white/20 transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-[#2C3E50] bg-clip-text text-transparent">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-2 text-sm sm:text-base">
                  Category Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name..."
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all duration-200 bg-white/70 text-xs sm:text-sm"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (editingCategory
                        ? handleEditCategory()
                        : handleAddCategory())
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 sm:space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingCategory ? handleEditCategory : handleAddCategory
                  }
                  className="px-5 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white rounded-xl hover:from-[#1A252F] hover:to-[#2C3E50] transition-all duration-300 shadow-lg font-medium flex items-center gap-2 text-xs sm:text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
