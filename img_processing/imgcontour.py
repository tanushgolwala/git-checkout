import cv2
import numpy as np

def get_salient_bbox(frame):
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Initialize saliency detector
    saliency = cv2.saliency.StaticSaliencySpectralResidual_create()
    (success, saliencyMap) = saliency.computeSaliency(frame)

    # Convert saliency map to binary image
    threshMap = cv2.threshold((saliencyMap * 255).astype("uint8"), 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    # Find contours
    contours, _ = cv2.findContours(threshMap.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return frame

    # Find the largest contour
    largest_contour = max(contours, key=cv2.contourArea)

    # Get bounding box
    x, y, w, h = cv2.boundingRect(largest_contour)

    # Draw bounding box
    output = frame.copy()
    cv2.rectangle(output, (x, y), (x + w, y + h), (0, 255, 0), 2)

    return output

# Live video test
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    boxed_frame = get_salient_bbox(frame)
    cv2.imshow("Salient Object Bounding Box", boxed_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
