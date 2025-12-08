from django.db.models import Count, Avg, Q, OuterRef, Exists, F, Value
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from forms.models import Student, SocioEconomicStatus
from forms.models import YearLevelEnum

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reports(request):
    today = now().date()

    ages_qs = Student.objects.filter(status='enrolled').annotate(age=today.year - F('birthdate__year'))

    avg_age = ages_qs.aggregate(avg=Avg('age'))['avg'] or 0
    avg_age = int(avg_age)

    region_counts = Student.objects.filter(status='enrolled').values('permanent_address__region').annotate(count=Count('student_number')).order_by('-count')
    top_region = region_counts[0]['permanent_address__region'] if region_counts else "N/A"

    
    total_students = Student.objects.filter(status='enrolled').count()

    scholarship_subquery = SocioEconomicStatus.objects.filter(
        student_number=OuterRef('student_number'),
        submission__status='submitted',
        has_scholarship=True
    )
    students_with_scholarship = Student.objects.filter(status='enrolled').annotate(
        has_scholarship=Exists(scholarship_subquery)
    )
    scholarship_count = students_with_scholarship.filter(has_scholarship=True).count()
    scholarship_rate = round((scholarship_count / total_students) * 100, 1) if total_students else 0

    program_counts = Student.objects.filter(status='enrolled').values('degree_program').annotate(count=Count('student_number')).order_by('-count')[:3]
    top_3_programs = ", ".join([p['degree_program'] for p in program_counts])

    gender_counts = Student.objects.filter(status='enrolled').values('sex').annotate(count=Count('student_number'))
    gender_data = [{'label': g['sex'], 'value': g['count']} for g in gender_counts]

    region_data = [{'name': r['permanent_address__region'], 'Students': r['count']} for r in region_counts]
    region_data.sort(key=lambda x: x['name'])
    
    age_groups = [
        ('Below 18', 0, 17),
        ('18–19', 18, 19),
        ('20–21', 20, 21),
        ('22–23', 22, 23),
        ('24–25', 24, 25),
        ('26–27', 26, 27),
        ('Above 27', 28, 150),
    ]
    age_data = []
    for label, start, end in age_groups:
        count = ages_qs.filter(age__gte=start, age__lte=end).count()
        age_data.append({'name': label, 'Students': count})

    year_level_values = [choice.value for choice in YearLevelEnum]
    year_level_labels = {
        '1st Year': 'First Year',
        '2nd Year': 'Second Year',
        '3rd Year': 'Third Year',
        '4th Year': 'Fourth Year',
        '5th Year': 'Fifth Year',
    }

    programs = Student.objects.filter(status='enrolled').values_list('degree_program', flat=True).distinct()
    year_level_data = []

    for program in programs:
        counts = {year_level_labels.get(yl, yl): 0 for yl in year_level_values}
        students_in_program = Student.objects.filter(degree_program=program, status='enrolled')
        for s in students_in_program:
            yl_label = year_level_labels.get(s.current_year_level)
            if yl_label:
                counts[yl_label] += 1
        entry = {'name': program}
        entry.update(counts)
        year_level_data.append(entry)

    today_formatted = today.strftime("%b %d")

    summary_data = [
        {'title': 'Average Age', 'value': str(avg_age), 'interval': f'as of {today_formatted}', 'data': []},
        {'title': 'Top Region', 'value': top_region, 'interval': f'as of {today_formatted}', 'data': []},
        {'title': 'Rate of student on scholarship', 'value': f'{scholarship_rate}%', 'interval': f'as of {today_formatted}', 'data': []},
        {'title': 'Total Number of Students', 'value': f'{total_students:,}', 'interval': f'as of {today_formatted}','data': []},
        {'title': 'Top 3 Programs by student population', 'value': top_3_programs, 'interval': f'as of {today_formatted}', 'data': []},
    ]

    return Response({
        'summaryData': summary_data,
        'genderData': gender_data,
        'regionData': region_data,
        'ageData': age_data,
        'yearLevelData': year_level_data,
    })
