# Config for Livestream.
# Change these variables to adjust performance.


STREAMER_USERNAME = "poopybutt45gdw" # This is the user that is streaming (must be done manually)
VIEWER_USERNAME = "rohankosalge" # This is the user that is viewing (automated via driver.py)
VIEWER_PASSWORD = "robro007"      # Password to viewer bot

LOCAL_PROJECT_PATH = "/Users/rohankosalge/Desktop/Coding/calhacks-2025/" # If running a different laptop, please change this path.
CHROMEDRIVER_PATH = "/Users/rohankosalge/opt/homebrew/bin/chromedriver"  # Path to chrome driver, different for other laptops
LIVESTREAM_URL = "https://www.instagram.com/" + STREAMER_USERNAME + "/"
INSTAGRAM_USERNAME = VIEWER_USERNAME
INSTAGRAM_PASSWORD = VIEWER_PASSWORD
LIVESTREAM_REGION = (205, 400, 465, 820)
CAPTURE_INTERVAL = 0 # forced latency between frames (seconds); this is ideally nonzero for debugging, zero for anything else.
CAPTURE_LENGTH = 120  # length of stream (seconds)
CAPTURE_MODEL = "final"