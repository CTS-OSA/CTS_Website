from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.profilesetup import create_student_profile, get_student_profile, update_student_profile, check_student_number
from .views.GeneralSubmissionViewSet import FormBundleView, FinalizeSubmissionView, AdminFormEditView
from .views.adminDisplay import AdminStudentListView, get_student_profile_by_id, AdminBISList, AdminStudentFormsView, AdminSCIFList, AdminStudentFormView
from .views.display import SubmissionViewSet 
from .views.getEnums import EnumChoicesView
from .views.BISEditView import BISEditView
from .views.SCIFEditView import SCIFEditView
from .views.PARDView import PARDSubmitView
from .views.AdminProfileView import get_counselor_profile, update_counselor_profile, create_counselor_profile

app_name= 'forms'

router = DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('student/profile/create/', create_student_profile),
    path('check-student-number/', check_student_number, name='check-student-number'),
    path('student/profile/', get_student_profile),
    path('student/profile/update/', update_student_profile, name='update_student_profile'),
    path('admin/students/<str:student_id>/update/', update_student_profile, name='admin-update-student'),
    path('admin/basic-information-sheet-submissions', AdminBISList.as_view(), name='get_bis_students'),
    path('admin/student-cumulative-information-file-submissions', AdminSCIFList.as_view(), name='get_scif_students'),
    path('<str:form_type>/', FormBundleView.as_view(), name='form-bundle'),
    path('finalize/<int:submission_id>/', FinalizeSubmissionView.as_view(), name='finalize-submission'),
    path('admin/students/', AdminStudentListView.as_view(), name='admin-student-list'),
    path('admin/students/<str:student_id>/', get_student_profile_by_id),
    path('get/enums/', EnumChoicesView.as_view(), name='enum-choices'),
    path('admin/student-forms/<str:student_id>/', AdminStudentFormsView.as_view()),
    path('admin/student-forms/<str:student_id>/<str:form_type>/', AdminStudentFormView.as_view(), name='admin-student-form-view'),
    
    # ADMIN SIDE
    path('edit/bis/<str:student_id>/', BISEditView.as_view(), name='bis-edit'),
    path('edit/scif/<str:student_id>/', SCIFEditView.as_view(), name='scif-edit'),
    path('admin-edit/<int:submission_id>/', AdminFormEditView.as_view(), name='admin-form-edit'),
    
    # PARD 
    path('pard/submit/<int:submission_id>/', PARDSubmitView.as_view(), name='pard-submit'),
    path('pard/student-data/<str:student_number>/', PARDSubmitView.as_view(), name='pard-student-data'),
    path('edit/pard/<str:student_number>', PARDSubmitView.as_view(), name='pard-edit'),
    
    path('display/', include(router.urls)), 
    
    # Create a new counselor profile (POST)
    path("counselors/create/", create_counselor_profile, name="create-counselor"),

    # Get logged-in counselor profile (GET)
    path("counselors/me/", get_counselor_profile, name="get-counselor-profile"),

    # Update counselor profile (PATCH)
    # - Admin can pass counselor_id
    # - Counselor can update their own profile
    path("counselors/update/", update_counselor_profile, name="update-counselor-self"),
    path("counselors/update/<int:counselor_id>/", update_counselor_profile, name="update-counselor-admin"),
]

