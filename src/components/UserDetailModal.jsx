import { useState, useEffect } from "react";
import { X, Download, User, Mail, Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserDetailModal({ isOpen, onClose, user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchCategoriesAndEnrollments();
    }
  }, [isOpen, user]);

  const fetchCategoriesAndEnrollments = async () => {
    // Fetch categories first, then enrollments
    await fetchCategories();
    await fetchUserEnrollments();
  };

  const fetchCategories = async () => {
    try {
      const categoryData = await api.getCategories();
      console.log("Fetched categories:", categoryData);
      setCategories(categoryData || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId || categories.length === 0) return "N/A";
    
    // Handle different possible structures for categoryId
    let actualCategoryId = categoryId;
    if (typeof categoryId === 'object' && categoryId._id) {
      actualCategoryId = categoryId._id;
    }
    
    console.log("Looking for category ID:", actualCategoryId, "in categories:", categories);
    const category = categories.find(cat => cat._id === actualCategoryId);
    console.log("Found category:", category);
    return category ? (category.category_name || category.name) : "N/A";
  };

  // Helper function to resolve course price from various possible field structures
  const resolveCoursePrice = (enrollment) => {
    if (!enrollment) return 'Free';
    
    const courseObj = enrollment.course || enrollment.course_id || {};
    
    // Try multiple possible field names
    const priceValue = courseObj.course_price ?? courseObj.price ?? courseObj.coursePrice ?? null;
    
    if (priceValue === null || priceValue === undefined || priceValue === '') {
      return 'Free';
    }
    
    const numPrice = Number(priceValue);
    if (!isNaN(numPrice)) {
      if (numPrice <= 0) return 'Free';
      return `$${Number.isInteger(numPrice) ? numPrice : numPrice.toFixed(2)}`;
    }
    
    // Handle string values
    if (typeof priceValue === 'string') {
      const lower = priceValue.toLowerCase();
      if (['free', '0', '0.0', '0.00'].includes(lower)) return 'Free';
      return priceValue.startsWith('$') ? priceValue : `$${priceValue}`;
    }
    
    return 'Free';
  };

  const fetchUserEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const enrollmentData = await api.getUserEnrollments(user.id);
      
      // Get all enrollments first
      const allEnrollments = enrollmentData.data || [];
      
      // Fetch all courses to get accurate pricing
      const allCourses = await api.getCourses();
      const courseMap = new Map(allCourses.map(course => [course._id, course]));
      
      // Filter for only paid enrollments with valid courses that have price > 0
      const paidEnrollments = allEnrollments.filter(enrollment => {
        if (enrollment.payment_status !== "paid") return false;
        
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
        
        if (!course || !course.course_title) return false;
        
        // Only include courses that have a price > 0
        const coursePrice = course.course_price || course.price || 0;
        return parseFloat(coursePrice) > 0;
      });
      
      // Enrich enrollments with full course data
      const enrichedEnrollments = paidEnrollments.map(enrollment => {
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
        
        return {
          ...enrollment,
          course: course
        };
      });
      
      console.log("Filtered paid enrollments with price > 0:", enrichedEnrollments);
      setEnrollments(enrichedEnrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      setError("Failed to load user enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    console.log("PDF Export clicked - User:", user);
    console.log("PDF Export clicked - Enrollments:", enrollments);
    
    if (!user) {
      alert("No user data available");
      return;
    }

    try {
      // Fetch all enrollments for statistics (not just paid ones)
      const allEnrollmentData = await api.getUserEnrollments(user.id);
      const allEnrollments = allEnrollmentData.data || [];
      console.log("User enrollments:", allEnrollments);
      
      // Fetch all courses to get accurate pricing
      const allCourses = await api.getCourses();
      console.log("All courses:", allCourses);
      const courseMap = new Map(allCourses.map(course => [course._id, course]));
      
      // Use the same filtering logic as the display for paid courses with price > 0
      const paidEnrollmentsForPDF = allEnrollments.filter(enrollment => {
        if (enrollment.payment_status !== "paid") return false;
        
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
        
        if (!course || !course.course_title) return false;
        
        // Only include courses that have a price > 0
        const coursePrice = course.course_price || course.price || 0;
        return parseFloat(coursePrice) > 0;
      });
      
      console.log("Paid enrollments for PDF:", paidEnrollmentsForPDF);
      
      // Calculate total spending using only paid courses with price > 0
      const totalSpending = paidEnrollmentsForPDF.reduce((sum, enrollment) => {
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
        console.log(`PDF: Course ${course?._id || 'unknown'} (${course?.course_title || 'unknown'}) price:`, coursePrice);
        return sum + parseFloat(coursePrice);
      }, 0);
      
      console.log("Total spending for PDF:", totalSpending);
      
      const enrollmentStats = {
        total: paidEnrollmentsForPDF.length,
        totalSpending: totalSpending
      };

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text("User Report", 15, 20);
      
      // User Information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("User Information", 15, 40);
      
      doc.setFontSize(12);
      doc.text(`Name: ${user.username || 'N/A'}`, 15, 55);
      doc.text(`Email: ${user.email || 'N/A'}`, 15, 65);
      doc.text(`Role: ${user.role || 'N/A'}`, 15, 75);
      doc.text(`Member Since: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`, 15, 85);
      
      // Enrollment Statistics
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("Enrollment Statistics", 15, 105);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Enrollments: ${enrollmentStats.total}`, 15, 120);
      doc.text(`Total Spending: $${enrollmentStats.totalSpending.toFixed(2)}`, 15, 130);
      
    // Enrollments Section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`Paid Course Enrollments (${paidEnrollmentsForPDF.length})`, 15, 150);
    
    if (paidEnrollmentsForPDF.length > 0) {
      const tableColumns = ["Course", "Category", "Price", "Enrolled Date"];
      const tableRows = paidEnrollmentsForPDF.map(enrollment => {
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
        
        return [
          course?.course_title || "Unknown Course",
          getCategoryName(course?.category_id) || "Uncategorized",
          course?.course_price ? `$${parseFloat(course.course_price).toFixed(2)}` : "Free",
          enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : "Unknown Date"
        ];
      });

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 160,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 15, right: 15 },
      });
    } else {
      doc.setFontSize(12);
      doc.text("No paid course enrollments found.", 15, 160);
    }      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 15, pageHeight - 20);
      
      // Save the PDF
      const fileName = `user-report-${user.username || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Saving PDF as:", fileName);
      doc.save(fileName);
      
      console.log("PDF export completed successfully");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Blocked
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-[#2C3E50] text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">User Details - {user?.username}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#2C3E50] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1E2B3A] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* User Information Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#2C3E50]" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium">{getStatusBadge(user?.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2C3E50]" />
                Paid Course Enrollments ({enrollments.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E50] mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading enrollments...</p>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map((enrollment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.course?.course_title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {enrollment.course?.category_id?.category_name || 
                             enrollment.course?.category?.name || 
                             getCategoryName(enrollment.course?.category_id || enrollment.course?.category) || 
                             "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {resolveCoursePrice(enrollment)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(enrollment.payment_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No paid course enrollments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
