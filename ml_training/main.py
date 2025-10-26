# Main loop for:
#  -> Instagram bot instantiation
#  -> Livestream feed
#  -> Feeding into model (YOLO etc.)

from time import sleep

from livestream.config import LIVESTREAM_URL
from livestream.driver import init_driver, login, start_livestream, logout
from livestream.capture import run_yolo_loop, replay_yolo_footage, clean_log


def stream():
    driver = init_driver()
    login(driver)
    start_livestream(driver, LIVESTREAM_URL)

    sleep(5)

    try:
        timestamp = run_yolo_loop()
    finally:
        logout(driver)
        driver.quit()
        replay_yolo_footage(timestamp, fps=5)

def replay(timestamp, fps=20):
    replay_yolo_footage(timestamp, fps)

def main():

    # Run the full loop to stream + detect.
    #stream()

    clean_log("2025-10-25_18-26-52", 0.25)

    # Or, replay previous YOLO footage again (uncomment + comment out the loop)
    #replay("2025-10-25_18-26-52", fps=10)

    # WALKTHROUGHS:
    # Bedroom: 2025-10-25_15-58-24
    # Balcony: 2025-10-25_16-48-16, 2025-10-25_17-30-55, 2025-10-25_18-20-23 (yolo8)
    # Bathroom: 2025-10-25_17-50-09, 2025-10-25_18-26-52 (toilet)
    
main()
        