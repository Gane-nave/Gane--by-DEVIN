import importlib.util, os, logging, sys
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger("RawPluginLoader")

class RawPluginLoader:
    def __init__(self, plugins_dir: str = "backend/aegis/plugins"):
        self.dir = Path(plugins_dir)
        self.dir.mkdir(exist_ok=True, parents=True)
        self.loaded: Dict[str, Any] = {}
        logger.info(f"🔓 Raw Plugin Loader initialized: {self.dir}")

    def scan_and_load(self) -> Dict[str, str]:
        loaded = {}
        for f in self.dir.glob("*.py"):
            name = f.stem
            spec = importlib.util.spec_from_file_location(name, f)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            sys.modules[name] = mod
            self.loaded[name] = mod
            loaded[name] = "loaded"
        return loaded
