
from faster_whisper import WhisperModel
from pathlib import Path
import sys
import time


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_transcription.py <audio_file_path>")
        return

    audio_path = Path(sys.argv[1])

    if not audio_path.is_file():
        print(f"Audio file not found: {audio_path}")
        return

    print("Loading the Whisper AI model...")
    print("The first run may download the model files.")

    start_time = time.time()

    model = WhisperModel(
        "small",
        device="cpu",
        compute_type="int8"
    )

    print("Model loaded. Starting transcription...")

    segments, info = model.transcribe(
        str(audio_path),
        beam_size=5
    )

    transcript_parts = []

    for segment in segments:
        text = segment.text.strip()
        if text:
            transcript_parts.append(text)
            print(
                f"[{segment.start:.2f}s - {segment.end:.2f}s] {text}"
            )

    transcript = " ".join(transcript_parts)

    print("\n--- TRANSCRIPTION RESULT ---")
    print(transcript if transcript else "No speech detected.")
    print(f"\nDetected language: {info.language}")
    print(f"Processing time: {time.time() - start_time:.2f} seconds")


if __name__ == "__main__":
    main()
