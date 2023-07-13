try:
    import urequests as requests
except ImportError:
    import requests
    
import ujson
from nrf24l01 import NRF24L01
import usys
import utime
from machine import Pin, SPI, SoftSPI
import zlib
from micropython import const

_RX_POLL_DELAY = const(15)
_RESPONDER_SEND_DELAY = const(10)

if usys.platform == "esp8266":  # Hardware SPI
    spi = SPI(1)  # miso : 12, mosi : 13, sck : 14
    cfg = {"spi": spi, "csn": 4, "ce": 5}
    
pipe = (b"\x41\x41\x41\x41\x41") # 'AAAAA' on the ardinuo

bucket_name = 'REDACTED'

allBookShelvedURL = 'REDACTED'

headersJSON = {
    'x-amz-acl': 'public-read',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=1'
}

def writeUIDsToFile(nrfData):
    luIDs = nrfData.split(",")# list of incoming shelf uids
    luIDs[-1] = luIDs[-1][0:4]
    uShelf = int(luIDs[0]) # unique shelf
    print(luIDs)
    response = requests.get(allBookShelvedURL)
    currentData = response.json()
    del response
    shelf = currentData[uShelf]
    for index, uid in enumerate(luIDs[1:]):
        shelf["books"][index]["uid"] = uid
    currentData[uShelf] = shelf
    response = requests.put(allBookShelvedURL, headers=headersJSON, json=currentData)
    print(response.text)
    print("sent to json")
    

def responder():
    csn = Pin(cfg["csn"], mode=Pin.OUT, value=1)
    ce = Pin(cfg["ce"], mode=Pin.OUT, value=0)
    spi = cfg["spi"]
    nrf = NRF24L01(spi, csn, ce, channel=100, payload_size=32)

    nrf.open_rx_pipe(0, pipe)
    nrf.start_listening()

    print('readSensorLoop')

    while True:
        utime.sleep(0.01)
        if nrf.any():
            data = nrf.recv()
            print(data)
            if data != b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00':
                output = data.decode()
                if output.find("*") == -1 or output == "" or output[0] == "1" or output[0] == "0" or output[0] == "2":
                    print(output)
                    writeUIDsToFile(output)
                    print(utime.localtime())
                    utime.sleep(1)
            
responder()
