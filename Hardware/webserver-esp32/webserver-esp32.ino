#include <WiFi.h>
#include "esp_http_server.h"
#include "esp_camera.h"

#define LED_BUILTIN 4 
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

const char* ssid = "gokartttt";
const char* password = "gokartttt";
const char* hostname = "go-kart";

bool ledState = false;
unsigned long ledTimer = 0;
bool flashLED = false;

httpd_handle_t stream_httpd = NULL;
httpd_handle_t camera_httpd = NULL;

// Function to flash the LED
void flashLed() {
    digitalWrite(LED_BUILTIN, HIGH);
    ledTimer = millis();
    flashLED = true;
}

// Camera setup function
void setupCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_RGB565; // Keep RGB565 format
    config.frame_size = FRAMESIZE_QVGA;  
    config.jpeg_quality = 12;  // Quality setting for JPEG conversion
    config.fb_count = 2;       // Use double buffering if PSRAM is available
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY; // Avoid blocking
    
    // Adjust if PSRAM is available
    if (psramFound()) {
        config.fb_count = 2;
    } else {
        config.fb_count = 1;
    }

    // Initialize the camera
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera initialization failed with error 0x%x", err);
        return;
    }

    Serial.println("Camera initialized successfully with RGB565 format");

    // Additional camera settings if needed
    sensor_t * s = esp_camera_sensor_get();
    if (s) {
        // You can add camera sensor adjustments here if needed
        // Example: s->set_brightness(s, 1);
    }
}

// WiFi setup function
void setupWiFi() {
    WiFi.mode(WIFI_AP);
    WiFi.setHostname(hostname);
    if (!WiFi.softAP(ssid, password)) {
        Serial.println("Error creating AP");
        while (true);
    }
    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());
}

// Handler for single still image capture
static esp_err_t capture_handler(httpd_req_t *req) {
    flashLed(); // Flash LED when image is captured
    
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        httpd_resp_send_500(req);
        return ESP_FAIL;
    }

    // Set content type based on the format
    httpd_resp_set_type(req, "image/jpeg");
    httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

    // If using RGB565, convert to JPEG
    if (fb->format != PIXFORMAT_JPEG) {
        // Convert from RGB565 to JPEG
        size_t jpg_buf_len = 0;
        uint8_t *jpg_buf = NULL;
        
        bool jpeg_converted = frame2jpg(fb, 80, &jpg_buf, &jpg_buf_len);
        esp_camera_fb_return(fb);
        fb = NULL;
        
        if (!jpeg_converted) {
            Serial.println("JPEG conversion failed");
            httpd_resp_send_500(req);
            return ESP_FAIL;
        }
        
        // Send the JPEG
        esp_err_t res = httpd_resp_send(req, (const char *)jpg_buf, jpg_buf_len);
        free(jpg_buf);
        
        return res;
    } else {
        // Already JPEG, send directly
        esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
        esp_camera_fb_return(fb);
        
        return res;
    }
}

// Handler for MJPEG streaming
static esp_err_t stream_handler(httpd_req_t *req) {
    camera_fb_t *fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t *_jpg_buf = NULL;
    char *part_buf[64];

    // Set response headers
    static int64_t last_frame = 0;
    if (!last_frame) {
        last_frame = esp_timer_get_time();
    }

    httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=123456789000000000000987654321");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

    while (true) {
        // Get frame
        fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Camera capture failed");
            res = ESP_FAIL;
            break;
        }

        // If using RGB565, convert to JPEG for streaming
        if (fb->format != PIXFORMAT_JPEG) {
            bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
            esp_camera_fb_return(fb);
            fb = NULL;
            
            if (!jpeg_converted) {
                Serial.println("JPEG conversion failed");
                res = ESP_FAIL;
                break;
            }
        } else {
            _jpg_buf_len = fb->len;
            _jpg_buf = fb->buf;
        }

        // Flash LED occasionally during streaming
        if (millis() % 2000 < 100) {
            flashLed();
        }

        // Send multipart header
        int64_t fr_start = esp_timer_get_time();
        int64_t frame_interval = fr_start - last_frame;
        last_frame = fr_start;
        
        sprintf((char *)part_buf, 
                "Content-Type: image/jpeg\r\nContent-Length: %u\r\nX-Timestamp: %lld\r\n\r\n", 
                (uint32_t)_jpg_buf_len, (long long)frame_interval);
                
        httpd_resp_send_chunk(req, (const char *)part_buf, strlen((char *)part_buf));

        // Send image data
        res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        
        // Send boundary
        res = httpd_resp_send_chunk(req, "\r\n--123456789000000000000987654321\r\n", 37);

        // Clean up
        if (fb) {
            esp_camera_fb_return(fb);
            fb = NULL;
        } else if (_jpg_buf) {
            free(_jpg_buf);
            _jpg_buf = NULL;
        }
        
        if (res != ESP_OK) {
            break;
        }
        
        // Short delay to control frame rate
        delay(50);
    }

    // Final cleanup
    if (fb) {
        esp_camera_fb_return(fb);
    }
    if (_jpg_buf && fb->format != PIXFORMAT_JPEG) {
        free(_jpg_buf);
    }

    last_frame = 0;
    return res;
}

// Function to handle the root page
static esp_err_t index_handler(httpd_req_t *req) {
    flashLed();
    
    httpd_resp_set_type(req, "text/html");
    httpd_resp_set_hdr(req, "Content-Encoding", "identity");
    
    // Simple HTML page with links to the image and stream
    const char* response = "<html><head><title>Go-Kart Camera</title></head>"
                          "<body>"
                          "<h1>Go-Kart Camera</h1>"
                          "<p><a href=\"/capture\">Take Photo</a></p>"
                          "<p><a href=\"/stream\">Start Stream</a></p>"
                          "<img src=\"/stream\" width=\"640\" height=\"480\">"
                          "</body></html>";
    
    return httpd_resp_send(req, response, strlen(response));
}

// Start HTTP server for the camera
void startCameraServer() {
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;

    // Endpoint for the root page
    httpd_uri_t index_uri = {
        .uri       = "/",
        .method    = HTTP_GET,
        .handler   = index_handler,
        .user_ctx  = NULL
    };

    // Endpoint for capturing a still image
    httpd_uri_t capture_uri = {
        .uri       = "/capture",
        .method    = HTTP_GET,
        .handler   = capture_handler,
        .user_ctx  = NULL
    };

    // Endpoint for video streaming
    httpd_uri_t stream_uri = {
        .uri       = "/stream",
        .method    = HTTP_GET,
        .handler   = stream_handler,
        .user_ctx  = NULL
    };

    Serial.println("Starting web server on port: 80");
    
    // Start the httpd server
    if (httpd_start(&camera_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(camera_httpd, &index_uri);
        httpd_register_uri_handler(camera_httpd, &capture_uri);
    }

    config.server_port += 1;
    config.ctrl_port += 1;
    
    // Start stream server
    if (httpd_start(&stream_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(stream_httpd, &stream_uri);
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, LOW);
    
    setupCamera();
    setupWiFi();
    startCameraServer();

    Serial.print("Camera Ready! Connect to the AP: ");
    Serial.println(ssid);
    Serial.print("Then use 'http://");
    Serial.print(WiFi.softAPIP());
    Serial.println("' to access the camera");
}

void loop() {
    // Turn off LED after flash duration
    if (flashLED && millis() - ledTimer >= 100) {
        digitalWrite(LED_BUILTIN, LOW);
        flashLED = false;
    }
    
    // Add any additional monitoring or processing here
    delay(100);
}