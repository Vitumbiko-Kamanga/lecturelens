
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from faster_whisper import WhisperModel
import shutil


app = FastAPI(
    title="LectureLens Transcription API",
    description="Local CPU-based lecture audio transcription service",
    version="1.0.0",
)

# Load the model once when the service starts.
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
)

ALLOWED_EXTENSIONS = {
    ".m4a",
    ".mp3",
    ".wav",
    ".aac",
    ".mp4",
    ".3gp",
    ".ogg",
    ".webm",
}

MAX_FILE_SIZE = 100 * 1024 * 1024


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "LectureLens Transcription API",
        "model": "small",
        "device": "cpu",
    }


@app.post("/transcribe")
def transcribe_audio(
    file: Annotated[UploadFile, File()],
    language: Annotated[str, Form()] = "auto",
):
    suffix = Path(file.filename or "").suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio file format.",
        )

    selected_language = language.strip().lower()

    if selected_language != "auto" and (
        len(selected_language) != 2
        or not selected_language.isalpha()
    ):
        raise HTTPException(
            status_code=400,
            detail="Language must be 'auto' or a two-letter language code.",
        )

    temp_path = None

    try:
        # Save the uploaded audio temporarily.
        with NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)

            shutil.copyfileobj(
                file.file,
                temp_file,
            )

        if temp_path.stat().st_size == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded audio file is empty.",
            )

        if temp_path.stat().st_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Audio file exceeds the 100 MB limit.",
            )

        options = {"beam_size": 5}

        if selected_language != "auto":
            options["language"] = selected_language

        segments, info = model.transcribe(
            str(temp_path),
            **options,
        )

        transcript_segments = []

        for segment in segments:
            text = segment.text.strip()

            if text:
                transcript_segments.append({
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": text,
                })

        transcript = " ".join(
            segment["text"]
            for segment in transcript_segments
        )

        return {
            "success": True,
            "filename": file.filename,
            "language": info.language,
            "language_probability": round(
                info.language_probability, 4
            ),
            "duration_seconds": round(info.duration, 2),
            "transcript": transcript,
            "segments": transcript_segments,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(error)}",
        ) from error

    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()

        file.file.close()
