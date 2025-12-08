import time
from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to Login...")
            page.goto("http://localhost:8081", timeout=60000)
            page.wait_for_load_state('networkidle')

            # Wait for elements
            print("Waiting for Login elements...")
            page.wait_for_selector('text=Welcome Back', timeout=10000)

            # Screenshot Login
            print("Taking Login screenshot...")
            page.screenshot(path="verification/login.png")

            # Navigate to Signup
            print("Clicking Sign Up...")
            # Note: In React Native Web, text elements might be spans or divs.
            page.click('text=Sign Up')

            # Wait for Signup elements
            print("Waiting for Signup elements...")
            page.wait_for_selector('text=Create Account', timeout=10000)

            # Screenshot Signup
            print("Taking Signup screenshot...")
            page.screenshot(path="verification/signup.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
