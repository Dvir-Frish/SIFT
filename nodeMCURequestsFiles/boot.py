try:
    import usocket as socket
except:
    import socket

from machine import Pin

import network
import utime

import esp
esp.osdebug(None)

import gc
gc.collect()

#erez's home
ssid = 'MyAltice 143c23'
password = ''

# ssid = 'BCHA_Guest'
# password = ''

station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

while station.isconnected() == False:
    pass
    
print('Connection successful')
print(station.ifconfig())

led = Pin(2, Pin.OUT)
