#!/usr/bin/env python
import os
import sys


def main() -> None:
    # Safely load local .env environment variables (zero-dependency)
    for env_path in [".env", "../.env"]:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ.setdefault(k.strip(), v.strip())
            except Exception:
                pass

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "servicelink.settings.development")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Install dependencies before running commands."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
