# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from io import BytesIO
import requests
from PIL import Image, ImageDraw, ImageOps, ImageFont
from .models import ProcessedImage
from .instruct import *
from django.core.files.base import ContentFile 

instruct = InstructPix2Pix(device="cuda:0")

class InstructView(APIView):

    def get(self, request, *args, **kwargs):

        return Response({}, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        '''
        Create the Todo with given todo data
        '''
        data = request.data
        image_url = data.get('image_url')  # Expecting the image as a URL
        prompt = data.get('prompt')


        if not image_url:  # Check if image_url is None or empty
            return Response({'error': 'image_url is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(image_url)
            image = BytesIO(response.content)
            pil_image = Image.open(image)  # Convert the downloaded image to a PIL Image

            # Call the inference function and get a PIL Image back
            updated_image = instruct.inference(pil_image, prompt)

            # Save the updated image to a BytesIO object
            img_io = BytesIO()
            updated_image.save(img_io, format='PNG')
            img_io.seek(0)

            # Create a new ProcessedImage object and save the image
            processed_image = ProcessedImage()
            processed_image.image.save('processed_image.png', ContentFile(img_io.read()), save=False)
            processed_image.save()

            # Construct the full URL to the saved image
            # request_host = request.build_absolute_uri(location=None)
            image_url = "http://localhost:8000" + processed_image.image.url
            print(image_url)
            # Save the updated_image in django server
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'image_url': image_url}, status=status.HTTP_200_OK)