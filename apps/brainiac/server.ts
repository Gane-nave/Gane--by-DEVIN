import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const triggerSosFunctionDeclaration: FunctionDeclaration = {
  name: "trigger_sos",
  description: "Trigger an emergency SOS broadcast across all satellite channels in case of emergency.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The current location or coordinates of the emergency."
      },
      reason: {
        type: Type.STRING,
        description: "The reason for the emergency broadcast."
      }
    },
    required: ["location"]
  }
};

const analyzeVisionFunctionDeclaration: FunctionDeclaration = {
  name: "analyze_vision",
  description: "Perform multi-spectrum analysis on visual data (thermal, IR, radar) to identify threats or objects.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      target: {
        type: Type.STRING,
        description: "The target or area to analyze."
      },
      spectrum: {
        type: Type.STRING,
        enum: ["THERMAL", "INFRARED", "RADAR", "OPTICAL"],
        description: "The specific spectrum to prioritize."
      }
    },
    required: ["target"]
  }
};

const hardenSystemFunctionDeclaration: FunctionDeclaration = {
  name: "harden_system",
  description: "Initiate system-wide security hardening and zero-day threat scanning.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      level: {
        type: Type.STRING,
        enum: ["STANDARD", "ENHANCED", "MAXIMUM"],
        description: "The desired hardening level."
      }
    },
    required: ["level"]
  }
};

const generateCreativeFunctionDeclaration: FunctionDeclaration = {
  name: "generate_creative",
  description: "Generate multimodal content including images, speech, or music based on a prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["IMAGE", "SPEECH", "MUSIC"],
        description: "The type of content to generate."
      },
      prompt: {
        type: Type.STRING,
        description: "The creative prompt."
      }
    },
    required: ["type", "prompt"]
  }
};

// Agent Fabric Health Monitoring
interface AgentHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'unresponsive' | 'failed';
  lastHeartbeat: number;
  endpoint: string;
  failures: number;
}

class AgentRegistry {
  private agents: Map<string, AgentHealthStatus> = new Map();

  register(id: string, name: string, endpoint: string) {
    this.agents.set(id, {
      id,
      name,
      status: 'healthy',
      lastHeartbeat: Date.now(),
      endpoint,
      failures: 0
    });
  }

  heartbeat(id: string) {
    const agent = this.agents.get(id);
    if (agent) {
      agent.lastHeartbeat = Date.now();
      agent.status = 'healthy';
      agent.failures = 0;
    }
  }

  getAgents() {
    return Array.from(this.agents.values());
  }

  monitor() {
    setInterval(() => {
      const now = Date.now();
      for (const agent of this.agents.values()) {
        // If no heartbeat in 15 seconds, mark as unresponsive
        if (now - agent.lastHeartbeat > 15000) {
          agent.status = 'unresponsive';
          agent.failures += 1;
          if (agent.failures > 3) {
            agent.status = 'failed';
          }
        }
      }
    }, 5000); // Check every 5 seconds
  }
}

const agentRegistry = new AgentRegistry();
agentRegistry.monitor();

// Register some mock agents for demonstration
agentRegistry.register('agent-1', 'Telemetry Analyst', 'internal://telemetry');
agentRegistry.register('agent-2', 'Medical Content', 'internal://medical');
agentRegistry.register('agent-3', 'Orbital Nav', 'internal://nav');
agentRegistry.register('agent-4', 'Cyber Shield', 'internal://security');

// Simulate heartbeats for some agents
setInterval(() => {
  agentRegistry.heartbeat('agent-1');
  agentRegistry.heartbeat('agent-3');
  // agent-2 and agent-4 will eventually fail
}, 10000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "OmniKernel Online", timestamp: new Date().toISOString() });
  });

  // God Agent Execution Bridge
  app.post("/api/agent/execute", async (req, res) => {
    const { goal, model = "gemini-3.1-pro-preview" } = req.body;
    try {
      const result = await ai.models.generateContent({
        model,
        contents: goal,
        config: {
          tools: [{ 
            functionDeclarations: [
              triggerSosFunctionDeclaration,
              analyzeVisionFunctionDeclaration,
              hardenSystemFunctionDeclaration,
              generateCreativeFunctionDeclaration
            ] 
          }]
        }
      });

      const functionCalls = result.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const args = call.args as any;
        
        let output = "";
        
        switch (call.name) {
          case 'trigger_sos':
            output = `EMERGENCY PROTOCOL ACTIVATED: SOS triggered for ${args.location}. Reason: ${args.reason || 'Not specified'}. Satellite mesh broadcasting on 6 channels. Incident ID: 7db2d63d3bb33d2e`;
            break;
          case 'analyze_vision':
            output = `VISION SCAN COMPLETE: Analysis of ${args.target} using ${args.spectrum || 'MULTI-SPECTRAL'} sensors. 4 objects detected, 0 immediate threats. Thermal signature stable.`;
            break;
          case 'harden_system':
            output = `SECURITY PROTOCOL: System hardening initiated at ${args.level} level. Zero-day scan active. Network encapsulation at 100%. Cyber-Shield status: HARDENED.`;
            break;
          case 'generate_creative':
            output = `CREATIVE ENGINE: ${args.type} generation initiated for prompt: "${args.prompt}". Neural synthesis in progress. Output will be available in the Creative-Engine module.`;
            break;
          default:
            output = `Unknown function call: ${call.name}`;
        }
        
        res.json({ status: "success", output });
        return;
      }

      res.json({ status: "success", output: result.text });
    } catch (error) {
      res.status(500).json({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  });

  // Agent Fabric Endpoints
  app.get("/api/agents/health", (req, res) => {
    res.json(agentRegistry.getAgents());
  });

  app.post("/api/agents/heartbeat", (req, res) => {
    const { id } = req.body;
    if (id) {
      agentRegistry.heartbeat(id);
      res.json({ status: "success" });
    } else {
      res.status(400).json({ status: "error", message: "Missing agent ID" });
    }
  });

  // Brainiac Core Endpoints
  app.get("/api/brainiac/status", (req, res) => {
    res.json({
      neuro_core: "OPTIMAL",
      orbital_nav: "ACTIVE",
      satlink: "CONNECTED",
      nexus_sync: "SYNCHRONIZED",
      telemetry: "STREAMING",
      cyber_shield: "HARDENED",
      creative: "READY",
      sonic: "READY",
      uptime: "142:12:05",
      threat_level: 0.02,
      active_missions: 3,
      memory_usage: "14.2 TB / 128 TB",
      compute_load: "12.5%",
      codename: "GENESIS",
      version: "1.0.1"
    });
  });

  app.post("/api/brainiac/nav/route", (req, res) => {
    const { start, end } = req.body;
    res.json({ distance: "14.57km", eta: "4.9min", waypoints: 12 });
  });

  app.post("/api/brainiac/sos", (req, res) => {
    res.json({ status: "sent", channels: 6, latency: "11.3ms", incident_id: "7db2d63d3bb33d2e" });
  });

  app.get("/api/brainiac/satlink/status", (req, res) => {
    res.json({
      status: "CONNECTED",
      uplink: "1.2 Gbps",
      downlink: "850 Mbps",
      latency: "18ms",
      satellites_in_view: 14,
      mesh_health: "99.8%"
    });
  });

  app.get("/api/brainiac/satlink/passes", (req, res) => {
    res.json([
      { id: "SAT-402", name: "Omni-Alpha", time: "14:20:05", duration: "8m 12s", elevation: "72°" },
      { id: "SAT-118", name: "Omni-Beta", time: "15:45:30", duration: "6m 45s", elevation: "45°" },
      { id: "SAT-089", name: "Omni-Gamma", time: "17:12:10", duration: "10m 02s", elevation: "88°" },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 OmniKernel Server running on http://localhost:${PORT}`);
  });
}

startServer();
