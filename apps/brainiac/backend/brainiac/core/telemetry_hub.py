import logging
import random

logger = logging.getLogger("TelemetryHub")

class TelemetryHub:
    def __init__(self):
        logger.info("📊 TelemetryHub Real-time Ingest Online.")

    def ingest(self, sensor_id: str, value: float):
        anomaly = value > 100.0
        if anomaly:
            logger.warning(f"⚠️ ANOMALY DETECTED in {sensor_id}: {value}")
        return {"sensor": sensor_id, "value": value, "anomaly": anomaly}
