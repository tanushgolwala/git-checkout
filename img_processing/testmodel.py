import cv2
import numpy as np

# Load MobileNet-SSD model for person detection
prototxt = "deploy.prototxt"  # Update with actual path
model = "mobilenet_iter_73000.caffemodel"  # Update with actual path
net = cv2.dnn.readNetFromCaffe(prototxt, model)

def detect_person(frame):
    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 
                                 0.007843, (300, 300), 127.5)
    net.setInput(blob)
    detections = net.forward()

    best_box = None
    best_confidence = 0

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.7:  # Minimum confidence threshold
            class_id = int(detections[0, 0, i, 1])
            if class_id == 15:  # COCO person class
                if confidence > best_confidence:
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")
                    best_box = (startX, startY, endX - startX, endY - startY)
                    best_confidence = confidence

    return best_box

# Initialize video capture
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    person_box = detect_person(frame)
    
    if person_box:
        x, y, w, h = person_box
        # Calculate center of bounding box
        center_x = x + w // 2
        center_y = y + h // 2
        
        # Get frame center
        frame_center_x = frame.shape[1] // 2
        frame_center_y = frame.shape[0] // 2
        
        # Draw bounding box and centers
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.circle(frame, (center_x, center_y), 5, (0, 0, 255), -1)
        cv2.circle(frame, (frame_center_x, frame_center_y), 5, (255, 0, 0), -1)
        
        # Determine direction
        if center_x < frame_center_x - 50:  # Add hysteresis buffer
            command = "LEFT"
        elif center_x > frame_center_x + 50:
            command = "RIGHT"
        else:
            command = "CENTER"
        
        print(f"Object Center: ({center_x}, {center_y}) | Command: {command}")
    else:
        print("No person detected")
        command = "STOP"

    cv2.imshow("Person Tracking", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()