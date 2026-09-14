from pathlib import Path
from gltest.direct.sdk_loader import setup_sdk_paths

# Ensure GenLayer SDK is loaded in sys.path before test modules are imported
setup_sdk_paths(Path(__file__).parent.parent / "contracts" / "proofhirex.py")
