import { useState, useEffect } from "react";
import { api } from "../../services/api";
import UserTable from "../../components/UserTable";
import UserDetailModal from "../../components/UserDetailModal";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await api.getAllUsers();
      const userList = userData.users || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const exportAllUsersReport = async () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }

    try {
      // Fetch all courses first to get accurate pricing
      const allCourses = await api.getCourses();
      console.log("All courses fetched for export:", allCourses);
      const courseMap = new Map(allCourses.map(course => [course._id, course]));

      // Fetch enrollment data for all users
      const userEnrollments = {};
      await Promise.all(
        users.map(async (user) => {
          try {
            const userEnrollmentData = await api.getUserEnrollments(user.id);
            const enrollments = userEnrollmentData.data || userEnrollmentData || [];
            
            // Filter out enrollments where course is deleted/null using enhanced logic
            const validEnrollments = enrollments.filter(e => {
              // Try multiple possible ways to get course ID
              const possibleCourseIds = [
                e.course_id,
                e.course?._id,
                e.course,
                e.courseId,
                e._id
              ];
              
              let courseId = null;
              for (const id of possibleCourseIds) {
                if (id && typeof id === 'string' && courseMap.has(id)) {
                  courseId = id;
                  break;
                }
              }
              
              return !!courseId;
            });
            
            // Count only paid enrollments for courses that currently have a price > 0
            const paidEnrollments = validEnrollments.filter(e => {
              if (e.payment_status !== "paid") return false;
              
              // Get the course and check if it currently has a price > 0
              const possibleCourseIds = [
                e.course_id,
                e.course?._id,
                e.course,
                e.courseId,
                e._id
              ];
              
              let course = null;
              for (const id of possibleCourseIds) {
                if (id && typeof id === 'string' && courseMap.has(id)) {
                  course = courseMap.get(id);
                  break;
                }
              }
              
              if (!course) return false;
              
              const coursePrice = course.course_price || course.price || 0;
              // Only count if the course currently has a price > 0
              return parseFloat(coursePrice) > 0;
            });
            
            // Calculate total spending using course data from backend
            const totalSpending = paidEnrollments
              .reduce((sum, enrollment) => {
                // Try multiple possible ways to get course ID
                const possibleCourseIds = [
                  enrollment.course_id,
                  enrollment.course?._id,
                  enrollment.course,
                  enrollment.courseId,
                  enrollment._id
                ];
                
                let course = null;
                for (const id of possibleCourseIds) {
                  if (id && typeof id === 'string' && courseMap.has(id)) {
                    course = courseMap.get(id);
                    break;
                  }
                }
                
                const coursePrice = course?.course_price || course?.price || 0;
                // Only count courses that have a price > 0
                return coursePrice > 0 ? sum + parseFloat(coursePrice) : sum;
              }, 0);
            
            userEnrollments[user.id] = {
              total: paidEnrollments.length, // Count only paid enrollments for courses with current price > 0
              totalSpending: totalSpending
            };
          } catch (error) {
            console.error(`Error fetching enrollments for user ${user.id}:`, error);
            userEnrollments[user.id] = { total: 0, totalSpending: 0 };
          }
        })
      );

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text("User Management Report", 15, 20);
      
      // Current date
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 35);
      
      // User Table
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("User Details", 15, 55);
      
      const tableColumns = ["Username", "Email", "Role", "Total Enrollments", "Total Spending", "Join Date"];
      const tableRows = users.map(user => {
        const enrollmentStats = userEnrollments[user.id] || { total: 0, totalSpending: 0 };
        return [
          user.username || 'N/A',
          user.email || 'N/A',
          user.role || 'N/A',
          enrollmentStats.total.toString(),
          `$${enrollmentStats.totalSpending.toFixed(2)}`,
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
        ];
      });

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Username
          1: { cellWidth: 45 }, // Email
          2: { cellWidth: 25 }, // Role
          3: { cellWidth: 25 }, // Total Enrollments
          4: { cellWidth: 25 }, // Total Spending
          5: { cellWidth: 30 }  // Join Date
        },
        margin: { top: 65, left: 15, right: 15 },
        tableWidth: 'auto',
        didDrawPage: function (data) {
          // Add footer to each page
          const pageHeight = doc.internal.pageSize.height;
          const pageNumber = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber || 1;
          
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(`Page ${currentPage} of ${pageNumber}`, 15, pageHeight - 30);
          doc.text(`Total Users: ${users.length}`, 15, pageHeight - 20);
        }
      });
      
      // Save the PDF
      doc.save(`all-users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3E50]"></div>
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 py-3 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] flex items-center gap-2">
            User Reports
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Comprehensive overview of user accounts and their course enrollments
          </p>
        </div>
        <button
          onClick={exportAllUsersReport}
          className="w-full sm:w-auto flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#2C3E50] text-white rounded-lg hover:bg-[#1E2B3A] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All Users
        </button>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        onUserClick={handleUserClick}
        loading={loading}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
}
