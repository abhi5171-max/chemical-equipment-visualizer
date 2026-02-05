
import pandas as pd
from io import BytesIO
from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response
from .models import ChemicalDataset, EquipmentItem
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from django.utils import timezone

class CSVUploadView(views.APIView):
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_csv(file)
            required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_cols):
                return Response({'error': f'Missing columns. Required: {required_cols}'}, status=status.HTTP_400_BAD_REQUEST)

            # Analytics Summary
            summary = {
                'total_equipment_count': len(df),
                'average_flowrate': float(df['Flowrate'].mean()),
                'average_pressure': float(df['Pressure'].mean()),
                'average_temperature': float(df['Temperature'].mean()),
                'distribution_by_type': df['Type'].value_counts().to_dict()
            }

            # Save Dataset
            dataset = ChemicalDataset.objects.create(
                user=request.user,
                filename=file.name,
                summary_json=summary
            )

            # Save Items
            items = []
            for _, row in df.iterrows():
                items.append(EquipmentItem(
                    dataset=dataset,
                    equipment_name=row['Equipment Name'],
                    type=row['Type'],
                    flowrate=row['Flowrate'],
                    pressure=row['Pressure'],
                    temperature=row['Temperature']
                ))
            EquipmentItem.objects.bulk_create(items)

            # Keep last 5
            old_datasets = ChemicalDataset.objects.filter(user=request.user).order_by('-timestamp')[5:]
            for old in old_datasets:
                old.delete()

            return Response({'id': dataset.id, 'summary': summary}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        datasets = ChemicalDataset.objects.filter(user=request.user)[:5]
        data = [{
            'id': d.id,
            'filename': d.filename,
            'timestamp': d.timestamp,
            'summary': d.summary_json
        } for d in datasets]
        return Response(data)

class ReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        try:
            dataset = ChemicalDataset.objects.get(pk=pk, user=request.user)
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_{dataset.id}.pdf"'
            
            p = canvas.Canvas(response)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 800, "Chemical Equipment Parameter Report")
            p.setFont("Helvetica", 12)
            p.drawString(100, 780, f"Dataset: {dataset.filename}")
            p.drawString(100, 765, f"Date: {dataset.timestamp.strftime('%Y-%m-%d %H:%M')}")
            
            p.drawString(100, 740, "--- Summary Statistics ---")
            s = dataset.summary_json
            p.drawString(100, 720, f"Total Equipment: {s['total_equipment_count']}")
            p.drawString(100, 705, f"Avg Flowrate: {s['average_flowrate']:.2f} m3/h")
            p.drawString(100, 690, f"Avg Pressure: {s['average_pressure']:.2f} bar")
            p.drawString(100, 675, f"Avg Temp: {s['average_temperature']:.2f} C")
            
            p.showPage()
            p.save()
            return response
        except ChemicalDataset.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
