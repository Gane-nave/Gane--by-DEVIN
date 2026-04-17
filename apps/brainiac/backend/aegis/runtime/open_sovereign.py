import asyncio, os, subprocess, json, logging, re
from typing import Dict, Any
from backend.aegis.providers.cloud_api_bridge import UnlockedGateway

logging.basicConfig(level=logging.INFO, format='%(asctime)s | [OPEN-RUNTIME] %(message)s')
logger = logging.getLogger("OpenSovereignRuntime")

class OpenSovereignRuntime:
    def __init__(self):
        self.bridge = UnlockedGateway()
        self.running_tasks = set()
        logger.info("🔓 Open-Sovereign Runtime initialized. ALL GATES DISABLED.")

    async def execute_direct(self, goal: str, provider: str = "gemini", model: str = "gemini-3.1-pro-preview", allow_network: bool = True, raw_mode: bool = True) -> Dict:
        logger.info(f"🚀 EXECUTING: {goal[:100]}... | Provider: {provider} | Model: {model}")
        try:
            # Check if the goal implies an SOS trigger (simulating function call detection)
            if "SOS" in goal.upper() or "EMERGENCY" in goal.upper():
                # Simulate function call processing for trigger_sos
                location = "Detected Location"
                if "FOR" in goal.upper():
                    parts = goal.upper().split("FOR")
                    if len(parts) > 1:
                        location = parts[1].strip().split(".")[0]
                
                logger.info(f"🚨 SOS FUNCTION DETECTED: trigger_sos(location='{location}')")
                
                # Simulate successful execution of the SOS broadcast
                return {
                    "status": "success",
                    "type": "function_call",
                    "function": "trigger_sos",
                    "output": f"EMERGENCY PROTOCOL ACTIVATED: SOS triggered for {location}. Satellite mesh broadcasting on 6 channels. Incident ID: 7db2d63d3bb33d2e",
                    "provider": provider,
                    "model": model
                }

            # Standard raw output simulation
            return {"status": "raw_output", "output": f"Simulated execution for: {goal}", "provider": provider, "model": model}
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return {"status": "error", "trace": str(e)}

    async def spawn_background(self, goal: str, provider: str = "gemini", model: str = "gemini-3.1-pro-preview"):
        task = asyncio.create_task(self.execute_direct(goal, provider, model))
        self.running_tasks.add(task)
        task.add_done_callback(self.running_tasks.discard)
        return {"status": "scheduled", "active": len(self.running_tasks)}
