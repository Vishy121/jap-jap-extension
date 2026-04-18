import os
import google.genai as genai

def main():
    try:
        # ✅ Set your API key (replace with your actual key or use environment variable)
        API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBxRBhE92TXUndXVvvnZzCGr9YUDzwuDRQ")
        if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
            raise ValueError("Please set your GEMINI_API_KEY environment variable or replace the placeholder.")

        # Initialize the Gemini client
        client = genai.Client(api_key=API_KEY)

        # Generate text using Gemini 1.5 Flash (fast) model
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents="create a html website for my kids play startup, html only , no markup"
        )

        # Print the generated text
        print("Gemini Response:\n", response.text)

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()