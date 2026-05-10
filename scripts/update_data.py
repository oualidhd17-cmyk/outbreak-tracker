from __future__ import annotations

import sys

from outbreak_tracker.runner import main

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
