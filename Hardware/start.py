import cv2
import numpy as np
import requests

url = "http://192.168.4.1/"  # ESP32 AP mode IP
response = requests.get(url)
if response.status_code == 200:
    print("hi")
    img_arr = np.frombuffer(response.content[54:], dtype=np.uint8)  # Skip BMP header
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    cv2.imwrite("output.jpg", img)
    cv2.imshow("Frame", img)
    cv2.waitKey(0)