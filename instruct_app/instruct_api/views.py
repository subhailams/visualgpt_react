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
from .inpaint import * 

from django.core.files.base import ContentFile 

instruct = InstructPix2Pix(device="cuda:1")
inpaint = Inpainting()

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
            print("Here>>>>>>>>>>>>>>>>>>>>>>>>>>")
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
            # Prepare the file to upload
            
            # files = {'image': ('updated_image.png', img_io, 'image/png')}

            # # Endpoint of the Node.js server
            # nodejs_endpoint = 'http://localhost:3001/upload'

            # # Upload the image to the Node.js server
            # upload_response = requests.post(nodejs_endpoint, files=files)

            # if upload_response.status_code != 200:
            #     # Handle unsuccessful upload
            #     return Response({'error': 'Failed to upload the image to Node.js server', 'details': upload_response.text}, status=upload_response.status_code)

            # Construct the full URL to the saved image
            # request_host = request.build_absolute_uri(location=None)
            image_url = "http://localhost:8000" + processed_image.image.url
            print(image_url)
            # Save the updated_image in django server
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'image_url': image_url}, status=status.HTTP_200_OK)
    

class InpaintView(APIView):

    def get(self, request, *args, **kwargs):

        return Response({}, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        '''
        Create the Todo with given todo data
        '''
        data = request.data
        image_url = data.get('image_url')  # Expecting the image as a URL
        mask_url = data.get('mask_url')
        prompt = data.get('prompt')


        if not image_url:  # Check if image_url is None or empty
            return Response({'error': 'image_url is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(image_url)
            image = BytesIO(response.content)
            image = Image.open(image)  # Convert the downloaded image to a PIL Image

            response2 = requests.get(mask_url)
            mask = BytesIO(response2.content)
            mask = Image.open(mask)  # Convert the downloaded image to a PIL Image

            # Call the inference function and get a PIL Image back
            updated_image = inpaint.inference(image, mask, prompt)

            # Save the updated image to a BytesIO object
            img_io = BytesIO()
            updated_image.save(img_io, format='PNG')
            img_io.seek(0)

            # Create a new ProcessedImage object and save the image
            processed_image = ProcessedImage()
            processed_image.image.save('inpainted_image.png', ContentFile(img_io.read()), save=False)
            processed_image.save()

            # # Prepare the file to upload
            # files = {'image': ('updated_image.png', processed_image, 'image/png')}

            # # Endpoint of the Node.js server
            # nodejs_endpoint = 'http://localhost:3001/upload'

            # # Upload the image to the Node.js server
            # upload_response = requests.post(nodejs_endpoint, files=files)

            # if upload_response.status_code != 200:
            #     # Handle unsuccessful upload
            #     return Response({'error': 'Failed to upload the image to Node.js server', 'details': upload_response.text}, status=upload_response.status_code)

            # Construct the full URL to the saved image
            # request_host = request.build_absolute_uri(location=None)
            image_url = "http://localhost:8000" + processed_image.image.url
            print(image_url)
            # Save the updated_image in django server
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'image_url': image_url}, status=status.HTTP_200_OK)
