#!/bin/bash

# Create directories for each category
mkdir -p pain-relief vitamins medical-devices medical-supplies supplements personal-care

# Pain Relief category
curl -k -o pain-relief/paracetamol.png "https://i.ibb.co/Jy8tBqM/paracetamol.png"
curl -k -o pain-relief/ibuprofen.png "https://i.ibb.co/0jZ3Q9Y/ibuprofen.png"

# Vitamins category
curl -k -o vitamins/vitamin-c.png "https://i.ibb.co/YPXxVKM/vitamin-c.png"
curl -k -o vitamins/multivitamin.png "https://i.ibb.co/C2Lbvq8/multivitamin.png"

# Medical Devices category
curl -k -o medical-devices/bp-monitor.png "https://i.ibb.co/WxKYYtC/bp-monitor.png"
curl -k -o medical-devices/glucometer.png "https://i.ibb.co/0MZ0MQw/glucometer.png"

# Medical Supplies category
curl -k -o medical-supplies/first-aid.png "https://i.ibb.co/VqGPVKL/first-aid.png"
curl -k -o medical-supplies/thermometer.png "https://i.ibb.co/xGd2ZQ6/thermometer.png"

# Supplements category
curl -k -o supplements/omega3.png "https://i.ibb.co/qCkzxBQ/omega3.png"
curl -k -o supplements/protein.png "https://i.ibb.co/YyQKHLt/protein.png"

# Personal Care category
curl -k -o personal-care/sanitizer.png "https://i.ibb.co/3vXL46k/sanitizer.png"
curl -k -o personal-care/mask.png "https://i.ibb.co/Kj8tZ5Q/mask.png"

# Category placeholder images
curl -k -o pain-relief/category.png "https://i.ibb.co/VwJ8dLC/pain-relief.png"
curl -k -o vitamins/category.png "https://i.ibb.co/YWXvKmt/vitamins.png"
curl -k -o medical-devices/category.png "https://i.ibb.co/QKVGdMS/medical-devices.png"
curl -k -o medical-supplies/category.png "https://i.ibb.co/YyQKHLt/medical-supplies.png"
curl -k -o supplements/category.png "https://i.ibb.co/C2Lbvq8/supplements.png"
curl -k -o personal-care/category.png "https://i.ibb.co/3vXL46k/personal-care.png" 