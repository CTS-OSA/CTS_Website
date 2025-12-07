from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Count
from django.utils.timezone import now, timedelta
from forms.models import Student, Submission
from analytics.serializers import RecentSubmissionSerializer

def calculate_trend(data):
    if len(data) < 2:
        return 'neutral'
    if data[-1] > data[-2]:
        return 'up'
    elif data[-1] < data[-2]:
        return 'down'
    return 'neutral'

def calculate_trend_percentage(data):
    if len(data) < 2:
        return 0

    mid = len(data) // 2
    early_avg = sum(data[:mid]) / max(1, mid)
    late_avg = sum(data[mid:]) / max(1, len(data) - mid)

    if early_avg == 0:
        return 0

    percent = ((late_avg - early_avg) / early_avg) * 100
    return round(percent, 2)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def bar_data_view(request):
    grouped = (
        Student.objects
        .values('degree_program', 'sex')
        .annotate(total=Count('student_number'))
    )

    result = {}
    for entry in grouped:
        prog = entry['degree_program']
        sex = entry['sex']
        if prog not in result:
            result[prog] = {'Male': 0, 'Female': 0}
        result[prog][sex] = entry['total']

    bar_data = [
        {
            'name': k,
            'Male': v.get('Male', 0),
            'Female': v.get('Female', 0)
        }
        for k, v in result.items()
    ]

    total_students = Student.objects.count()

    return Response({
        "barData": bar_data,
        "totalStudents": total_students
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def summary_data_view(request):
    today = now().date()

    summary = [
        {
            "title": "Total Number of Students",
            "value": Student.objects.count(),
            "subtitle": f"Registered users as of {today.strftime('%b %d')}",
            "color": "#94141B",
        },
        {
            "title": "Student Cumulative Information File",
            "value": Submission.objects.filter(
                form_type='Student Cumulative Information File',
                status='submitted'
            ).count(),
            "subtitle": f"Submissions as of {today.strftime('%b %d')}",
            "color": "#FFA600",
        },
        {
            "title": "Basic Information Sheet",
            "value": Submission.objects.filter(
                form_type='Basic Information Sheet',
                status='submitted'
            ).count(),
            "subtitle": f"Submissions as of {today.strftime('%b %d')}",
            "color": "#014421",
        },
        {
            "title": "Counseling Referral Slip",
            "value": Submission.objects.filter(
                form_type='Counseling Referral Slip',
                status='submitted'
            ).count(),
            "subtitle": f"Submissions as of {today.strftime('%b %d')}",
            "color": "#1976D2",
        },
        {
            "title": "Psychosocial Assistance and Referral Desk",
            "value": Submission.objects.filter(
                form_type='Psychosocial Assistance and Referral Desk',
                status='submitted'
            ).count(),
            "subtitle": f"Submissions as of {today.strftime('%b %d')}",
            "color": "#F56B1B",
        }
    ]

    return Response({"summary": summary})
@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_submissions_view(request):
    try:
        submissions = (
            Submission.objects
            .filter(status="submitted")
            .order_by('-submitted_on')[:8]
        )
        serializer = RecentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)
   
   
@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_bis_submissions_view(request):
    try:
        submissions = (
            Submission.objects
            .filter(status="submitted", form_type="Basic Information Sheet")
            .order_by('-submitted_on')[:8]
        )
        serializer = RecentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_scif_submissions_view(request):
    try:
        submissions = (
            Submission.objects
            .filter(status="submitted", form_type="Student Cumulative Information File")
            .order_by('-submitted_on')[:8]
        )
        serializer = RecentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)
        
@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_drafts_view(request):
    drafts = Submission.objects.filter(status='draft').order_by('saved_on')[:4]
    data = [
        {
            "id": s.id,
            "formType": s.form_type,
            "student": f"{s.student.first_name} {s.student.last_name}"
        }
        for s in drafts
    ]
    return Response(data)
