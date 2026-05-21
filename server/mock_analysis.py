import sys
import base64
import json
import traceback

def main():
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input received from stdin"}))
            return

        print(json.dumps({
            "status": "success",
            "received_length": len(input_data),
            "skinType": "Normal",
            "confidence": 95,
            "skinCondition": [],
            "recommendations": []
        }))
    except Exception as e:
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))

if __name__ == "__main__":
    main()
