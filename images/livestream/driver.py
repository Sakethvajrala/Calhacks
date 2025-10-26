# Chrome driver functions and Instagram setup

from time import sleep
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By 
from selenium.webdriver.common.keys import Keys
from livestream.config import INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def init_driver():

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    driver.maximize_window()
    return driver

def login(driver):
    try:
        driver.get("https://www.instagram.com/accounts/login")
        sleep(5)

        # Enter the account details
        driver.find_element(By.NAME, "username").send_keys(INSTAGRAM_USERNAME)
        driver.find_element(By.NAME, "password").send_keys(INSTAGRAM_PASSWORD + Keys.RETURN)
        sleep(5)

        print("Logged into Instagram.")
    
    except Exception as e:
        print("Login failed:", e)
        raise

def start_livestream(driver, livestream_url):
    driver.get(livestream_url)
    sleep(5) # Allows the stream to load, this accounts for the natural delay.

    try:
        live_pic = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "img[alt*='profile picture'], canvas[aria-label*='Profile photo'], svg[aria-label='Your profile']"))
        )
        live_pic.click()
        print("Entered livestream.")
    except Exception as e:
        print("Click failed:", e)

def logout(driver):
    try:
        driver.get("https://www.instagram.com/accounts/logout/")
        sleep(3)
        print("Logged out of Instagram.")
    except Exception as e:
        print("Logout failed:", e)